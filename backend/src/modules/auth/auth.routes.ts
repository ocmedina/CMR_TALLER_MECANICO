import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - Público
router.post('/login', (req, res, next) => authController.login(req, res, next));

// GET /api/auth/profile - Protegido
router.get('/profile', authenticateJWT, (req, res, next) => authController.profile(req, res, next));

export default router;
