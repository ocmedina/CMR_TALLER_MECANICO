import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { UsersService } from './users.service';

const usersService = new UsersService();
const roleSchema = z.nativeEnum(Role);
const userFieldsSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: roleSchema,
  active: z.boolean().optional(),
  phone: z.string().min(6).optional(),
  documentId: z.string().optional(),
  address: z.string().optional(),
});
const createUserSchema = userFieldsSchema.superRefine((data, context) => {
  if (data.role !== Role.CLIENT && !data.password) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'La contraseña es obligatoria para el personal' });
  }
});
const updateUserSchema = userFieldsSchema.partial().extend({
  password: z.string().min(6).optional(),
});

export class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: await usersService.getAll(req.query.search as string | undefined) });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await usersService.getById(req.params.id) }); } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      res.status(201).json({ success: true, data: await usersService.create(data) });
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      res.json({ success: true, data: await usersService.update(req.params.id, data) });
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.id === req.params.id) throw new Error('No puedes eliminar tu propio usuario');
      await usersService.remove(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}
