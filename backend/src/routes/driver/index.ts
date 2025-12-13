import express from 'express';
import { z } from 'zod';
import Order from '../../models/Order';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = express.Router();

// Apply authentication to all driver routes
router.use(authenticate);
router.use(authorize('driver'));

// GET /api/driver/orders/assigned - Get orders assigned to this driver
router.get('/orders/assigned', async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({
      assignedDriver: req.user!._id,
      currentStatus: { $in: ['OUT_FOR_DELIVERY'] },
    }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assigned orders' });
  }
});

// PATCH /api/driver/orders/:id/status - Update order status (driver can only mark as COMPLETED)
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['COMPLETED']),
  }),
});

router.patch('/orders/:id/status', validate(updateStatusSchema), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      assignedDriver: req.user!._id,
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not assigned to you' });
    }

    order.currentStatus = status;
    order.statusTimeline.push({
      status,
      at: new Date(),
      by: req.user!._id,
    });

    await order.save();

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
