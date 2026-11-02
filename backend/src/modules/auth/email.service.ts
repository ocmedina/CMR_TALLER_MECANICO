import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    console.warn('SMTP no configurado; no se envió el correo de recuperación.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'Restablece tu contraseña',
    text: `Restablece tu contraseña usando este enlace: ${resetUrl}. El enlace vence en 60 minutos.`,
  });
}

export async function sendClientInvitationEmail(email: string, name: string, inviteUrl: string): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    console.warn('SMTP no configurado; no se envió la invitación de cliente.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'Activá tu cuenta de cliente',
    text: `Hola ${name}. El taller creó tu cuenta. Definí tu contraseña desde este enlace: ${inviteUrl}. El enlace vence en 60 minutos.`,
  });
}
