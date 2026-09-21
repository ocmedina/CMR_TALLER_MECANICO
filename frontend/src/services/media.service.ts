import { api } from './api';
import { WorkOrderMedia, MediaType } from '../types';

export const mediaService = {
  async upload(formData: FormData): Promise<WorkOrderMedia> {
    const res = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async uploadDirectUrl(data: {
    workOrderId: string;
    directUrl: string;
    caption?: string;
    type?: MediaType;
  }): Promise<WorkOrderMedia> {
    const res = await api.post('/media/upload', data);
    return res.data.data;
  },
};
