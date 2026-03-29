import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { estimateService } from '../services/estimate.service';

export class EstimateController {
    async calculate(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { projectId } = req.body;
            const result = await estimateService.calculate(projectId, req.user!.userId);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getByProject(req: AuthRequest, res: Response): Promise<void> {
        try {
            const estimates = await estimateService.getByProject(req.params.projectId);
            res.json(estimates);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

export const estimateController = new EstimateController();
