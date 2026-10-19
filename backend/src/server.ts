import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const app = createApp();

const server = app.listen(env.PORT, async () => {
  console.log(`Servidor Backend iniciado con éxito en http://localhost:${env.PORT}`);
  console.log(`Endpoints API disponibles en http://localhost:${env.PORT}/api`);
  console.log(`Health check: http://localhost:${env.PORT}/health`);

  try {
    await prisma.$connect();
    console.log('Conexión a la base de datos PostgreSQL exitosa');
  } catch (err) {
    console.warn('No se pudo conectar inmediatamente a PostgreSQL (verifica docker-compose o DATABASE_URL):', (err as Error).message);
  }
});

process.on('SIGTERM', async () => {
  console.log('Cerrando servidor HTTP y desconectando Prisma...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
