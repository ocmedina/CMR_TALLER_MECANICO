import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentsService } from './appointments.service';

const appointmentsService = new AppointmentsService();

const createAppointmentSchema = z.object({
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(15).max(480).default(60),
  reason: z.string().min(3, 'El motivo debe tener al menos 3 caracteres'),
  notes: z.string().optional(),
  clientId: z.string().uuid('Cliente inválido'),
  vehicleId: z.string().uuid('Vehículo inválido'),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});

export class AppointmentsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const from = req.query.from ? new Date(String(req.query.from)) : undefined;
      const to = req.query.to ? new Date(String(req.query.to)) : undefined;
      const appointments = await appointmentsService.getAll(from, to);
      res.status(200).json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createAppointmentSchema.parse(req.body);
      const appointment = await appointmentsService.create(data);
      res.status(201).json({ success: true, message: 'Turno creado exitosamente', data: appointment });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = updateStatusSchema.parse(req.body);
      const appointment = await appointmentsService.updateStatus(req.params.id, status);
      res.status(200).json({ success: true, message: 'Estado del turno actualizado', data: appointment });
    } catch (error) {
      next(error);
    }
  }
}
