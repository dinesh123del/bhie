import crypto from 'crypto';
import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { requireUser } from '../utils/request.js';
import { PLAN_CONFIG, isPaidPlan } from '../utils/planConfig.js';
import { getRazorpayClient } from '../utils/razorpay.js';
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
    const account = await User.findById(user.userId).select('plan isActive planExpiry usageCount isPremium subscriptionId subscriptionStatus');
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
        throw new AppError(400, 'Valid paid plan (pro/enterprise) required');
    }
    const account = await User.findById(user.userId).select('plan isActive planExpiry');
    if (!account) {
        throw new AppError(404, 'User not found');
    }
    if (typeof account.refreshSubscriptionStatus === 'function') {
        await account.refreshSubscriptionStatus();
    }
    const razorpay = getRazorpayClient();
    const config = PLAN_CONFIG[plan];
    const receipt = `bhie_${plan}_${Date.now()}_${user.userId}`;
    const razorpayOrder = await razorpay.orders.create({
        amount: config.amount,
        currency: config.currency,
        receipt,
        notes: {
            userId: user.userId,
            plan,
        },
    });
    await Payment.create({
        userId: user.userId,
        amount: config.amount,
        currency: config.currency,
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: '',
        receipt,
        plan,
        status: 'created',
    });
    res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        plan,
        label: config.label,
        key: env.RAZORPAY_KEY_ID,
    });
}));
router.post('/verify', asyncHandler(async (req, res) => {
    requireUser(req);
    if (!env.RAZORPAY_KEY_SECRET) {
        throw new AppError(503, 'Payments are not configured');
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new AppError(400, 'Payment verification payload is incomplete');
    }
    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    if (digest !== razorpay_signature) {
        throw new AppError(400, 'Invalid payment signature');
    }
    const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        verifiedAt: { $exists: false }
    });
    if (!payment) {
        throw new AppError(400, 'Invalid or already processed order');
    }
    const razorpay = getRazorpayClient();
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!razorpayPayment) {
        throw new AppError(400, 'Unable to fetch payment from gateway');
    }
    if (razorpayPayment.order_id !== razorpay_order_id) {
        throw new AppError(400, 'Payment does not match the requested order');
    }
    if (!['authorized', 'captured'].includes(razorpayPayment.status)) {
        throw new AppError(400, 'Payment is not authorized');
    }
    if (Number(razorpayPayment.amount) !== payment.amount) {
        throw new AppError(400, 'Payment amount mismatch');
    }
    const user = await User.findById(payment.userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    await user.upgradePlan(payment.plan);
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'paid';
    payment.verifiedAt = new Date();
    payment.expiryDate = user.planExpiry;
    await payment.save();
    res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        plan: user.plan,
        subscriptionStatus: user.isActive ? 'active' : 'inactive',
        expiryDate: user.planExpiry?.toISOString() || null,
    });
}));
router.post('/webhook', express.raw({ type: 'application/json', limit: env.BODY_LIMIT }), asyncHandler(async (req, res) => {
    if (!env.RAZORPAY_KEY_SECRET) {
        throw new AppError(503, 'Payments are not configured');
    }
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}));
    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');
    if (digest !== signature) {
        throw new AppError(400, 'Invalid signature');
    }
    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.event === 'payment.failed') {
        const orderId = event.payload.payment.entity.order_id;
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment) {
            payment.status = 'failed';
            await payment.save();
        }
    }
    if (event.event === 'payment.captured') {
        const paymentId = event.payload.payment.entity.id;
        const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
        if (payment && payment.status !== 'paid') {
            payment.status = 'paid';
            payment.verifiedAt = new Date();
            await payment.save();
        }
    }
    res.json({ received: true });
}));
export default router;
