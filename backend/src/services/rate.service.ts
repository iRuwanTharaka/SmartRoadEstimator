import prisma from '../models/prisma';
import { PaginationParams } from '../utils/pagination';
import { logAudit } from '../utils/audit';

type RateCategory = 'material' | 'labor' | 'equipment';

export class RateService {
    // ─── Material ────────────────────────────────────────────
    async getMaterials(params: PaginationParams) {
        const [items, total] = await Promise.all([
            prisma.rateMaterial.findMany({
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { name: 'asc' },
            }),
            prisma.rateMaterial.count(),
        ]);
        return { items, total };
    }

    async createMaterial(userId: string, data: { name: string; unit: string; costPerUnit: number }) {
        const item = await prisma.rateMaterial.create({ data });
        await logAudit(userId, 'RATE_CREATED', 'RateMaterial', item.id);
        return item;
    }

    async updateMaterial(userId: string, id: string, data: { name?: string; unit?: string; costPerUnit?: number }) {
        const item = await prisma.rateMaterial.update({ where: { id }, data });
        await logAudit(userId, 'RATE_UPDATED', 'RateMaterial', id);
        return item;
    }

    async deleteMaterial(userId: string, id: string) {
        await prisma.rateMaterial.delete({ where: { id } });
        await logAudit(userId, 'RATE_DELETED', 'RateMaterial', id);
        return { message: 'Material rate deleted' };
    }

    // ─── Labor ───────────────────────────────────────────────
    async getLabor(params: PaginationParams) {
        const [items, total] = await Promise.all([
            prisma.rateLabor.findMany({
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { name: 'asc' },
            }),
            prisma.rateLabor.count(),
        ]);
        return { items, total };
    }

    async createLabor(userId: string, data: { name: string; unit: string; costPerHour: number }) {
        const item = await prisma.rateLabor.create({ data });
        await logAudit(userId, 'RATE_CREATED', 'RateLabor', item.id);
        return item;
    }

    async updateLabor(userId: string, id: string, data: { name?: string; unit?: string; costPerHour?: number }) {
        const item = await prisma.rateLabor.update({ where: { id }, data });
        await logAudit(userId, 'RATE_UPDATED', 'RateLabor', id);
        return item;
    }

    async deleteLabor(userId: string, id: string) {
        await prisma.rateLabor.delete({ where: { id } });
        await logAudit(userId, 'RATE_DELETED', 'RateLabor', id);
        return { message: 'Labor rate deleted' };
    }

    // ─── Equipment ───────────────────────────────────────────
    async getEquipment(params: PaginationParams) {
        const [items, total] = await Promise.all([
            prisma.rateEquipment.findMany({
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { name: 'asc' },
            }),
            prisma.rateEquipment.count(),
        ]);
        return { items, total };
    }

    async createEquipment(userId: string, data: { name: string; unit: string; costPerUse: number }) {
        const item = await prisma.rateEquipment.create({ data });
        await logAudit(userId, 'RATE_CREATED', 'RateEquipment', item.id);
        return item;
    }

    async updateEquipment(userId: string, id: string, data: { name?: string; unit?: string; costPerUse?: number }) {
        const item = await prisma.rateEquipment.update({ where: { id }, data });
        await logAudit(userId, 'RATE_UPDATED', 'RateEquipment', id);
        return item;
    }

    async deleteEquipment(userId: string, id: string) {
        await prisma.rateEquipment.delete({ where: { id } });
        await logAudit(userId, 'RATE_DELETED', 'RateEquipment', id);
        return { message: 'Equipment rate deleted' };
    }

    // ─── All Rates ───────────────────────────────────────────
    async getAllRates() {
        const [materials, labor, equipment] = await Promise.all([
            prisma.rateMaterial.findMany({ orderBy: { name: 'asc' } }),
            prisma.rateLabor.findMany({ orderBy: { name: 'asc' } }),
            prisma.rateEquipment.findMany({ orderBy: { name: 'asc' } }),
        ]);
        return { materials, labor, equipment };
    }
}

export const rateService = new RateService();
