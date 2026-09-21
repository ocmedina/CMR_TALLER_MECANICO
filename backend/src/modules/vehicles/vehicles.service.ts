import { prisma } from '../../config/database';
import { generateQRCodeDataUrl } from '../../utils/qr.helper';

export class VehiclesService {
  async getByPlate(plate: string) {
    const formattedPlate = plate.toUpperCase().trim().replace(/[\s-]/g, '');
    const vehicle = await prisma.vehicle.findUnique({
      where: { plate: formattedPlate },
      include: {
        client: true,
        workOrders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            media: true,
          },
        },
      },
    });

    return vehicle;
  }

  async getByQrToken(qrToken: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { qrToken },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        workOrders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            media: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado para el código QR proporcionado');
    }

    return vehicle;
  }

  async create(data: {
    plate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
    clientId: string;
  }) {
    const formattedPlate = data.plate.toUpperCase().trim().replace(/[\s-]/g, '');

    const existing = await prisma.vehicle.findUnique({
      where: { plate: formattedPlate },
    });

    if (existing) {
      throw new Error(`El vehículo con patente ${formattedPlate} ya está registrado`);
    }

    return prisma.vehicle.create({
      data: {
        ...data,
        plate: formattedPlate,
      },
      include: {
        client: true,
      },
    });
  }

  async getQrCodeDataUrl(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { qrToken: true, plate: true },
    });

    if (!vehicle) {
      throw new Error('Vehículo no encontrado');
    }

    const qrDataUrl = await generateQRCodeDataUrl(vehicle.qrToken);
    return {
      plate: vehicle.plate,
      qrToken: vehicle.qrToken,
      qrDataUrl,
    };
  }
}
