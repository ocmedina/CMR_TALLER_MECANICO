import { api } from './api';
import { Appointment, AppointmentStatus } from '../types';

export const appointmentsService = {
  async getAll(from?: string, to?: string): Promise<Appointment[]> {
    const res = await api.get('/appointments', {
      params: from || to ? { from, to } : undefined,
    });
    return res.data.data;
  },

  async create(data: {
    scheduledAt: string;
    durationMinutes: number;
    reason: string;
    notes?: string;
    clientId: string;
    vehicleId: string;
  }): Promise<Appointment> {
    const res = await api.post('/appointments', data);
    return res.data.data;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const res = await api.patch(`/appointments/${id}/status`, { status });
    return res.data.data;
  },
};
