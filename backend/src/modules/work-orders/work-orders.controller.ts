import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus, ItemType } from '@prisma/client';
import { WorkOrdersService } from './work-orders.service';

const workOrdersService = new WorkOrdersService();

const createOrderSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  currentKm: z.number().int().nonnegative('El kilometraje debe ser mayor o igual a 0'),
  description: z.string().min(5, 'La descripción o motivo debe tener al menos 5 caracteres'),
  notes: z.string().optional(),
  mechanicId: z.string().uuid().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

const addItemSchema = z.object({
  type: z.nativeEnum(ItemType).default(ItemType.PART),
  description: z.string().min(2, 'La descripción del item es requerida'),
  quantity: z.number().int().positive('La cantidad debe ser positiva').default(1),
  unitPrice: z.number().nonnegative('El precio unitario debe ser mayor o igual a 0'),
});

export class WorkOrdersController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusParam = req.query.status as OrderStatus | undefined;
      const orders = await workOrdersService.getAll(statusParam);
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await workOrdersService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const newOrder = await workOrdersService.create(validatedData);
      res.status(201).json({
        success: true,
        message: 'Orden de trabajo creada exitosamente',
        data: newOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateStatusSchema.parse(req.body);
      const updatedOrder = await workOrdersService.updateStatus(req.params.id, validated.status);
      res.status(200).json({
        success: true,
        message: `Estado de orden actualizado a ${validated.status}`,
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = addItemSchema.parse(req.body);
      const item = await workOrdersService.addItem(req.params.id, validated);
      res.status(201).json({
        success: true,
        message: 'Item agregado a la orden exitosamente',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }
}
