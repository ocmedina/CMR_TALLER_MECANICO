import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { AppointmentsController } from './appointments.controller';

const router = Router();
const controller = new AppointmentsController();

router.use(authenticateJWT);
router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.patch('/:id/status', (req, res, next) => controller.updateStatus(req, res, next));

export default router;
