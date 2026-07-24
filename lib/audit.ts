import { prisma } from '@/lib/prisma/client';

export interface LogAuditParams {
  actorId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Creates an entry in the AuditLog database table
 */
export async function logAuditEvent({
  actorId,
  action,
  resource,
  details,
  ipAddress,
}: LogAuditParams) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        actorId,
        action,
        resource,
        details: details || {},
        ipAddress,
      },
    });
    return auditLog;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
}
