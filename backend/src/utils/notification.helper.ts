import nodemailer from 'nodemailer';
import { env } from '../config/env';

export async function notifyByEmail(to: string | null | undefined, subject: string, text: string) {
  if (!to || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    if (to) console.warn(`SMTP no configurado; no se envió notificación a ${to}.`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, text });
}
