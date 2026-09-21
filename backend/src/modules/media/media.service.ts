import { MediaType } from '@prisma/client';
import { prisma } from '../../config/database';

export class MediaService {
  async saveMedia(data: {
    workOrderId: string;
    url: string;
    publicId?: string;
    type: MediaType;
    caption?: string;
  }) {
    const order = await prisma.workOrder.findUnique({
      where: { id: data.workOrderId },
    });

    if (!order) {
      throw new Error('Orden de trabajo no encontrada para asociar la fotografía');
    }

    return prisma.workOrderMedia.create({
      data: {
        workOrderId: data.workOrderId,
        url: data.url,
        publicId: data.publicId,
        type: data.type,
        caption: data.caption,
      },
    });
  }

  async getByOrderId(workOrderId: string) {
    return prisma.workOrderMedia.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
