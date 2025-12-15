import express from 'express';
import Order from '../../models/Order';
import { AuthRequest } from '../../middleware/auth';

const router = express.Router();

// Helper function to get date range
const getDateRange = (period: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { start: today, end: new Date() };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return { start: weekStart, end: new Date() };
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart, end: new Date() };
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return { start: yearStart, end: new Date() };
    default:
      return { start: today, end: new Date() };
  }
};

// GET /api/admin/analytics/summary
router.get('/summary', async (req: AuthRequest, res) => {
  try {
    const { period = 'today', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    // Get current period data
    const orders = await Order.find({
      venueId: req.user!.venueId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      currentStatus: { $ne: 'CANCELLED' }
    });

    // Get previous period for comparison
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
    const prevStart = new Date(dateRange.start.getTime() - periodLength);
    const prevEnd = new Date(dateRange.start);
    
    const prevOrders = await Order.find({
      venueId: req.user!.venueId,
      createdAt: { $gte: prevStart, $lt: prevEnd },
      currentStatus: { $ne: 'CANCELLED' }
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, o) => sum + o.totals.total, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.customer.phone)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.totals.total, 0);
    const prevOrderCount = prevOrders.length;
    const prevCustomers = new Set(prevOrders.map(o => o.customer.phone)).size;
    const prevAOV = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0;
    const customersChange = prevCustomers > 0 ? ((uniqueCustomers - prevCustomers) / prevCustomers) * 100 : 0;
    const aovChange = prevAOV > 0 ? ((avgOrderValue - prevAOV) / prevAOV) * 100 : 0;

    res.json({
      revenue: {
        current: totalRevenue,
        previous: prevRevenue,
        change: revenueChange
      },
      orders: {
        current: totalOrders,
        previous: prevOrderCount,
        change: ordersChange
      },
      customers: {
        current: uniqueCustomers,
        previous: prevCustomers,
        change: customersChange
      },
      aov: {
        current: avgOrderValue,
        previous: prevAOV,
        change: aovChange
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// GET /api/admin/analytics/revenue-trend
router.get('/revenue-trend', async (req: AuthRequest, res) => {
  try {
    const { period = 'week', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    const groupBy = period === 'year' ? { $month: '$createdAt' } : { $dayOfMonth: '$createdAt' };
    
    const trend = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          currentStatus: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totals.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ trend });
  } catch (error) {
    console.error('Revenue trend error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
});

// GET /api/admin/analytics/top-items
router.get('/top-items', async (req: AuthRequest, res) => {
  try {
    const { period = 'month', limit = 10, startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    const topItems = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          currentStatus: 'COMPLETED'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemKey',
          name: { $first: '$items.name_en' },
          name_ar: { $first: '$items.name_ar' },
          totalQty: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    res.json({ topItems });
  } catch (error) {
    console.error('Top items error:', error);
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
});

// GET /api/admin/analytics/low-items
router.get('/low-items', async (req: AuthRequest, res) => {
  try {
    const { period = 'month', limit = 10, startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    const lowItems = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          currentStatus: 'COMPLETED'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemKey',
          name: { $first: '$items.name_en' },
          name_ar: { $first: '$items.name_ar' },
          totalQty: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { totalQty: 1 } },
      { $limit: parseInt(limit as string) }
    ]);

    res.json({ lowItems });
  } catch (error) {
    console.error('Low items error:', error);
    res.status(500).json({ error: 'Failed to fetch low items' });
  }
});

// GET /api/admin/analytics/peak-hours
router.get('/peak-hours', async (req: AuthRequest, res) => {
  try {
    const { period = 'week', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    const peakHours = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $project: {
          hour: { $hour: '$createdAt' },
          dayOfWeek: { $dayOfWeek: '$createdAt' }
        }
      },
      {
        $group: {
          _id: { hour: '$hour', day: '$dayOfWeek' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1, '_id.hour': 1 } }
    ]);

    res.json({ peakHours });
  } catch (error) {
    console.error('Peak hours error:', error);
    res.status(500).json({ error: 'Failed to fetch peak hours' });
  }
});

// GET /api/admin/analytics/customers
router.get('/customers', async (req: AuthRequest, res) => {
  try {
    const { period = 'month', sort = 'orders', limit = 10, startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    const sortField: Record<string, 1 | -1> = sort === 'spending' ? { totalSpent: -1 } : { orderCount: -1 };

    const topCustomers = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          currentStatus: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: '$customer.phone',
          name: { $first: '$customer.name' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
          avgOrderValue: { $avg: '$totals.total' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' }
        }
      },
      { $sort: sortField },
      { $limit: parseInt(limit as string) }
    ]);

    // Calculate repeat vs new customers
    const allCustomers = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$customer.phone',
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const repeatCustomers = allCustomers.filter(c => c.orderCount > 1).length;
    const newCustomers = allCustomers.filter(c => c.orderCount === 1).length;

    res.json({
      topCustomers,
      stats: {
        total: allCustomers.length,
        repeat: repeatCustomers,
        new: newCustomers
      }
    });
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

// GET /api/admin/analytics/customer-insights - Advanced customer analytics
router.get('/customer-insights', async (req: AuthRequest, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    // RFM Analysis (Recency, Frequency, Monetary)
    const now = new Date();
    const rfmAnalysis = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          currentStatus: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: '$customer.phone',
          name: { $first: '$customer.name' },
          lastOrderDate: { $max: '$createdAt' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
          avgOrderValue: { $avg: '$totals.total' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          recency: {
            $divide: [
              { $subtract: [now, '$lastOrderDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          },
          frequency: '$orderCount',
          monetary: '$totalSpent',
          avgOrderValue: 1
        }
      }
    ]);

    // Segment customers based on RFM
    const segmentedCustomers = rfmAnalysis.map(customer => {
      let segment = '';
      const recency = customer.recency;
      const frequency = customer.frequency;
      const monetary = customer.monetary;

      if (recency <= 7 && frequency >= 5 && monetary >= 200) {
        segment = 'VIP';
      } else if (recency <= 14 && frequency >= 3) {
        segment = 'Loyal';
      } else if (recency <= 30 && frequency >= 2) {
        segment = 'Regular';
      } else if (recency <= 60 && frequency === 1) {
        segment = 'New';
      } else if (recency > 60) {
        segment = 'At Risk';
      } else {
        segment = 'Occasional';
      }

      return { ...customer, segment };
    });

    // Customer ordering patterns (by hour)
    const orderingPatterns = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: {
            phone: '$customer.phone',
            hour: { $hour: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.phone',
          preferredHours: {
            $push: {
              hour: '$_id.hour',
              count: '$count'
            }
          }
        }
      }
    ]);

    // High and low amount orders
    const orderAmountDistribution = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          currentStatus: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: null,
          avgOrder: { $avg: '$totals.total' },
          minOrder: { $min: '$totals.total' },
          maxOrder: { $max: '$totals.total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // High value orders (top 10%)
    const highValueOrders = await Order.find({
      venueId: req.user!.venueId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      currentStatus: { $ne: 'CANCELLED' }
    })
      .sort({ 'totals.total': -1 })
      .limit(10)
      .select('orderNumber customer.name customer.phone totals.total createdAt items');

    // Low value orders (bottom 10%)
    const lowValueOrders = await Order.find({
      venueId: req.user!.venueId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      currentStatus: { $ne: 'CANCELLED' }
    })
      .sort({ 'totals.total': 1 })
      .limit(10)
      .select('orderNumber customer.name customer.phone totals.total createdAt items');

    // Order frequency distribution
    const orderFrequency = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }
      },
      {
        $group: {
          _id: '$customer.phone',
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$orderCount',
          customerCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Customer lifetime value
    const lifetimeValue = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          currentStatus: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: '$customer.phone',
          name: { $first: '$customer.name' },
          totalSpent: { $sum: '$totals.total' },
          orderCount: { $sum: 1 },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalSpent: 1,
          orderCount: 1,
          customerAge: {
            $divide: [
              { $subtract: ['$lastOrder', '$firstOrder'] },
              1000 * 60 * 60 * 24 // Days
            ]
          }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Segment statistics
    const segmentStats = segmentedCustomers.reduce((acc: any, customer: any) => {
      if (!acc[customer.segment]) {
        acc[customer.segment] = { count: 0, totalRevenue: 0, avgFrequency: 0 };
      }
      acc[customer.segment].count++;
      acc[customer.segment].totalRevenue += customer.monetary;
      acc[customer.segment].avgFrequency += customer.frequency;
      return acc;
    }, {});

    // Calculate averages
    Object.keys(segmentStats).forEach(segment => {
      segmentStats[segment].avgFrequency = 
        segmentStats[segment].avgFrequency / segmentStats[segment].count;
    });

    res.json({
      rfmAnalysis: segmentedCustomers.slice(0, 20),
      segmentStats,
      orderingPatterns: orderingPatterns.slice(0, 10),
      orderAmountDistribution: orderAmountDistribution[0] || {},
      highValueOrders,
      lowValueOrders,
      orderFrequency,
      lifetimeValue
    });
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
});

// GET /api/admin/analytics/payment-methods
router.get('/payment-methods', async (req: AuthRequest, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = { start: new Date(startDate as string), end: new Date(endDate as string) };
    } else {
      dateRange = getDateRange(period as string);
    }

    const paymentMethods = await Order.aggregate([
      {
        $match: {
          venueId: req.user!.venueId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          currentStatus: { $ne: 'CANCELLED' }
        }
      },
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          revenue: { $sum: '$totals.total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ paymentMethods });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

export default router;
