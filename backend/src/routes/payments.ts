import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import Venue from '../models/Venue';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// POST /api/payments/checkout - Create Stripe Checkout session
router.post('/checkout', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('venueId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment.method !== 'CARD') {
      return res.status(400).json({ error: 'Order payment method is not CARD' });
    }

    if (order.payment.status === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const venue = order.venueId as any;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: venue.currency.toLowerCase(),
            product_data: {
              name: `Order ${order.orderNumber}`,
              description: `${order.items.length} item(s) from ${venue.name_en}`,
            },
            unit_amount: Math.round(order.totals.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/o/${order._id}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/o/${order._id}?payment=cancelled`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    // Save session ID
    order.payment.stripeSessionId = session.id;
    await order.save();

    res.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.payment.status = 'PAID';
        order.statusTimeline.push({ status: 'CONFIRMED', at: new Date() });
        order.currentStatus = 'CONFIRMED';
        await order.save();
      }
    }
  }

  res.json({ received: true });
});

export default router;
