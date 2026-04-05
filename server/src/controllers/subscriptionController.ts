import { Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getRazorpayClient } from '../utils/razorpay.js';
import { CacheService } from '../services/cacheService.js';
import { RAZORPAY_PLAN_IDS } from '../utils/planConfig.js';
import { env } from '../config/env.js';

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
        subscriptionStatus: user.subscriptionStatus,
        hasPremiumAccess: user.hasPremiumAccess(),
        features: getPlanFeatures(user.getEffectivePlan())
      }
    });
  }),

  // POST /api/subscription/create - Create Razorpay Subscription
  create: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { plan } = req.body;
    if (!['pro', 'premium'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be pro or premium'
      });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const razorpay = getRazorpayClient();
    const planId = plan === 'pro' ? RAZORPAY_PLAN_IDS.pro : RAZORPAY_PLAN_IDS.premium;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120, // max 10 years
      notes: { userId: user._id.toString(), plan }
    });

    res.json({
      success: true,
      subscriptionId: subscription.id,
      plan_id: planId,
      key: env.RAZORPAY_KEY_ID
    });
  }),

  // POST /api/subscription/verify - Verify Subscription Payment
  verify: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

    if (!razorpay_payment_id || !razorpay_signature || !razorpay_subscription_id) {
      return res.status(400).json({ success: false, message: 'Missing payment parameters' });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: 'Payments are not configured' });
    }

    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_payment_id}|${razorpay_subscription_id}`);
    const expectedSignature = shasum.digest('hex');
    const expectedSignatureBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(razorpay_signature);

    const isValid = expectedSignatureBuf.length === signatureBuf.length && 
                   crypto.timingSafeEqual(expectedSignatureBuf, signatureBuf);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const razorpay = getRazorpayClient();
    const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
    const planFromNotes = (subscription.notes as Record<string, string>)?.plan as 'pro' | 'premium';
    const plan = ['pro', 'premium'].includes(planFromNotes) ? planFromNotes : 'pro';

    await user.upgradePlan(plan, razorpay_subscription_id);

    CacheService.invalidateUserCache(user._id.toString()).catch(console.error);

    res.json({
      success: true,
      message: `Successfully upgraded to ${plan}`,
      data: {
        plan: user.plan,
        planExpiry: user.planExpiry,
        subscriptionStatus: user.subscriptionStatus,
        features: getPlanFeatures(user.plan as any)
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

    if (user.subscriptionId) {
      const razorpay = getRazorpayClient();
      try {
        await razorpay.subscriptions.cancel(user.subscriptionId);
      } catch (error) {
        console.error('Failed to cancel subscription on Razorpay:', error);
      }
    }

    user.plan = 'free';
    user.isPremium = false;
    user.subscriptionStatus = 'cancelled';
    user.planExpiry = undefined;
    await user.save();

    CacheService.invalidateUserCache(user._id.toString()).catch(console.error);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        plan: 'free',
        features: getPlanFeatures('free')
      }
    });
  }),

  // POST /api/subscription/direct-upgrade - Upgrade for free (requested "no payment needed")
  directUpgrade: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { plan } = req.body;
    console.log(`[DEBUG] Attempting DIRECT UPGRADE for plan: ${plan}, user: ${req.user!.userId}`);
    if (!['pro', 'premium'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    user.plan = plan;
    user.isPremium = true;
    user.planExpiry = expiryDate;
    user.isActive = true;
    user.subscriptionStatus = 'active';
    await user.save();

    CacheService.invalidateUserCache(user._id.toString()).catch(console.error);

    res.json({
      success: true,
      data: {
        plan: user.plan,
        planExpiry: user.planExpiry,
        hasPremiumAccess: user.hasPremiumAccess()
      }
    });
  })
};

// Helper function to get plan features
function getPlanFeatures(plan: 'free' | 'pro' | 'premium') {
  const features = {
    free: { maxRecords: 5, basicInsights: true, advancedInsights: false, predictions: false, reports: false, support: 'basic' },
    pro: { maxRecords: -1, basicInsights: true, advancedInsights: true, predictions: false, reports: false, support: 'priority' },
    premium: { maxRecords: -1, basicInsights: true, advancedInsights: true, predictions: true, reports: true, support: 'premium' }
  };

  return features[plan] || features.free;
}