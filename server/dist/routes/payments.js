import crypto from 'crypto';
import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
import { PLAN_CONFIG, RAZORPAY_PLAN_IDS, isPaidPlan } from '../utils/planConfig.js';
import { getRazorpayClient } from '../utils/razorpay.js';
import { subscriptionController } from '../controllers/subscriptionController.js';
import { checkAdmin } from '../middleware/subscription.js';
const router = express.Router();
router.get('/webhook', (_req, res) => {
    res.status(405).json({ message: 'Method not allowed' });
});
router.use((req, res, next) => {
    if (req.path === '/webhook') {
        next();
        return;
    }
    authenticateToken(req, res, next);
});
router.get('/', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const payments = await Payment.find({ userId: user.userId }).sort({ createdAt: -1 });
    res.json(payments);
}));
router.get('/plans', asyncHandler(async (_req, res) => {
    res.json({
        plans: Object.values(PLAN_CONFIG).map((plan) => ({
            code: plan.code,
            label: plan.label,
            amount: plan.amount,
            currency: plan.currency,
            durationDays: plan.durationDays,
            uploads: plan.uploads,
            aiInsights: plan.aiInsights,
            features: plan.features,
        })),
    });
}));
router.get('/subscription', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const account = await User.findById(user.userId).select('plan role isActive planExpiry usageCount isPremium subscriptionId subscriptionStatus');
    if (!account) {
        throw new AppError(404, 'User not found');
    }
    if (typeof account.refreshSubscriptionStatus === 'function') {
        await account.refreshSubscriptionStatus();
    }
    const effectivePlan = typeof account.getEffectivePlan === 'function' ? account.getEffectivePlan() : account.plan;
    const activePremium = typeof account.hasPremiumAccess === 'function' ? account.hasPremiumAccess() : false;
    res.json({
        plan: effectivePlan,
        billingPlan: account.plan,
        subscriptionStatus: account.isActive ? 'active' : 'inactive',
        expiryDate: account.planExpiry?.toISOString() || null,
        usageCount: account.usageCount,
        premiumAccess: activePremium,
    });
}));
router.post('/create-order', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const { plan } = req.body;
    if (!plan || !isPaidPlan(plan)) {
        throw new AppError(400, 'Valid paid plan required');
    }
    const razorpay = getRazorpayClient();
    const config = PLAN_CONFIG[plan];
    const receipt = `bhie_${plan}_${Date.now()}_${user.userId}`;
    const razorpayOrder = await razorpay.orders.create({
        amount: config.amount,
        currency: config.currency,
        receipt,
        notes: { userId: user.userId, plan },
    });
    await Payment.create({
        userId: user.userId,
        amount: config.amount,
        currency: config.currency,
        razorpayOrderId: razorpayOrder.id,
        receipt,
        plan,
        status: 'created',
    });
    res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        plan,
        key: env.RAZORPAY_KEY_ID,
    });
}));
router.post('/create-subscription', asyncHandler(async (req, res) => {
    const user = requireUser(req);
    const { plan } = req.body;
    if (!plan || !isPaidPlan(plan)) {
        throw new AppError(400, 'Valid paid plan required');
    }
    const razorpay = getRazorpayClient();
    const config = PLAN_CONFIG[plan];
    const planId = RAZORPAY_PLAN_IDS[plan];
    if (!planId || planId.startsWith('plan_placeholder')) {
        throw new AppError(400, `Razorpay Recurring Plan for ${plan} is not configured.`);
    }
    // Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 1 year of recurring billing
        notes: {
            userId: user.userId,
            plan
        }
    });
    await Payment.create({
        userId: user.userId,
        amount: config.amount,
        currency: config.currency,
        razorpayOrderId: subscription.id, // We'll store subscription ID here for easier lookup
        receipt: `sub_${subscription.id}`,
        plan,
        status: 'created',
    });
    res.json({
        subscriptionId: subscription.id,
        amount: config.amount,
        currency: 'INR',
        plan,
        key: env.RAZORPAY_KEY_ID,
    });
}));
router.post('/verify', asyncHandler(async (req, res) => {
    requireUser(req);
    if (!env.RAZORPAY_KEY_SECRET) {
        throw new AppError(503, 'Payments are not configured');
    }
    const { razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!(razorpay_order_id || razorpay_subscription_id) || !razorpay_payment_id || !razorpay_signature) {
        throw new AppError(400, 'Payment verification payload is incomplete');
    }
    const verificationId = razorpay_order_id || razorpay_subscription_id;
    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(`${verificationId}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    if (digest !== razorpay_signature) {
        throw new AppError(400, 'Invalid payment signature');
    }
    const payment = await Payment.findOne({
        razorpayOrderId: verificationId,
        verifiedAt: { $exists: false }
    });
    if (!payment) {
        throw new AppError(400, 'Invalid or already processed order');
    }
    const user = await User.findById(payment.userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    await user.upgradePlan(payment.plan, razorpay_subscription_id);
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'paid';
    payment.verifiedAt = new Date();
    payment.expiryDate = user.planExpiry;
    await payment.save();
    res.json({
        success: true,
        message: 'Subscription activated',
        plan: user.plan,
        expiryDate: user.planExpiry?.toISOString() || null,
    });
}));
router.post('/webhook', express.raw({ type: 'application/json', limit: env.BODY_LIMIT }), asyncHandler(async (req, res) => {
    if (!env.RAZORPAY_KEY_SECRET) {
        throw new AppError(503, 'Payments are not configured');
    }
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || (Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})));
    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');
    if (digest !== signature) {
        throw new AppError(400, 'Invalid signature');
    }
    const event = JSON.parse(rawBody.toString('utf8'));
    // Handle One-time order failure
    if (event.event === 'payment.failed') {
        const orderId = event.payload.payment.entity.order_id;
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment) {
            payment.status = 'failed';
            await payment.save();
        }
    }
    // Handle Recurring Subscription charges
    if (event.event === 'subscription.charged') {
        const subscriptionId = event.payload.subscription.entity.id;
        const user = await User.findOne({ subscriptionId });
        if (user) {
            // Extend plan by 30 days
            const newExpiry = new Date(user.planExpiry || Date.now());
            newExpiry.setDate(newExpiry.getDate() + 30);
            user.planExpiry = newExpiry;
            user.isActive = true;
            await user.save();
            // Record payment
            await Payment.create({
                userId: user.id,
                amount: event.payload.payment.entity.amount,
                currency: 'INR',
                razorpayOrderId: subscriptionId,
                razorpayPaymentId: event.payload.payment.entity.id,
                plan: user.plan,
                status: 'paid',
                verifiedAt: new Date()
            });
        }
    }
    if (event.event === 'subscription.cancelled' || event.event === 'subscription.expired') {
        const subscriptionId = event.payload.subscription.entity.id;
        const user = await User.findOne({ subscriptionId });
        if (user) {
            user.subscriptionStatus = 'cancelled';
            await user.save();
        }
    }
    res.json({ received: true });
}));
router.post('/direct-upgrade', checkAdmin, subscriptionController.directUpgrade);
export default router;
