import { ApprovalStatus, OrderStatus, ItemType } from '@prisma/client';
import { prisma } from '../../config/database';
import { audit } from '../../utils/audit.helper';
import { notifyByEmail } from '../../utils/notification.helper';

export class WorkOrdersService {
  async getAll(status?: OrderStatus) {
    return prisma.workOrder.findMany({
      where: status ? { status } : undefined,
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
        mechanic: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: string) {
    const order = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
        mechanic: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
        media: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new Error('Orden de trabajo no encontrada');
    }

    return order;
  }

  async create(data: {
    vehicleId: string;
    currentKm: number;
    description: string;
    notes?: string;
    mechanicId?: string;
  }) {
    return prisma.workOrder.create({
      data: {
        ...data,
        status: OrderStatus.PENDING,
      },
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus, userId?: string) {
    const existing = await prisma.workOrder.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Orden de trabajo no encontrada');
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: { status },
      include: {
        vehicle: { include: { client: true } },
      },
    });
    await audit('STATUS_UPDATED', 'WorkOrder', id, userId, { from: existing.status, to: status }, id);
    await notifyByEmail(updated.vehicle.client?.email, `Actualización de tu orden #${updated.id}`, `El estado de tu vehículo cambió a ${status}.`);
    return updated;
  }

  async addItem(
    orderId: string,
    data: {
      type: ItemType;
      description: string;
      quantity: number;
      unitPrice: number;
    }
  ) {
    const existing = await prisma.workOrder.findUnique({ where: { id: orderId } });
    if (!existing) {
      throw new Error('Orden de trabajo no encontrada');
    }

    const subtotal = data.quantity * data.unitPrice;

    return prisma.workOrderItem.create({
      data: {
        workOrderId: orderId,
        type: data.type,
        description: data.description,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        subtotal,
      },
    });
  }

  async getForClient(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { clientId: true } });
    if (!user?.clientId) throw new Error('La cuenta no está vinculada a un cliente');
    return prisma.workOrder.findMany({
      where: { vehicle: { clientId: user.clientId } },
      include: { vehicle: true, items: true, media: true, mechanic: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async approveBudget(userId: string, orderId: string, status: ApprovalStatus, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { clientId: true } });
    if (!user?.clientId) throw new Error('La cuenta no está vinculada a un cliente');
    const order = await prisma.workOrder.findFirst({ where: { id: orderId, vehicle: { clientId: user.clientId } } });
    if (!order) throw new Error('Orden de trabajo no encontrada');
    const updated = await prisma.workOrder.update({
      where: { id: orderId },
      data: {
        budgetStatus: status,
        budgetApprovedAt: status === ApprovalStatus.APPROVED ? new Date() : null,
        budgetRejectedReason: status === ApprovalStatus.REJECTED ? reason : null,
      },
      include: { vehicle: true, items: true },
    });
    await audit('BUDGET_DECIDED', 'WorkOrder', orderId, userId, { status, reason }, orderId);
    return updated;
  }
}
