import { Router } from 'express';
import { VehiclesController } from './vehicles.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();
const vehiclesController = new VehiclesController();

// GET /api/vehicles/qr/:token - PÚBLICO (Para el portal del cliente por QR)
router.get('/qr/:token', (req, res, next) => vehiclesController.getByQrToken(req, res, next));

// Rutas protegidas para el personal del taller
router.use(authenticateJWT);

// GET /api/vehicles/by-plate/:plate
router.get('/by-plate/:plate', (req, res, next) => vehiclesController.getByPlate(req, res, next));

// POST /api/vehicles
router.post('/', (req, res, next) => vehiclesController.create(req, res, next));

// GET /api/vehicles/:id/qr-code
router.get('/:id/qr-code', (req, res, next) => vehiclesController.getQrCode(req, res, next));

export default router;
