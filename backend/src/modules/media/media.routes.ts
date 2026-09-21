import { Router } from 'express';
import { MediaController, uploadMiddleware } from './media.controller';
import { authenticateJWT } from '../../middlewares/auth.middleware';

const router = Router();
const mediaController = new MediaController();

// POST /api/media/upload - Taller (Token)
router.post('/upload', authenticateJWT, uploadMiddleware, (req, res, next) =>
  mediaController.upload(req, res, next)
);

export default router;
