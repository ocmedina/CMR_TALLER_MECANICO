import { api } from './api';
import { Vehicle } from '../types';

export const vehiclesService = {
  async getByPlate(plate: string): Promise<Vehicle> {
    const res = await api.get(`/vehicles/by-plate/${encodeURIComponent(plate)}`);
    return res.data.data;
  },

  async getByQrToken(token: string): Promise<Vehicle> {
    const res = await api.get(`/vehicles/qr/${encodeURIComponent(token)}`);
    return res.data.data;
  },

  async create(data: {
    plate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
    clientId: string;
  }): Promise<Vehicle> {
    const res = await api.post('/vehicles', data);
    return res.data.data;
  },

  async getQrCode(id: string): Promise<{ plate: string; qrToken: string; qrDataUrl: string }> {
    const res = await api.get(`/vehicles/${id}/qr-code`);
    return res.data.data;
  },
};
