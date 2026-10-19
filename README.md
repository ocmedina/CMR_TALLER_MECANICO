# CRM Taller Mecánico - Arquitectura & Guía de Desarrollo

Sistema Integral de Gestión de Taller Mecánico con Portal Público para Clientes vía Código QR.

---

## Guía para el Equipo de Desarrollo (8 Integrantes)

Este repositorio está configurado bajo un esquema **Monorepo** con dos aplicaciones principales:
- `/backend`: API REST en Node.js + TypeScript con Prisma ORM y PostgreSQL.
- `/frontend`: Aplicación Next.js (App Router) + React + Tailwind CSS (Panel Taller + Portal Cliente QR).

---

## Últimas mejoras implementadas

Actualización: **19 de octubre de 2026**

### Gestión de turnos

- Se incorporó el modelo `Appointment` en Prisma, relacionado con clientes y vehículos.
- Se agregaron los estados de turno:
  - `SCHEDULED`: programado.
  - `CONFIRMED`: confirmado.
  - `COMPLETED`: completado.
  - `CANCELLED`: cancelado.
  - `NO_SHOW`: el cliente no se presentó.
- Los turnos incluyen fecha y hora, duración, motivo y notas.
- Se agregaron índices para consultar rápidamente por fecha y estado.
- Se incorporó la migración `20261019120000_add_appointments`.
- El backend ahora expone endpoints autenticados para listar, crear y cambiar el estado de los turnos.
- El frontend incluye la pantalla `/turnos` y su servicio HTTP correspondiente.

### Mejoras del panel del taller

- Se actualizaron el dashboard y la navegación principal del panel.
- Se mejoraron las vistas de clientes, órdenes y escaneo de QR.
- Se agregó la navegación hacia la agenda de turnos.
- Se reforzó la experiencia responsive para utilizar el sistema desde dispositivos móviles.
- Se actualizaron estilos globales, tipografías, colores, tarjetas y estados visuales.
- Se incorporó el logo de la aplicación y se actualizó el manifiesto PWA.

### Portal público y flujo QR

- Se mejoró el portal público accesible mediante `/portal/[token]`.
- Se actualizaron las vistas de seguimiento para mostrar la información del vehículo y sus órdenes de trabajo de forma más clara.
- Se mantuvo el acceso público mediante token QR sin requerir inicio de sesión del cliente.

### Backend y configuración

- Se registró la ruta `/api/appointments` en la aplicación Express.
- La carga de variables de entorno ahora busca el archivo `.env` en la carpeta del backend y en la raíz del proyecto.
- Se mantiene la validación de variables de entorno mediante Zod antes de iniciar el servidor.
- Se centralizó el manejo de errores de la API y se mantuvo el health check en `/health`.
- El seed continúa creando usuarios, clientes, vehículos y órdenes de ejemplo para desarrollo.

---

## Requisitos Previos e Instalación

### 1. Requisitos
- **Node.js**: v20 o superior
- **Docker Desktop** (para la base de datos PostgreSQL local) o un PostgreSQL local corriendo en puerto `5432`

### 2. Clonar e Instalar Dependencias
```bash
# Clonar el repositorio
git clone <url-del-repo>
cd CMR_TALLER_MECANICO

# Instalar dependencias de todo el monorepo (raíz, backend y frontend)
npm install
```

### 3. Levantar PostgreSQL con Docker
```bash
cd backend
docker-compose up -d
```

### 4. Configurar Variables de Entorno
Copia los archivos de ejemplo:
```bash
# En backend
cp backend/.env.example backend/.env

# En frontend
cp frontend/.env.example frontend/.env
```

### 5. Generar Prisma y Sembrar Datos de Prueba
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Para aplicar las migraciones existentes en un entorno de producción:

```bash
npx prisma migrate deploy --schema backend/prisma/schema.prisma
```

### 6. Ejecutar en Modo Desarrollo
Puedes iniciar ambos simultáneamente desde la raíz o por separado:
```bash
# Ambos (Backend en http://localhost:4000 y Frontend en http://localhost:3000)
npm run dev

# O de forma independiente:
npm run dev:backend
npm run dev:frontend
```

---

## Arquitectura de Directorios

### Backend (`/backend`)
```
backend/
├── prisma/
│   ├── schema.prisma           # Tablas, relaciones y enums
│   ├── migrations/             # Historial de migraciones SQL
│   └── seed.ts                 # Script para cargar datos de prueba
├── src/
│   ├── config/                 # Zod envs y singleton de Prisma
│   │   ├── env.ts
│   │   └── database.ts
│   ├── middlewares/            # Middlewares globales
│   │   ├── auth.middleware.ts  # JWT
│   │   ├── role.middleware.ts  # Control de roles (ADMIN, MECHANIC)
│   │   └── error.middleware.ts # Manejador global de excepciones
│   ├── modules/                # Módulos por dominio
│   │   ├── auth/               # Registro, login y perfil
│   │   ├── clients/            # CRUD de clientes
│   │   ├── appointments/       # Gestión de turnos y estados
│   │   ├── vehicles/           # CRUD autos, búsqueda por patente y QR
│   │   ├── work-orders/        # Órdenes, estados Kanban y repuestos
│   │   └── media/              # Fotos Cloudinary/S3
│   ├── utils/                  # Helpers (qr.helper.ts)
│   ├── app.ts                  # Configuración de Express
│   └── server.ts               # Servidor HTTP
├── .env.example
├── docker-compose.yml          # PostgreSQL en local
├── package.json
└── tsconfig.json
```

### Frontend (`/frontend`)
```
frontend/
├── public/                     # Assets estáticos y manifiesto PWA
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Login para el personal del taller
│   │   ├── (taller)/           # Panel Privado del Taller
│   │   │   ├── layout.tsx      # Sidebar, Navbar y protección de sesión
│   │   │   ├── dashboard/      # Métricas e ingresos
│   │   │   ├── ordenes/        # Tablero Kanban y tabla de órdenes
│   │   │   ├── clientes/       # Clientes y vehículos asociados
│   │   │   ├── escanear/       # Escáner de QR y alta express
│   │   │   └── turnos/         # Agenda y estados de turnos
│   │   ├── (public)/portal/[token]/ # Portal del cliente por QR (sin login)
│   │   └── page.tsx            # Redirección inteligente
│   ├── components/ (ui, forms, qr)
│   ├── hooks/
│   ├── services/               # Clientes HTTP organizados por módulo
│   ├── types/                  # Tipos TypeScript
│   └── lib/                    # Utilidades generales
```

---

## Contratos de Endpoints de la API REST

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autenticación del personal (retorna JWT y rol) |
| `GET` | `/api/clients` | Taller (Token) | Listado y búsqueda de clientes |
| `POST` | `/api/clients` | Taller (Token) | Creación de nuevo cliente |
| `GET` | `/api/vehicles/by-plate/:plate` | Taller (Token) | Búsqueda rápida por patente |
| `GET` | `/api/vehicles/qr/:token` | Público | Ficha técnica e historial accesible vía QR |
| `GET` | `/api/work-orders` | Taller (Token) | Listado con filtro de estados para el Kanban |
| `POST` | `/api/work-orders` | Taller (Token) | Crea orden con kilometraje y descripción |
| `PATCH` | `/api/work-orders/:id/status` | Taller (Token) | Actualiza estado (ej: 'EN_PROCESO', 'LISTO') |
| `POST` | `/api/work-orders/:id/items` | Taller (Token) | Agrega repuestos o mano de obra a la orden |
| `POST` | `/api/media/upload` | Taller (Token) | Sube y vincula fotos de evidencias |
| `GET` | `/api/appointments` | Taller (Token) | Lista turnos, opcionalmente filtrados por fecha |
| `POST` | `/api/appointments` | Taller (Token) | Crea un turno validando cliente y vehículo |
| `PATCH` | `/api/appointments/:id/status` | Taller (Token) | Actualiza el estado de un turno |

---

## Flujo de Trabajo
1. **Recepción / Escaneo**: En `/escanear` se lee el QR del parabrisas o la patente. Si no existe, se abre el modal de alta express.
2. **Creación de Orden**: Se cargan km, fallas reportadas y fotos iniciales.
3. **Tablero Kanban**: En `/ordenes`, los mecánicos arrastran o cambian el estado y añaden repuestos/fotos.
4. **Agenda**: En `/turnos` se crean turnos asociados a un cliente y vehículo, y se actualiza su estado.
5. **Portal del Cliente**: El cliente consulta `/portal/[token]` en tiempo real sin requerir contraseña.
