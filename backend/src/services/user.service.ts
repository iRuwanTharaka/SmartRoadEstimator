import prisma from '../models/prisma';
import { hashPassword } from '../utils/password';
import { PaginationParams } from '../utils/pagination';

export class UserService {
    async findAll(params: PaginationParams) {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                select: {
                    id: true, name: true, email: true, phone: true,
                    organization: true, role: true, createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count(),
        ]);
        return { users, total };
    }

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, name: true, email: true, phone: true,
                organization: true, role: true, createdAt: true, updatedAt: true,
            },
        });
        if (!user) throw { status: 404, message: 'User not found' };
        return user;
    }

    async update(id: string, data: { name?: string; phone?: string; organization?: string; role?: 'ADMIN' | 'ENGINEER' | 'CONTRACTOR' }) {
        await this.findById(id);
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true, name: true, email: true, phone: true,
                organization: true, role: true, updatedAt: true,
            },
        });
    }

    async delete(id: string) {
        await this.findById(id);
        await prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }
}

export const userService = new UserService();
