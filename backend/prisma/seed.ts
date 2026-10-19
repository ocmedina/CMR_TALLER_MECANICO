import { PrismaClient, Role, OrderStatus, ItemType, MediaType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando la siembra de datos de prueba...');

  // 1. Limpiar datos existentes
  await prisma.workOrderMedia.deleteMany();
  await prisma.workOrderItem.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Usuarios (Admin y Mecánico)
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@taller.com',
      name: 'Carlos Administrador',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const mechanic = await prisma.user.create({
    data: {
      email: 'mecanico@taller.com',
      name: 'Juan Perez (Mecánico)',
      password: hashedPassword,
      role: Role.MECHANIC,
    },
  });

  console.log('Usuarios creados: admin@taller.com / mecanico@taller.com (clave: password123)');

  // 3. Crear Clientes
  const client1 = await prisma.client.create({
    data: {
      name: 'Martín Rodríguez',
      phone: '+54 9 11 4567-8901',
      email: 'martin.rodriguez@email.com',
      documentId: '38123456',
      address: 'Av. Corrientes 2450, CABA',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Lucía Fernández',
      phone: '+54 9 11 9876-5432',
      email: 'lucia.fernandez@email.com',
      documentId: '35654321',
      address: 'Calle San Martín 123, Vicente López',
    },
  });

  // 4. Crear Vehículos con Tokens QR
  const vehicle1 = await prisma.vehicle.create({
    data: {
      plate: 'AF123JK',
      brand: 'Toyota',
      model: 'Corolla Cross',
      year: 2022,
      color: 'Gris Plata',
      qrToken: 'demo-token-toyota-corolla',
      clientId: client1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      plate: 'AD789PO',
      brand: 'Volkswagen',
      model: 'Golf GTI',
      year: 2020,
      color: 'Blanco',
      qrToken: 'demo-token-vw-golf',
      clientId: client2.id,
    },
  });

  // 5. Crear Órdenes de Trabajo
  const order1 = await prisma.workOrder.create({
    data: {
      currentKm: 45000,
      description: 'Cambio de pastillas de freno delanteras, cambio de aceite sintético y filtros.',
      status: OrderStatus.IN_PROGRESS,
      vehicleId: vehicle1.id,
      mechanicId: mechanic.id,
      notes: 'Discos en buen estado, solo pastillas desgastadas al 10%.',
    },
  });

  await prisma.workOrderItem.createMany({
    data: [
      {
        workOrderId: order1.id,
        type: ItemType.PART,
        description: 'Juego Pastillas de Freno Delanteras Bosch',
        quantity: 1,
        unitPrice: 52000,
        subtotal: 52000,
      },
      {
        workOrderId: order1.id,
        type: ItemType.PART,
        description: 'Aceite Sintético Motul 5W30 4L',
        quantity: 1,
        unitPrice: 48000,
        subtotal: 48000,
      },
      {
        workOrderId: order1.id,
        type: ItemType.LABOR,
        description: 'Mano de obra servicio de frenos y fluidos',
        quantity: 1,
        unitPrice: 35000,
        subtotal: 35000,
      },
    ],
  });

  await prisma.workOrderMedia.createMany({
    data: [
      {
        workOrderId: order1.id,
        url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        type: MediaType.DISASSEMBLY,
        caption: 'Pastillas desgastadas antes de desmontar',
      },
      {
        workOrderId: order1.id,
        url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
        type: MediaType.NEW_PART,
        caption: 'Pastillas nuevas listas para instalación',
      },
    ],
  });

  console.log('Base de datos sembrada con éxito con datos de prueba realistas.');
}

main()
  .catch((e) => {
    console.error('Error durante la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
