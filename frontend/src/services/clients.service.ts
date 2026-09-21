import { api } from './api';
import { Client } from '../types';

export const clientsService = {
  async getAll(query?: string): Promise<Client[]> {
    const res = await api.get('/clients', {
      params: query ? { search: query } : undefined,
    });
    return res.data.data;
  },

  async getById(id: string): Promise<Client> {
    const res = await api.get(`/clients/${id}`);
    return res.data.data;
  },

  async create(data: { name: string; phone: string; email?: string; documentId?: string; address?: string }): Promise<Client> {
    const res = await api.post('/clients', data);
    return res.data.data;
  },
};
