import { Router } from 'express';
import { MediaController, uploadMiddleware } from './media.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const mediaController = new MediaController();

// POST /api/media/upload - Taller (Token)
router.post('/upload', authenticateJWT, requireRole(['ADMIN', 'MECHANIC', 'WORKSHOP_MANAGER']), uploadMiddleware, (req, res, next) =>
  mediaController.upload(req, res, next)
);

export default router;
