import axios from 'axios';
import prisma from '../models/prisma';
import { env } from '../config';
import logger from '../config/logger';
import { logAudit } from '../utils/audit';

interface DetectionResult {
    x: number;
    y: number;
    width: number;
    height: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    label?: string;
}

export class AnalysisService {
    /**
     * Send images to the AI microservice for pothole detection.
     * Includes retry logic, timeout config, and fallback on failure.
     */
    async runAnalysis(projectId: string, userId: string) {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { images: true },
        });
        if (!project) throw { status: 404, message: 'Project not found' };
        if (project.images.length === 0) throw { status: 400, message: 'No images to analyze' };

        const imageUrls = project.images.map((img) => img.imageUrl);
        let allDetections: DetectionResult[] = [];

        for (const imageUrl of imageUrls) {
            const detections = await this.callAIService(imageUrl);
            allDetections = allDetections.concat(detections);
        }

        // Clear previous detections for this project
        await prisma.detection.deleteMany({ where: { projectId } });

        // Store new detections with calculated area
        const saved = await Promise.all(
            allDetections.map((d, i) =>
                prisma.detection.create({
                    data: {
                        projectId,
                        x: d.x,
                        y: d.y,
                        width: d.width,
                        height: d.height,
                        area: d.width * d.height,
                        severity: d.severity,
                        label: d.label || `Pothole #${i + 1}`,
                    },
                })
            )
        );

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'IN_PROGRESS' },
        });

        await logAudit(userId, 'AI_ANALYSIS_RUN', 'Project', projectId, {
            imagesAnalyzed: imageUrls.length,
            detectionsFound: saved.length,
        });

        return {
            projectId,
            imagesAnalyzed: imageUrls.length,
            potholes: saved,
        };
    }

    /**
     * Call the Python AI microservice with retry logic and timeout.
     */
    private async callAIService(imageUrl: string, attempt: number = 1): Promise<DetectionResult[]> {
        try {
            const response = await axios.post(
                `${env.ai.serviceUrl}/detect`,
                { image_url: imageUrl },
                { timeout: env.ai.timeout }
            );
            return response.data.detections || [];
        } catch (error: any) {
            logger.warn(`AI service call failed (attempt ${attempt}/${env.ai.retries}): ${error.message}`);

            if (attempt < env.ai.retries) {
                // Exponential backoff: 1s, 2s, 4s...
                await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
                return this.callAIService(imageUrl, attempt + 1);
            }

            // Fallback: return empty detections with a warning
            logger.error(`AI service unavailable after ${env.ai.retries} retries. Falling back to empty detections.`);
            return [];
        }
    }

    /**
     * Update detections manually (engineer verification).
     */
    async updateDetections(
        projectId: string,
        userId: string,
        detections: Array<{
            id?: string;
            x: number;
            y: number;
            width: number;
            height: number;
            severity: 'LOW' | 'MEDIUM' | 'HIGH';
            label?: string;
        }>
    ) {
        // Clear existing and re-create
        await prisma.detection.deleteMany({ where: { projectId } });

        const saved = await Promise.all(
            detections.map((d, i) =>
                prisma.detection.create({
                    data: {
                        projectId,
                        x: d.x,
                        y: d.y,
                        width: d.width,
                        height: d.height,
                        area: d.width * d.height,
                        severity: d.severity,
                        label: d.label || `Pothole #${i + 1}`,
                    },
                })
            )
        );

        await logAudit(userId, 'DETECTIONS_UPDATED', 'Project', projectId, {
            count: saved.length,
        });

        return saved;
    }

    async getDetections(projectId: string) {
        return prisma.detection.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
        });
    }
}

export const analysisService = new AnalysisService();
