import prisma from '../models/prisma';
import { PaginationParams } from '../utils/pagination';
import { logAudit } from '../utils/audit';

interface CreateProjectInput {
    name: string;
    location: string;
    roadLength?: number;
    roadWidth?: number;
    surfaceType?: string;
    contractor?: string;
    notes?: string;
}

export class ProjectService {
    async create(engineerId: string, input: CreateProjectInput) {
        const project = await prisma.project.create({
            data: { ...input, engineerId },
            include: { engineer: { select: { id: true, name: true, email: true } } },
        });
        await logAudit(engineerId, 'PROJECT_CREATED', 'Project', project.id);
        return project;
    }

    async findAll(userId: string, role: string, params: PaginationParams, query?: string) {
        const where: any = {};

        // Role-based filtering
        if (role === 'ENGINEER') {
            where.engineerId = userId;
        } else if (role === 'CONTRACTOR') {
            where.assignments = { some: { contractorId: userId, status: 'ACTIVE' } };
        }
        // ADMIN sees all

        // Text search
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { location: { contains: query, mode: 'insensitive' } },
            ];
        }

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                include: {
                    engineer: { select: { id: true, name: true } },
                    _count: { select: { images: true, detections: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.project.count({ where }),
        ]);
        return { projects, total };
    }

    async findById(id: string) {
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                engineer: { select: { id: true, name: true, email: true } },
                images: true,
                detections: true,
                estimations: { orderBy: { createdAt: 'desc' }, take: 1 },
                assignments: {
                    include: { contractor: { select: { id: true, name: true } } },
                },
            },
        });
        if (!project) throw { status: 404, message: 'Project not found' };
        return project;
    }

    async update(id: string, userId: string, data: Partial<CreateProjectInput> & { status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' }) {
        await this.findById(id);
        const project = await prisma.project.update({ where: { id }, data });
        await logAudit(userId, 'PROJECT_UPDATED', 'Project', id);
        return project;
    }

    async delete(id: string, userId: string) {
        await this.findById(id);
        await prisma.project.delete({ where: { id } });
        await logAudit(userId, 'PROJECT_DELETED', 'Project', id);
        return { message: 'Project deleted successfully' };
    }

    async assignContractor(projectId: string, contractorId: string, assignedById: string) {
        const project = await this.findById(projectId);

        const contractor = await prisma.user.findUnique({ where: { id: contractorId } });
        if (!contractor || contractor.role !== 'CONTRACTOR') {
            throw { status: 400, message: 'Invalid contractor' };
        }

        const assignment = await prisma.projectAssignment.upsert({
            where: { projectId_contractorId: { projectId, contractorId } },
            create: { projectId, contractorId, assignedById },
            update: { status: 'ACTIVE', assignedById },
            include: { contractor: { select: { id: true, name: true, email: true } } },
        });

        await logAudit(assignedById, 'CONTRACTOR_ASSIGNED', 'ProjectAssignment', assignment.id, { projectId, contractorId });
        return assignment;
    }
}

export const projectService = new ProjectService();
