import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

const authService = new AuthService();

const loginSchema = z.object({
  email: z.string().email('Formato de correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  audience: z.enum(['CLIENT', 'STAFF']).default('STAFF'),
});
const resetRequestSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({ token: z.string().min(20), password: z.string().min(6) });
const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  address: z.string().optional(),
  documentId: z.string().optional(),
});

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData.email, validatedData.password, validatedData.audience);

      res.status(200).json({
        success: true,
        message: 'Sesión iniciada exitosamente',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }
      const user = await authService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { email } = resetRequestSchema.parse(req.body);
        await authService.requestPasswordReset(email);
        res.json({ success: true, message: 'Si el correo existe, recibirás un enlace de recuperación.' });
      } catch (error) { next(error); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const data = resetPasswordSchema.parse(req.body);
        await authService.resetPassword(data.token, data.password);
        res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
      } catch (error) { next(error); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        if (!req.user) { res.status(401).json({ success: false, message: 'No autenticado' }); return; }
        const data = profileSchema.parse(req.body);
        res.json({ success: true, data: await authService.updateProfile(req.user.id, data) });
      } catch (error) { next(error); }
  }
}
