import prisma from '../models/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logAudit } from '../utils/audit';
import crypto from 'crypto';

interface RegisterInput {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    password: string;
    role?: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR';
}

interface LoginInput {
    email: string;
    password: string;
}

export class AuthService {
    async register(input: RegisterInput) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw { status: 409, message: 'Email already registered' };
        }

        const hashedPassword = await hashPassword(input.password);

        const user = await prisma.user.create({
            data: {
                name: input.name,
                email: input.email,
                phone: input.phone,
                organization: input.organization,
                password: hashedPassword,
                role: input.role || 'ENGINEER',
            },
            select: { id: true, name: true, email: true, phone: true, organization: true, role: true, createdAt: true },
        });

        const accessToken = signAccessToken({ userId: user.id, role: user.role });
        const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        await logAudit(user.id, 'USER_REGISTERED', 'User', user.id);

        return { user, accessToken, refreshToken };
    }

    async login(input: LoginInput) {
        const user = await prisma.user.findUnique({ where: { email: input.email } });
        if (!user) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        const valid = await comparePassword(input.password, user.password);
        if (!valid) {
            throw { status: 401, message: 'Invalid email or password' };
        }

        const accessToken = signAccessToken({ userId: user.id, role: user.role });
        const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        await logAudit(user.id, 'USER_LOGIN', 'User', user.id);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                organization: user.organization,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshTokens(token: string) {
        const decoded = verifyRefreshToken(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || user.refreshToken !== token) {
            throw { status: 401, message: 'Invalid refresh token' };
        }

        const accessToken = signAccessToken({ userId: user.id, role: user.role });
        const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        return { accessToken, refreshToken: newRefreshToken };
    }

    async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal whether email exists
            return { message: 'If the email exists, a reset link has been sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpiry: resetExpiry,
            },
        });

        await logAudit(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id);

        // In production: send email with reset link containing the token
        return { message: 'If the email exists, a reset link has been sent.', resetToken };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw { status: 400, message: 'Invalid or expired reset token' };
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpiry: null,
                refreshToken: null, // Invalidate existing sessions
            },
        });

        await logAudit(user.id, 'PASSWORD_RESET_COMPLETED', 'User', user.id);

        return { message: 'Password has been reset successfully' };
    }

    async logout(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        await logAudit(userId, 'USER_LOGOUT', 'User', userId);

        return { message: 'Logged out successfully' };
    }
}

export const authService = new AuthService();
