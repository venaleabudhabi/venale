import express from 'express';
import { z } from 'zod';
import Category from '../../models/Category';
import Item from '../../models/Item';
import AddonGroup from '../../models/AddonGroup';
import Order from '../../models/Order';
import Venue from '../../models/Venue';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import analyticsRouter from './analytics';
import settingsRouter from './settings';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);
router.use(authorize('admin', 'manager'));

// Analytics routes
router.use('/analytics', analyticsRouter);

// Settings routes
router.use('/settings', settingsRouter);

// ===== CATEGORIES =====

// GET /api/admin/categories
router.get('/categories', async (req: AuthRequest, res) => {
  try {
    const categories = await Category.find({ venueId: req.user!.venueId }).sort({ sortOrder: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
const createCategorySchema = z.object({
  body: z.object({
    key: z.string(),
    name_en: z.string(),
    name_ar: z.string().optional(),
    sortOrder: z.number().optional(),
    imageUrl: z.string().optional(),
  }),
});

router.post('/categories', validate(createCategorySchema), async (req: AuthRequest, res) => {
  try {
    const category = new Category({
      venueId: req.user!.venueId,
      ...req.body,
    });
    await category.save();
    res.status(201).json({ category });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category key already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PATCH /api/admin/categories/:id
router.patch('/categories/:id', async (req: AuthRequest, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, venueId: req.user!.venueId },
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req: AuthRequest, res) => {
  try {
    // Check if category has items
    const itemCount = await Item.countDocuments({ categoryId: req.params.id });
    if (itemCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category with items' });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      venueId: req.user!.venueId,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== ITEMS =====

// GET /api/admin/items
router.get('/items', async (req: AuthRequest, res) => {
  try {
    const { categoryId } = req.query;
    const filter: any = { venueId: req.user!.venueId };
    if (categoryId) filter.categoryId = categoryId;

    const items = await Item.find(filter).populate('categoryId', 'name_en name_ar');
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/admin/items
router.post('/items', async (req: AuthRequest, res) => {
  try {
    const item = new Item({
      venueId: req.user!.venueId,
      ...req.body,
    });
    await item.save();
    res.status(201).json({ item });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Item key already exists' });
    }
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PATCH /api/admin/items/:id
router.patch('/items/:id', async (req: AuthRequest, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, venueId: req.user!.venueId },
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', async (req: AuthRequest, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      venueId: req.user!.venueId,
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ===== ADDON GROUPS =====

// GET /api/admin/addons
router.get('/addons', async (req: AuthRequest, res) => {
  try {
    const addonGroups = await AddonGroup.find({ venueId: req.user!.venueId });
    res.json({ addonGroups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addon groups' });
  }
});

// POST /api/admin/addons
router.post('/addons', async (req: AuthRequest, res) => {
  try {
    const addonGroup = new AddonGroup({
      venueId: req.user!.venueId,
      ...req.body,
    });
    await addonGroup.save();
    res.status(201).json({ addonGroup });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Addon group key already exists' });
    }
    res.status(500).json({ error: 'Failed to create addon group' });
  }
});

// PATCH /api/admin/addons/:id
router.patch('/addons/:id', async (req: AuthRequest, res) => {
  try {
    const addonGroup = await AddonGroup.findOneAndUpdate(
      { _id: req.params.id, venueId: req.user!.venueId },
      req.body,
      { new: true }
    );
    if (!addonGroup) {
      return res.status(404).json({ error: 'Addon group not found' });
    }
    res.json({ addonGroup });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update addon group' });
  }
});

// DELETE /api/admin/addons/:id
router.delete('/addons/:id', async (req: AuthRequest, res) => {
  try {
    const addonGroup = await AddonGroup.findOneAndDelete({
      _id: req.params.id,
      venueId: req.user!.venueId,
    });
    if (!addonGroup) {
      return res.status(404).json({ error: 'Addon group not found' });
    }
    res.json({ message: 'Addon group deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete addon group' });
  }
});

// ===== ORDERS =====

// GET /api/admin/orders
router.get('/orders', async (req: AuthRequest, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    const filter: any = { venueId: req.user!.venueId };
    if (status) filter.currentStatus = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('assignedDriver', 'name');

    const total = await Order.countDocuments(filter);

    res.json({ orders, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PATCH /api/admin/orders/:id/status
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED']),
    driverId: z.string().optional(),
  }),
});

router.patch('/orders/:id/status', validate(updateStatusSchema), async (req: AuthRequest, res) => {
  try {
    const { status, driverId } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      venueId: req.user!.venueId,
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.currentStatus = status;
    order.statusTimeline.push({
      status,
      at: new Date(),
      by: req.user!._id,
    });

    if (driverId) {
      order.assignedDriver = driverId as any;
    }

    await order.save();

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ===== VENUE SETTINGS =====

// GET /api/admin/venue/settings
router.get('/venue/settings', async (req: AuthRequest, res) => {
  try {
    const venue = await Venue.findById(req.user!.venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json({ venue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch venue settings' });
  }
});

// PATCH /api/admin/venue/settings
router.patch('/venue/settings', async (req: AuthRequest, res) => {
  try {
    const allowedFields = [
      'delivery_enabled',
      'vatPercent',
      'deliveryFee',
      'minOrder',
      'member_discount_percent',
      'name_ar',
      'member_discount_note_ar',
      'loyalty_note_ar',
    ];

    const updates: any = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const venue = await Venue.findByIdAndUpdate(req.user!.venueId, updates, { new: true });

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ venue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update venue settings' });
  }
});

export default router;
