import prisma from '../models/prisma';

type AuditAction = string;

export async function logAudit(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId: entityId || null,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
            },
        });
    } catch {
        // Audit logging should never break the main flow
        console.error('Failed to write audit log');
    }
}
