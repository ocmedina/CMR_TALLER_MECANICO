import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: Array<'ADMIN' | 'MECHANIC' | 'RECEPTIONIST' | 'WORKSHOP_MANAGER' | 'CLIENT'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autenticado.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Acceso restringido. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
};
