import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export async function audit(
  action: string,
  entity: string,
  entityId: string | undefined,
  userId: string | undefined,
  metadata?: Prisma.InputJsonValue,
  workOrderId?: string,
) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, userId, metadata, workOrderId },
  });
}
