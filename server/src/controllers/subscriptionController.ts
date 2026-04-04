import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/asyncHandler';

export const subscriptionController = {
  // GET /api/subscription/status - Get current user's subscription status
  getStatus: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.refreshSubscriptionStatus();

    res.json({
      success: true,
      data: {
        plan: user.getEffectivePlan(),
        planExpiry: user.planExpiry,
        isActive: user.isActive,
        hasPremiumAccess: user.hasPremiumAccess(),
        features: getPlanFeatures(user.getEffectivePlan())
      }
    });
  }),

  // POST /api/subscribe - Subscribe to a plan
  subscribe: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { plan } = req.body;

    if (!['59', '119'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be 59 or 119'
      });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.upgradePlan(plan);

    res.json({
      success: true,
      message: `Successfully subscribed to ₹${plan}/month plan`,
      data: {
        plan: user.plan,
        planExpiry: user.planExpiry,
        features: getPlanFeatures(user.plan)
      }
    });
  }),

  // POST /api/subscription/cancel - Cancel subscription (downgrade to free)
  cancel: asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.plan = 'free';
    user.planExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        plan: 'free',
        features: getPlanFeatures('free')
      }
    });
  })
};

// Helper function to get plan features
function getPlanFeatures(plan: 'free' | '59' | '119') {
  const features = {
    free: {
      maxRecords: 10,
      basicInsights: true,
      advancedInsights: false,
      predictions: false,
      reports: false,
      support: 'basic'
    },
    '59': {
      maxRecords: -1, // unlimited
      basicInsights: true,
      advancedInsights: true,
      predictions: false,
      reports: false,
      support: 'priority'
    },
    '119': {
      maxRecords: -1, // unlimited
      basicInsights: true,
      advancedInsights: true,
      predictions: true,
      reports: true,
      support: 'premium'
    }
  };

  return features[plan];
}