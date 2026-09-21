import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VehiclesService } from './vehicles.service';

const vehiclesService = new VehiclesService();

const createVehicleSchema = z.object({
  plate: z.string().min(3, 'La patente debe tener al menos 3 caracteres'),
  brand: z.string().min(2, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  clientId: z.string().uuid('ID de cliente inválido'),
});

export class VehiclesController {
  async getByPlate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicle = await vehiclesService.getByPlate(req.params.plate);
      if (!vehicle) {
        res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado con esa patente',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByQrToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicle = await vehiclesService.getByQrToken(req.params.token);
      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createVehicleSchema.parse(req.body);
      const newVehicle = await vehiclesService.create(validatedData);

      res.status(201).json({
        success: true,
        message: 'Vehículo registrado exitosamente',
        data: newVehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQrCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vehiclesService.getQrCodeDataUrl(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
