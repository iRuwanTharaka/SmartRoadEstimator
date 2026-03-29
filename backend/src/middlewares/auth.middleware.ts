import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../models/prisma';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);

        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true },
        });

        if (!user) {
            res.status(401).json({ error: 'User no longer exists' });
            return;
        }

        req.user = { userId: user.id, role: user.role };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
