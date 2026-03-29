import prisma from '../models/prisma';
import { uploadImage as cloudinaryUpload, deleteImage } from '../utils/cloudinary';
import { logAudit } from '../utils/audit';

interface UploadInput {
    projectId: string;
    fileBuffer: Buffer;
    latitude?: number;
    longitude?: number;
    capturedAt?: string;
}

export class ImageService {
    async upload(userId: string, input: UploadInput) {
        // Verify project exists
        const project = await prisma.project.findUnique({ where: { id: input.projectId } });
        if (!project) throw { status: 404, message: 'Project not found' };

        // Upload to Cloudinary
        const result = await cloudinaryUpload(input.fileBuffer, `road-estimator/${input.projectId}`);

        // Store metadata
        const image = await prisma.image.create({
            data: {
                projectId: input.projectId,
                imageUrl: result.secure_url,
                publicId: result.public_id,
                latitude: input.latitude,
                longitude: input.longitude,
                capturedAt: input.capturedAt ? new Date(input.capturedAt) : null,
            },
        });

        await logAudit(userId, 'IMAGE_UPLOADED', 'Image', image.id, { projectId: input.projectId });
        return image;
    }

    async getByProject(projectId: string) {
        return prisma.image.findMany({
            where: { projectId },
            orderBy: { uploadedAt: 'desc' },
        });
    }

    async delete(imageId: string, userId: string) {
        const image = await prisma.image.findUnique({ where: { id: imageId } });
        if (!image) throw { status: 404, message: 'Image not found' };

        if (image.publicId) {
            await deleteImage(image.publicId);
        }

        await prisma.image.delete({ where: { id: imageId } });
        await logAudit(userId, 'IMAGE_DELETED', 'Image', imageId);
        return { message: 'Image deleted successfully' };
    }
}

export const imageService = new ImageService();
