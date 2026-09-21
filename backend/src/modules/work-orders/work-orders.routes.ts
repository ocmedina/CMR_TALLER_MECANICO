import { Router } from 'express';
import { WorkOrdersController } from './work-orders.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();
const workOrdersController = new WorkOrdersController();

// Todas las rutas de órdenes de trabajo requieren token de personal del taller
router.use(authenticateJWT);

// GET /api/work-orders - Lista todas las órdenes (soporta ?status=)
router.get('/', (req, res, next) => workOrdersController.getAll(req, res, next));

// GET /api/work-orders/:id - Detalle de la orden
router.get('/:id', (req, res, next) => workOrdersController.getById(req, res, next));

// POST /api/work-orders - Crea nueva orden de trabajo
router.post('/', (req, res, next) => workOrdersController.create(req, res, next));

// PATCH /api/work-orders/:id/status - Actualiza estado operativo
router.patch('/:id/status', (req, res, next) => workOrdersController.updateStatus(req, res, next));

// POST /api/work-orders/:id/items - Agrega repuesto o mano de obra
router.post('/:id/items', (req, res, next) => workOrdersController.addItem(req, res, next));

export default router;
