import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - Público
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.requestPasswordReset(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// GET /api/auth/profile - Protegido
router.get('/profile', authenticateJWT, (req, res, next) => authController.profile(req, res, next));
router.patch('/profile', authenticateJWT, (req, res, next) => authController.updateProfile(req, res, next));

export default router;
