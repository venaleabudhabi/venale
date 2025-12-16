import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Venue from '../models/Venue';
import Item from '../models/Item';
import AddonGroup from '../models/AddonGroup';
import Order from '../models/Order';
import { validate } from '../middleware/validate';
import { generateOrderNumber, calculateTotals } from '../utils/order';

const router = express.Router();

// Validation schema
const createOrderSchema = z.object({
  body: z.object({
    venueSlug: z.string(),
    channel: z.enum(['QR', 'WEB']).default('QR'),
    customer: z.object({
      name: z.string().optional(),
      phone: z.string().regex(/^\+971[0-9]{9}$/, 'Invalid UAE phone number'),
    }),
    fulfillment: z.object({
      type: z.enum(['PICKUP', 'DELIVERY']),
      address: z.string().optional(),
      notes: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }),
    payment: z.object({
      method: z.enum(['COD', 'CARD']),
    }),
    items: z
      .array(
        z.object({
          itemKey: z.string(),
          qty: z.number().min(1),
          selectedAddons: z
            .array(
              z.object({
                groupKey: z.string(),
                optionKey: z.string(),
              })
            )
            .optional(),
        })
      )
      .min(1),
    isMember: z.boolean().default(false),
  }),
});

// POST /api/orders - Create order
router.post('/', validate(createOrderSchema), async (req, res) => {
  try {
    const { venueSlug, channel, customer, fulfillment, payment, items, isMember } = req.body;

    // Get venue
    const venue = await Venue.findOne({ slug: venueSlug });
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Check if shop is open
    if (!venue.isOpen) {
      return res.status(400).json({ error: 'Shop is currently closed. Orders cannot be placed at this time.' });
    }

    // Check operating hours (UAE timezone - GMT+4)
    const now = new Date();
    const uaeTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[uaeTime.getDay()] as keyof typeof venue.operatingHours;
    const todayHours = venue.operatingHours[currentDay];

    if (todayHours.closed) {
      return res.status(400).json({ error: `Shop is closed on ${currentDay}s. Please try another day.` });
    }

    // Convert time to minutes for proper comparison
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutes = uaeTime.getHours() * 60 + uaeTime.getMinutes();
    const openMinutes = timeToMinutes(todayHours.open);
    const closeMinutes = timeToMinutes(todayHours.close);
    const isWithinHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    if (!isWithinHours) {
      return res.status(400).json({ 
        error: `Shop is currently closed. Operating hours: ${todayHours.open} - ${todayHours.close}` 
      });
    }

    // Validate delivery
    if (fulfillment.type === 'DELIVERY' && !venue.delivery_enabled) {
      return res.status(400).json({ error: 'Delivery not available' });
    }

    // Validate payment method
    if (!venue.payment_methods.includes(payment.method)) {
      return res.status(400).json({ error: 'Payment method not accepted' });
    }

    // Fetch all items and addons
    const itemKeys = items.map((i: any) => i.itemKey);
    const dbItems = await Item.find({ venueId: venue._id, key: { $in: itemKeys } });

    const addonGroupKeys = items.flatMap((i: any) => i.selectedAddons?.map((a: any) => a.groupKey) || []);
    const dbAddonGroups = await AddonGroup.find({ venueId: venue._id, key: { $in: addonGroupKeys } });

    // Build order items with snapshot
    const orderItems = items.map((item: any) => {
      const dbItem = dbItems.find((d) => d.key === item.itemKey);
      if (!dbItem) throw new Error(`Item ${item.itemKey} not found`);

      const selectedAddons =
        item.selectedAddons?.map((addon: any) => {
          const group = dbAddonGroups.find((g) => g.key === addon.groupKey);
          if (!group) throw new Error(`Addon group ${addon.groupKey} not found`);
          const option = group.options.find((o) => o.key === addon.optionKey);
          if (!option) throw new Error(`Addon option ${addon.optionKey} not found`);

          return {
            groupKey: addon.groupKey,
            optionKey: addon.optionKey,
            name_en: option.name_en,
            name_ar: option.name_ar,
            price: option.price,
          };
        }) || [];

      return {
        itemKey: dbItem.key,
        name_en: dbItem.name_en,
        name_ar: dbItem.name_ar,
        price: dbItem.price,
        qty: item.qty,
        selectedAddons,
      };
    });

    // Calculate totals
    let totals = calculateTotals(orderItems, venue, isMember);

    // Add delivery fee if applicable
    if (fulfillment.type === 'DELIVERY') {
      totals.deliveryFee = venue.deliveryFee;
      totals.total += venue.deliveryFee;
      totals.total = Math.round(totals.total * 100) / 100;
    }

    // Check minimum order
    if (totals.subtotal < venue.minOrder) {
      return res.status(400).json({
        error: `Minimum order is ${venue.currency} ${venue.minOrder}`,
      });
    }

    // Generate order number (atomic operation)
    const orderNumber = await generateOrderNumber();

    // Create order with retry logic for duplicate order numbers
    let order;
    let retries = 3;
    
    while (retries > 0) {
      try {
        // Use MongoDB session for transaction
        const session = await mongoose.startSession();
        
        try {
          await session.startTransaction();

          order = new Order({
            venueId: venue._id,
            orderNumber,
            channel,
            customer,
            fulfillment,
            payment: {
              method: payment.method,
              status: payment.method === 'COD' ? 'PENDING' : 'PENDING',
            },
            items: orderItems,
            totals,
            isMember,
            statusTimeline: [{ status: 'PENDING', at: new Date() }],
            currentStatus: 'PENDING',
          });

          await order.save({ session });
          await session.commitTransaction();
          
          break; // Success, exit retry loop
        } catch (txError: any) {
          await session.abortTransaction();
          throw txError;
        } finally {
          session.endSession();
        }
      } catch (saveError: any) {
        // Handle duplicate order number (race condition)
        if (saveError.code === 11000 && saveError.keyPattern?.orderNumber) {
          retries--;
          if (retries === 0) {
            throw new Error('Failed to create order after multiple attempts. Please try again.');
          }
          // Regenerate order number and retry
          const newOrderNumber = await generateOrderNumber();
          order = order || new Order();
          order.orderNumber = newOrderNumber;
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * (4 - retries)));
        } else {
          throw saveError;
        }
      }
    }

    if (!order) {
      throw new Error('Failed to create order');
    }

    res.status(201).json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: totals.total,
      currency: venue.currency,
      paymentMethod: payment.method,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// GET /api/orders/:id - Get order status
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('venueId', 'name_en name_ar currency');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderNumber: order.orderNumber,
      currentStatus: order.currentStatus,
      statusTimeline: order.statusTimeline,
      items: order.items,
      totals: order.totals,
      fulfillment: order.fulfillment,
      payment: order.payment,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders/staff/list - Get all orders for staff
router.get('/staff/list', async (req, res) => {
  try {
    const orders = await Order.find({
      currentStatus: { $nin: ['COMPLETED', 'CANCELLED'] },
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PATCH /api/orders/staff/:id/status - Update order status
router.patch('/staff/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    order.currentStatus = status;
    order.statusTimeline.push({
      status,
      at: new Date(),
    });

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
