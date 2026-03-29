import prisma from '../models/prisma';
import { logAudit } from '../utils/audit';

interface EstimationResult {
    materialCost: number;
    laborCost: number;
    equipmentCost: number;
    totalCost: number;
    totalArea: number;
    breakdown: Record<string, unknown>[];
}

export class EstimateService {
    /**
     * Calculate cost estimation for a project based on detected damage area and current rates.
     *
     * Formula:
     *   material_cost  = SUM(material_rate × area_per_unit) across all materials
     *   labor_cost     = SUM(labor_rate × area_hours_factor)
     *   equipment_cost = SUM(equipment_rate × usage_count)
     *   total_cost     = material_cost + labor_cost + equipment_cost
     */
    async calculate(projectId: string, userId: string): Promise<EstimationResult> {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { detections: true },
        });
        if (!project) throw { status: 404, message: 'Project not found' };
        if (project.detections.length === 0) throw { status: 400, message: 'No detections found for this project' };

        // Calculate total damaged area
        const totalArea = project.detections.reduce((sum, d) => sum + d.area, 0);

        // Fetch current rates
        const [materials, labor, equipment] = await Promise.all([
            prisma.rateMaterial.findMany(),
            prisma.rateLabor.findMany(),
            prisma.rateEquipment.findMany(),
        ]);

        // Calculate material costs (rate × area factor)
        const materialBreakdown = materials.map((m) => {
            const quantity = Math.ceil(totalArea * 0.8); // Simplified: 80% of area needs material
            const cost = quantity * m.costPerUnit;
            return { name: m.name, unit: m.unit, quantity, rate: m.costPerUnit, cost };
        });
        const materialCost = materialBreakdown.reduce((sum, b) => sum + b.cost, 0);

        // Calculate labor costs (hours based on area)
        const laborHours = Math.ceil(totalArea * 2); // ~2 hours per m²
        const laborBreakdown = labor.map((l) => {
            const hours = Math.ceil(laborHours / labor.length);
            const cost = hours * l.costPerHour;
            return { name: l.name, unit: l.unit, hours, rate: l.costPerHour, cost };
        });
        const laborCost = laborBreakdown.reduce((sum, b) => sum + b.cost, 0);

        // Calculate equipment costs
        const equipmentBreakdown = equipment.map((e) => {
            const uses = Math.ceil(totalArea / 10); // ~1 use per 10m²
            const cost = uses * e.costPerUse;
            return { name: e.name, unit: e.unit, uses, rate: e.costPerUse, cost };
        });
        const equipmentCost = equipmentBreakdown.reduce((sum, b) => sum + b.cost, 0);

        const totalCost = materialCost + laborCost + equipmentCost;

        const breakdown = [
            ...materialBreakdown.map((b) => ({ ...b, category: 'Material' })),
            ...laborBreakdown.map((b) => ({ ...b, category: 'Labor' })),
            ...equipmentBreakdown.map((b) => ({ ...b, category: 'Equipment' })),
        ];

        // Store estimation
        const estimation = await prisma.estimation.create({
            data: {
                projectId,
                materialCost,
                laborCost,
                equipmentCost,
                totalCost,
                totalArea,
                breakdown: breakdown as any,
            },
        });

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'COMPLETED' },
        });

        await logAudit(userId, 'COST_ESTIMATED', 'Estimation', estimation.id, {
            projectId, totalCost, totalArea,
        });

        return { materialCost, laborCost, equipmentCost, totalCost, totalArea, breakdown };
    }

    async getByProject(projectId: string) {
        return prisma.estimation.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const estimateService = new EstimateService();
