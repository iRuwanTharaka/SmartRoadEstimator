import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { rateService } from '../services/rate.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { sanitize } from '../utils/sanitize';

export class RateController {
    // ─── Material ────────────────────────────────────────────
    async getMaterials(req: AuthRequest, res: Response): Promise<void> {
        try {
            const params = parsePagination(req.query as Record<string, unknown>);
            const { items, total } = await rateService.getMaterials(params);
            res.json(paginatedResponse(items, total, params));
        } catch (error: any) { res.status(500).json({ error: error.message }); }
    }
    async createMaterial(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const item = await rateService.createMaterial(req.user!.userId, data);
            res.status(201).json(item);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }
    async updateMaterial(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const item = await rateService.updateMaterial(req.user!.userId, req.params.id, data);
            res.json(item);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }
    async deleteMaterial(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await rateService.deleteMaterial(req.user!.userId, req.params.id);
            res.json(result);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }

    // ─── Labor ───────────────────────────────────────────────
    async getLabor(req: AuthRequest, res: Response): Promise<void> {
        try {
            const params = parsePagination(req.query as Record<string, unknown>);
            const { items, total } = await rateService.getLabor(params);
            res.json(paginatedResponse(items, total, params));
        } catch (error: any) { res.status(500).json({ error: error.message }); }
    }
    async createLabor(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const item = await rateService.createLabor(req.user!.userId, data);
            res.status(201).json(item);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }
    async updateLabor(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const item = await rateService.updateLabor(req.user!.userId, req.params.id, data);
            res.json(item);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }
    async deleteLabor(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await rateService.deleteLabor(req.user!.userId, req.params.id);
            res.json(result);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }

    // ─── Equipment ───────────────────────────────────────────
    async getEquipment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const params = parsePagination(req.query as Record<string, unknown>);
            const { items, total } = await rateService.getEquipment(params);
            res.json(paginatedResponse(items, total, params));
        } catch (error: any) { res.status(500).json({ error: error.message }); }
    }
    async createEquipment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const item = await rateService.createEquipment(req.user!.userId, data);
            res.status(201).json(item);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }
    async updateEquipment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const item = await rateService.updateEquipment(req.user!.userId, req.params.id, data);
            res.json(item);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }
    async deleteEquipment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await rateService.deleteEquipment(req.user!.userId, req.params.id);
            res.json(result);
        } catch (error: any) { res.status(error.status || 500).json({ error: error.message }); }
    }

    // ─── All ─────────────────────────────────────────────────
    async getAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            const rates = await rateService.getAllRates();
            res.json(rates);
        } catch (error: any) { res.status(500).json({ error: error.message }); }
    }
}

export const rateController = new RateController();
