import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../../config/database';

export class AppointmentsService {
  async getAll(from?: Date, to?: Date) {
    return prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: from,
          lt: to,
        },
      },
      include: {
        client: true,
        vehicle: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(data: {
    scheduledAt: Date;
    durationMinutes: number;
    reason: string;
    notes?: string;
    clientId: string;
    vehicleId: string;
  }) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, clientId: data.clientId },
    });
    if (!vehicle) {
      throw new Error('El vehículo no pertenece al cliente seleccionado');
    }

    return prisma.appointment.create({
      data,
      include: { client: true, vehicle: true },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { client: true, vehicle: true },
    });
    return appointment;
  }
}
