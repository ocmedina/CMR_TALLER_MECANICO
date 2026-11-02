import { prisma } from '../../config/database';
import { UsersService } from '../users/users.service';

export class ClientsService {
  private readonly usersService = new UsersService();
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

  async create(data: { name: string; phone: string; email?: string; documentId?: string; address?: string; createAccount?: boolean }) {
    if (data.documentId) {
      const existing = await prisma.client.findUnique({
        where: { documentId: data.documentId },
      });
      if (existing) {
        throw new Error('Ya existe un cliente con ese documento/DNI');
      }
    }

    if (data.createAccount) {
      if (!data.email) throw new Error('El email es obligatorio para crear el acceso del cliente');
      const user = await this.usersService.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        documentId: data.documentId,
        address: data.address,
        role: 'CLIENT',
      });
      return { ...user.client!, inviteUrl: user.inviteUrl };
    }

    return prisma.client.create({ data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      documentId: data.documentId,
      address: data.address,
    } });
  }
}
