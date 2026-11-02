import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import crypto from 'crypto';
import { sendPasswordResetEmail } from './email.service';

export class AuthService {
  async login(email: string, passwordPlain: string, audience: 'CLIENT' | 'STAFF' = 'STAFF') {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    if (!user.active) {
      throw new Error('La cuenta está desactivada');
    }
    const isClient = user.role === 'CLIENT';
    if ((audience === 'CLIENT' && !isClient) || (audience === 'STAFF' && isClient)) {
      throw new Error(audience === 'CLIENT'
        ? 'Esta cuenta no corresponde a un cliente'
        : 'Esta cuenta no corresponde al personal del taller');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        active: true,
        client: {
          select: {
            id: true,
            phone: true,
            documentId: true,
            address: true,
            vehicles: {
              select: {
                id: true, plate: true, brand: true, model: true, year: true,
                workOrders: {
                  select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    description: true,
                    budgetStatus: true,
                    budgetApprovedAt: true,
                    budgetRejectedReason: true,
                    updatedAt: true,
                    items: {
                      select: { id: true, type: true, description: true, quantity: true, unitPrice: true, subtotal: true },
                    },
                  },
                  orderBy: { updatedAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const resetUrl = `${env.FRONTEND_URL}/restablecer-contrasena?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  async resetPassword(rawToken: string, password: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new Error('El enlace de recuperación es inválido o expiró');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: passwordHash, active: true } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; address?: string; documentId?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { client: true } });
    if (!user) throw new Error('Usuario no encontrado');
    return prisma.$transaction(async (tx) => {
      if (user.client) {
        await tx.client.update({ where: { id: user.client.id }, data });
      }
      return tx.user.update({
        where: { id: userId },
        data: data.name ? { name: data.name } : {},
        select: { id: true, name: true, email: true, role: true, active: true },
      });
    });
  }
}
