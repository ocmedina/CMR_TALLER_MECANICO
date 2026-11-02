import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error capturado en middleware global:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Ya existe un registro con uno de los valores ingresados.' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'El registro solicitado no existe.' });
      return;
    }
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
};
