import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticateJWT } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const schema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() });

router.post('/:workOrderId', authenticateJWT, requireRole(['CLIENT']), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { clientId: true } });
    if (!user?.clientId) { res.status(404).json({ success: false, message: 'La cuenta no está vinculada a un cliente' }); return; }
    const order = await prisma.workOrder.findFirst({ where: { id: req.params.workOrderId, status: 'DELIVERED', vehicle: { clientId: user.clientId } } });
    if (!order) { res.status(404).json({ success: false, message: 'Orden entregada no encontrada' }); return; }
    const feedback = await prisma.feedback.create({ data: { ...data, workOrderId: order.id, clientId: user.clientId } });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) { next(error); }
});

export default router;
