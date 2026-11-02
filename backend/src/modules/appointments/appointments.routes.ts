import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { AppointmentsController } from './appointments.controller';

const router = Router();
const controller = new AppointmentsController();

router.post('/request', authenticateJWT, requireRole(['CLIENT']), (req, res, next) => controller.createForClient(req, res, next));
router.use(authenticateJWT, requireRole(['ADMIN', 'MECHANIC', 'RECEPTIONIST', 'WORKSHOP_MANAGER']));
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.patch('/:id/status', (req, res, next) => controller.updateStatus(req, res, next));

export default router;
