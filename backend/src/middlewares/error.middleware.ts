import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

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

  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
};
