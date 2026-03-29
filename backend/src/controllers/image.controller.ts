import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { imageService } from '../services/image.service';

export class ImageController {
    async upload(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'Image file is required' });
                return;
            }
            const image = await imageService.upload(req.user!.userId, {
                projectId: req.params.projectId,
                fileBuffer: req.file.buffer,
                latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
                longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
                capturedAt: req.body.capturedAt,
            });
            res.status(201).json(image);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getByProject(req: AuthRequest, res: Response): Promise<void> {
        try {
            const images = await imageService.getByProject(req.params.projectId);
            res.json(images);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await imageService.delete(req.params.id, req.user!.userId);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

export const imageController = new ImageController();
