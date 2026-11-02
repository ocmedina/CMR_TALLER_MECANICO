import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import clientsRoutes from './modules/clients/clients.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import workOrdersRoutes from './modules/work-orders/work-orders.routes';
import mediaRoutes from './modules/media/media.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import usersRoutes from './modules/users/users.routes';
import feedbackRoutes from './modules/feedback/feedback.routes';

export const createApp = (): Express => {
  const app = express();

  // Middlewares globales
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Archivos estáticos para uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'CRM Taller Mecanico API',
    });
  });

  // Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/vehicles', vehiclesRoutes);
  app.use('/api/work-orders', workOrdersRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/appointments', appointmentsRoutes);

  // Manejador global de errores
  app.use(errorHandler);

  return app;
};
