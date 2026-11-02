import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { audit } from '../../utils/audit.helper';
import { notifyByEmail } from '../../utils/notification.helper';

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

    const appointment = await prisma.appointment.create({
      data,
      include: { client: true, vehicle: true },
    });
    await notifyByEmail(appointment.client.email, 'Solicitud de turno recibida', `Tu solicitud para el ${appointment.scheduledAt.toISOString()} fue recibida.`);
    return appointment;
  }

  async updateStatus(id: string, status: AppointmentStatus, userId?: string) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { client: true, vehicle: true },
    });
    await audit('STATUS_UPDATED', 'Appointment', id, userId, { status });
    await notifyByEmail(appointment.client.email, 'Actualización de turno', `Tu turno cambió al estado ${status}.`);
    return appointment;
  }

  async createForClient(userId: string, data: Omit<Parameters<AppointmentsService['create']>[0], 'clientId'>) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { clientId: true } });
    if (!user?.clientId) throw new Error('La cuenta no está vinculada a un cliente');
    return this.create({ ...data, clientId: user.clientId });
  }
}
