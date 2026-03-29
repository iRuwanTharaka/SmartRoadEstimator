import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { parsePagination, paginatedResponse } from '../utils/pagination';

export class UserController {
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const params = parsePagination(req.query as Record<string, unknown>);
            const { users, total } = await userService.findAll(params);
            res.json(paginatedResponse(users, total, params));
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const user = await userService.findById(req.params.id);
            res.json(user);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const user = await userService.update(req.params.id, req.body);
            res.json(user);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const result = await userService.delete(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }
}

export const userController = new UserController();
