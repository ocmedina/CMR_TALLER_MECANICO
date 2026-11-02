import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import crypto from 'crypto';
import { env } from '../../config/env';
import { sendClientInvitationEmail } from '../auth/email.service';

type UserInput = {
  name: string;
  email: string;
  password?: string;
  role: Role;
  active?: boolean;
  phone?: string;
  documentId?: string;
  address?: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  clientId: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      phone: true,
      documentId: true,
      address: true,
    },
  },
} as const;

export class UsersService {
  async getAll(search?: string) {
    return prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async create(input: UserInput) {
    if (!input.password && input.role !== Role.CLIENT) throw new Error('La contraseña es obligatoria');
    if (input.role === Role.CLIENT && (!input.phone || input.phone.length < 6)) {
      throw new Error('El teléfono es obligatorio para los clientes');
    }

    const password = await bcrypt.hash(input.password || crypto.randomBytes(32).toString('hex'), 10);
    const result = await prisma.$transaction(async (tx) => {
      let clientId: string | undefined;
      if (input.role === Role.CLIENT) {
        const client = await tx.client.create({
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone!,
            documentId: input.documentId || undefined,
            address: input.address || undefined,
          },
        });
        clientId = client.id;
      }

      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password,
          role: input.role,
          active: input.role === Role.CLIENT ? false : input.active ?? true,
          clientId,
        },
        select: userSelect,
      });
      if (input.role !== Role.CLIENT) return { user, inviteUrl: null };

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await tx.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      const inviteUrl = `${env.FRONTEND_URL}/activar-cuenta?token=${rawToken}`;
      return { user, inviteUrl };
    });

    if (result.inviteUrl) {
      await sendClientInvitationEmail(result.user.email, result.user.name, result.inviteUrl);
    }
    return { ...result.user, ...(result.inviteUrl ? { inviteUrl: result.inviteUrl } : {}) };
  }

  async update(id: string, input: Partial<UserInput>) {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!existing) throw new Error('Usuario no encontrado');
    const nextRole = input.role ?? existing.role;
    if (nextRole === Role.CLIENT && (!existing.client && (!input.phone || input.phone.length < 6))) {
      throw new Error('El teléfono es obligatorio para convertir una cuenta en cliente');
    }

    const data: {
      name?: string;
      email?: string;
      role?: Role;
      active?: boolean;
      password?: string;
      clientId?: string | null;
    } = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.role !== undefined) data.role = input.role;
    if (input.active !== undefined) data.active = input.active;
    if (input.password) data.password = await bcrypt.hash(input.password, 10);

    return prisma.$transaction(async (tx) => {
    if (nextRole === Role.CLIENT && !existing.client) {
      const client = await tx.client.create({
        data: {
          name: input.name ?? existing.name,
          email: input.email ?? existing.email,
          phone: input.phone!,
          documentId: input.documentId || undefined,
          address: input.address || undefined,
        },
      });
      data.clientId = client.id;
    } else if (nextRole !== Role.CLIENT && existing.client) {
      data.clientId = null;
    }

    if (existing.client && nextRole === Role.CLIENT && (input.name !== undefined || input.email !== undefined || input.phone !== undefined || input.documentId !== undefined || input.address !== undefined)) {
        await tx.client.update({
          where: { id: existing.client.id },
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            documentId: input.documentId,
            address: input.address,
          },
        });
      }

      return tx.user.update({ where: { id }, data, select: userSelect });
    });
  }

  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) throw new Error('Usuario no encontrado');
    if (user.role === Role.ADMIN) throw new Error('No se puede eliminar un administrador');
    await prisma.user.delete({ where: { id } });
  }
}
