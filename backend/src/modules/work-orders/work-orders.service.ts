import { OrderStatus, ItemType } from '@prisma/client';
import { prisma } from '../../config/database';

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

  async updateStatus(id: string, status: OrderStatus) {
    const existing = await prisma.workOrder.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Orden de trabajo no encontrada');
    }

    return prisma.workOrder.update({
      where: { id },
      data: { status },
      include: {
        vehicle: true,
      },
    });
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
}
