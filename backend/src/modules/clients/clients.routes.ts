import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();
const clientsController = new ClientsController();

// Todas las rutas de clientes requieren token de personal del taller
router.use(authenticateJWT);

// GET /api/clients
router.get('/', (req, res, next) => clientsController.getAll(req, res, next));

// GET /api/clients/:id
router.get('/:id', (req, res, next) => clientsController.getById(req, res, next));

// POST /api/clients
router.post('/', (req, res, next) => clientsController.create(req, res, next));

export default router;
