import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { analysisService } from '../services/analysis.service';

export class AnalysisController {
    async run(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { projectId } = req.body;
            const result = await analysisService.runAnalysis(projectId, req.user!.userId);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async updateDetections(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { detections } = req.body;
            const result = await analysisService.updateDetections(
                req.params.projectId, req.user!.userId, detections
            );
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getDetections(req: AuthRequest, res: Response): Promise<void> {
        try {
            const detections = await analysisService.getDetections(req.params.projectId);
            res.json(detections);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

export const analysisController = new AnalysisController();
