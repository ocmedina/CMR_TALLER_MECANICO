import { Router } from 'express';
import { WorkOrdersController } from './work-orders.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const workOrdersController = new WorkOrdersController();

router.get('/mine', authenticateJWT, requireRole(['CLIENT']), (req, res, next) => workOrdersController.getMine(req, res, next));
router.patch('/:id/budget', authenticateJWT, requireRole(['CLIENT']), (req, res, next) => workOrdersController.approveBudget(req, res, next));

// Todas las rutas de órdenes de trabajo requieren token de personal del taller
router.use(authenticateJWT, requireRole(['ADMIN', 'MECHANIC', 'RECEPTIONIST', 'WORKSHOP_MANAGER']));

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
