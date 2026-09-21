import { prisma } from '../../config/database';

export class ClientsService {
  async getAll(query?: string) {
    return prisma.client.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
              { documentId: { contains: query } },
            ],
          }
        : undefined,
      include: {
        vehicles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: {
          include: {
            workOrders: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    return client;
  }

  async create(data: { name: string; phone: string; email?: string; documentId?: string; address?: string }) {
    if (data.documentId) {
      const existing = await prisma.client.findUnique({
        where: { documentId: data.documentId },
      });
      if (existing) {
        throw new Error('Ya existe un cliente con ese documento/DNI');
      }
    }

    return prisma.client.create({
      data,
    });
  }
}
