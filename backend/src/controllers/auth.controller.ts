import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sanitize } from '../utils/sanitize';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const result = await authService.register(data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message || 'Registration failed' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const data = sanitize(req.body);
            const result = await authService.login(data);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message || 'Login failed' });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token required' });
                return;
            }
            const result = await authService.refreshTokens(refreshToken);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message || 'Token refresh failed' });
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = sanitize(req.body);
            const result = await authService.forgotPassword(email);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = sanitize(req.body);
            const result = await authService.resetPassword(token, newPassword);
            res.json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message });
        }
    }

    async logout(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const result = await authService.logout(userId);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message || 'Logout failed' });
        }
    }
}

export const authController = new AuthController();
