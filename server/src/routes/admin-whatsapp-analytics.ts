import { Router } from 'express';
import WhatsAppSubscription from '../models/WhatsAppSubscription.js';
import { SubscriptionPlanService } from '../services/subscription-plan-service.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { requireUser } from '../utils/request.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalSubscriptions = await WhatsAppSubscription.countDocuments();
    const activeSubscriptions = await WhatsAppSubscription.getActiveSubscriptions();
    const expiredSubscriptions = await WhatsAppSubscription.getExpiredSubscriptions();
    const revenueStats = await WhatsAppSubscription.getRevenueStats();

    const planBreakdown = await WhatsAppSubscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const billingCycleBreakdown = await WhatsAppSubscription.aggregate([
      {
        $group: {
          _id: '$billingCycle',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const recentSubscriptions = await WhatsAppSubscription.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const expiringSoon = await WhatsAppSubscription.find({
      status: 'active',
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }).sort({ expiryDate: 1 });

    res.json({
      overview: {
        totalSubscriptions,
        activeSubscriptions: activeSubscriptions.length,
        expiredSubscriptions: expiredSubscriptions.length,
        totalRevenue: revenueStats.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0)
      },
      revenueByPlan: revenueStats,
      planBreakdown,
      billingCycleBreakdown,
      recentSubscriptions,
      expiringSoon: expiringSoon.length,
      expiringSoonList: expiringSoon
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/subscriptions', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, plan, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;

    const subscriptions = await WhatsAppSubscription.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await WhatsAppSubscription.countDocuments(filter);

    res.json({
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Subscriptions list error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.get('/subscriptions/:phone', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { phone } = req.params;
    const subscription = await WhatsAppSubscription.findByPhone(phone);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const plan = SubscriptionPlanService.getPlan(subscription.plan);
    
    res.json({
      subscription,
      planDetails: plan,
      isActive: subscription.isActive(),
      isExpired: subscription.isExpired(),
      daysRemaining: subscription.expiryDate 
        ? Math.ceil((subscription.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0
    });
  } catch (error) {
    console.error('Subscription detail error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
});

router.post('/subscriptions/:phone/renew', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { phone } = req.params;
    const { WhatsAppPaymentService } = await import('../services/whatsapp-payment-service.js');
    const paymentService = new WhatsAppPaymentService();
    
    const result = await paymentService.renewSubscription(phone);

    if (result.success) {
      res.json({ success: true, subscription: result.subscription });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Subscription renewal error:', error);
    res.status(500).json({ error: 'Failed to renew subscription' });
  }
});

router.post('/subscriptions/:phone/cancel', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { phone } = req.params;
    const { WhatsAppPaymentService } = await import('../services/whatsapp-payment-service.js');
    const paymentService = new WhatsAppPaymentService();
    
    const result = await paymentService.cancelSubscription(phone);

    if (result.success) {
      res.json({ success: true, subscription: result.subscription });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

router.get('/analytics/revenue', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await WhatsAppSubscription.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            plan: '$plan'
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalPayments = revenueData.reduce((sum, item) => sum + item.count, 0);

    res.json({
      period,
      totalRevenue,
      totalPayments,
      dailyRevenue: revenueData
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

router.get('/analytics/churn', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const cancelledSubscriptions = await WhatsAppSubscription.find({
      status: 'cancelled',
      updatedAt: { $gte: startDate }
    }).countDocuments();

    const expiredSubscriptions = await WhatsAppSubscription.find({
      status: 'expired',
      expiryDate: { $gte: startDate }
    }).countDocuments();

    const totalActive = await WhatsAppSubscription.countDocuments({ status: 'active' });

    const churnRate = totalActive > 0 
      ? ((cancelledSubscriptions + expiredSubscriptions) / totalActive) * 100 
      : 0;

    res.json({
      period,
      cancelledSubscriptions,
      expiredSubscriptions,
      totalActive,
      churnRate: churnRate.toFixed(2)
    });
  } catch (error) {
    console.error('Churn analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch churn analytics' });
  }
});

router.get('/analytics/plans', async (req: AuthRequest, res) => {
  try {
    const user = requireUser(req);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const planStats = await WhatsAppSubscription.aggregate([
      {
        $group: {
          _id: '$plan',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          revenue: { $sum: '$amount' },
          avgRevenue: { $avg: '$amount' }
        }
      }
    ]);

    const plansWithDetails = planStats.map(stat => {
      const plan = SubscriptionPlanService.getPlan(stat._id);
      return {
        ...stat,
        planName: plan?.name || stat._id,
        monthlyPrice: plan?.monthlyPrice || 0
      };
    });

    res.json(plansWithDetails);
  } catch (error) {
    console.error('Plan analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch plan analytics' });
  }
});

export default router;
