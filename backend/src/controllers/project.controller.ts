import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { projectService } from '../services/project.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { sanitize } from '../utils/sanitize';

export class ProjectController {
    async create(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const project = await projectService.create(req.user!.userId, data);
            res.status(201).json(project);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getAll(req: AuthRequest, res: Response): Promise<void> {
        try {
            const params = parsePagination(req.query as Record<string, unknown>);
            const query = req.query.query as string | undefined;
            const { projects, total } = await projectService.findAll(
                req.user!.userId, req.user!.role, params, query
            );
            res.json(paginatedResponse(projects, total, params));
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getById(req: AuthRequest, res: Response): Promise<void> {
        try {
            const project = await projectService.findById(req.params.id);
            res.json(project);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async update(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const project = await projectService.update(req.params.id, req.user!.userId, data);
            res.json(project);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async delete(req: AuthRequest, res: Response): Promise<void> {
        try {
            const result = await projectService.delete(req.params.id, req.user!.userId);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async assignContractor(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { contractorId } = req.body;
            const result = await projectService.assignContractor(
                req.params.id, contractorId, req.user!.userId
            );
            res.status(201).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

export const projectController = new ProjectController();
