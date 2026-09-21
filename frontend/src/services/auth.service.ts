import { api } from './api';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, passwordPlain: string): Promise<LoginResponse> {
    const res = await api.post('/auth/login', { email, password: passwordPlain });
    const data = res.data.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('crm_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('crm_token');
    }
    return false;
  },
};
