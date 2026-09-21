import { api } from './api';
import { WorkOrder, OrderStatus, ItemType, WorkOrderItem } from '../types';

export const ordersService = {
  async getAll(status?: OrderStatus): Promise<WorkOrder[]> {
    const res = await api.get('/work-orders', {
      params: status ? { status } : undefined,
    });
    return res.data.data;
  },

  async getById(id: string): Promise<WorkOrder> {
    const res = await api.get(`/work-orders/${id}`);
    return res.data.data;
  },

  async create(data: {
    vehicleId: string;
    currentKm: number;
    description: string;
    notes?: string;
  }): Promise<WorkOrder> {
    const res = await api.post('/work-orders', data);
    return res.data.data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<WorkOrder> {
    const res = await api.patch(`/work-orders/${id}/status`, { status });
    return res.data.data;
  },

  async addItem(
    id: string,
    data: {
      type: ItemType;
      description: string;
      quantity: number;
      unitPrice: number;
    }
  ): Promise<WorkOrderItem> {
    const res = await api.post(`/work-orders/${id}/items`, data);
    return res.data.data;
  },
};
