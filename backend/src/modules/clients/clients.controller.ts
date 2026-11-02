import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ClientsService } from './clients.service';

const clientsService = new ClientsService();

const createClientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(6, 'El teléfono debe tener al menos 6 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  documentId: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  createAccount: z.boolean().optional(),
});

export class ClientsController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const clients = await clientsService.getAll(search);
      res.status(200).json({
        success: true,
        data: clients,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientsService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createClientSchema.parse(req.body);
      const newClient = await clientsService.create({
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || undefined,
        documentId: validatedData.documentId || undefined,
        address: validatedData.address || undefined,
        createAccount: validatedData.createAccount,
      });

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: newClient,
      });
    } catch (error) {
      next(error);
    }
  }
}
