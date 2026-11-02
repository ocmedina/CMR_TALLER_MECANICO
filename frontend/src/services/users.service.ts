import { api } from './api';
import { Role, User } from '../types';

export interface ManagedUser extends User {
  client?: { id: string; phone: string; documentId?: string; address?: string };
  inviteUrl?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role: Role;
  active?: boolean;
  phone?: string;
  documentId?: string;
  address?: string;
}

export const usersService = {
  async getAll(search?: string): Promise<ManagedUser[]> {
    const res = await api.get('/users', { params: search ? { search } : undefined });
    return res.data.data;
  },
  async create(data: UserPayload): Promise<ManagedUser> {
    const res = await api.post('/users', data);
    return res.data.data;
  },
  async update(id: string, data: Partial<UserPayload>): Promise<ManagedUser> {
    const res = await api.patch(`/users/${id}`, data);
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
