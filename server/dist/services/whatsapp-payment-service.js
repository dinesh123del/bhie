import Razorpay from 'razorpay';
import crypto from 'crypto';
import WhatsAppSubscription from '../models/WhatsAppSubscription.js';
import { SubscriptionPlanService } from './subscription-plan-service.js';
import { env } from '../config/env.js';
export class WhatsAppPaymentService {
    constructor() {
        if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET &&
            env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder' &&
            env.RAZORPAY_KEY_SECRET !== 'placeholder_secret') {
            this.razorpay = new Razorpay({
                key_id: env.RAZORPAY_KEY_ID,
                key_secret: env.RAZORPAY_KEY_SECRET
            });
        }
        else {
            this.razorpay = null;
            console.warn('⚠️ Razorpay not configured with valid credentials. Payment features will be disabled.');
        }
    }
    async createPaymentLink(phoneNumber, planCode, cycle = 'monthly', customerInfo) {
        try {
            const plan = SubscriptionPlanService.getPlan(planCode);
            if (!plan) {
                return { success: false, error: 'Invalid plan' };
            }
            const amount = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const receipt = `wa_${planCode}_${phoneNumber}_${Date.now()}`;
            const options = {
                amount: amount * 100,
                currency: plan.currency,
                accept_partial: false,
                description: `${plan.name} Plan (${cycle})`,
                customer: {
                    contact: phoneNumber,
                    name: customerInfo?.name || phoneNumber,
                    email: customerInfo?.email
                },
                notes: {
                    phoneNumber,
                    planCode,
                    cycle,
                    source: 'whatsapp'
                },
                callback_url: `${process.env.FRONTEND_URL || 'https://app.bhie.com'}/payment/success`,
                callback_method: 'get'
            };
            const paymentLink = await this.razorpay.paymentLink.create(options);
            await WhatsAppSubscription.create({
                phoneNumber,
                email: customerInfo?.email,
                name: customerInfo?.name,
                plan: planCode,
                status: 'pending',
                razorpayOrderId: paymentLink.id,
                amount,
                currency: plan.currency,
                billingCycle: cycle,
                paymentStatus: 'pending',
                metadata: {
                    paymentLinkId: paymentLink.id,
                    receipt
                }
            });
            return {
                success: true,
                paymentLink: paymentLink.short_url,
                orderId: paymentLink.id
            };
        }
        catch (error) {
            console.error('Payment link creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create payment link'
            };
        }
    }
    async createOrder(phoneNumber, planCode, cycle = 'monthly') {
        try {
            if (!this.razorpay) {
                return { success: false, error: 'Payment service not configured' };
            }
            const plan = SubscriptionPlanService.getPlan(planCode);
            if (!plan) {
                return { success: false, error: 'Invalid plan' };
            }
            const amount = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const receipt = `wa_order_${planCode}_${phoneNumber}_${Date.now()}`;
            const order = await this.razorpay.orders.create({
                amount: amount * 100,
                currency: plan.currency,
                receipt,
                notes: {
                    phoneNumber,
                    planCode,
                    cycle,
                    source: 'whatsapp'
                }
            });
            await WhatsAppSubscription.create({
                phoneNumber,
                plan: planCode,
                status: 'pending',
                razorpayOrderId: order.id,
                amount,
                currency: plan.currency,
                billingCycle: cycle,
                paymentStatus: 'pending',
                metadata: {
                    receipt
                }
            });
            return {
                success: true,
                orderId: order.id,
                error: undefined
            };
        }
        catch (error) {
            console.error('Order creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create order'
            };
        }
    }
    async verifyPayment(orderId, paymentId, signature) {
        try {
            const generatedSignature = crypto
                .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
                .update(`${orderId}|${paymentId}`)
                .digest('hex');
            if (generatedSignature !== signature) {
                return { success: false, error: 'Invalid signature' };
            }
            const subscription = await WhatsAppSubscription.findOne({ razorpayOrderId: orderId });
            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }
            await subscription.activateSubscription(orderId, paymentId);
            return { success: true, subscription };
        }
        catch (error) {
            console.error('Payment verification error:', error);
            return {
                success: false,
                error: error.message || 'Payment verification failed'
            };
        }
    }
    async handleWebhook(event) {
        try {
            const { event: eventType, payload } = event;
            if (eventType === 'payment_link.paid') {
                const paymentLinkId = payload.payment_link.entity.id;
                const paymentId = payload.payment.entity.id;
                const orderId = payload.payment.entity.order_id;
                const subscription = await WhatsAppSubscription.findOne({
                    'metadata.paymentLinkId': paymentLinkId
                });
                if (subscription) {
                    await subscription.activateSubscription(orderId, paymentId);
                    return { success: true, subscription };
                }
            }
            if (eventType === 'payment.captured') {
                const orderId = payload.payment.entity.order_id;
                const paymentId = payload.payment.entity.id;
                const subscription = await WhatsAppSubscription.findOne({ razorpayOrderId: orderId });
                if (subscription && subscription.paymentStatus === 'pending') {
                    await subscription.activateSubscription(orderId, paymentId);
                    return { success: true, subscription };
                }
            }
            if (eventType === 'payment.failed') {
                const orderId = payload.payment.entity.order_id;
                const subscription = await WhatsAppSubscription.findOne({ razorpayOrderId: orderId });
                if (subscription) {
                    subscription.paymentStatus = 'failed';
                    subscription.status = 'pending';
                    await subscription.save();
                }
            }
            return { success: true };
        }
        catch (error) {
            console.error('Webhook handling error:', error);
            return {
                success: false,
                error: error.message || 'Webhook handling failed'
            };
        }
    }
    async checkSubscriptionStatus(phoneNumber) {
        const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
        if (!subscription) {
            return {
                active: false,
                plan: null,
                expiryDate: null
            };
        }
        return {
            active: subscription.isActive(),
            plan: subscription.plan,
            expiryDate: subscription.expiryDate,
            status: subscription.status
        };
    }
    async renewSubscription(phoneNumber) {
        try {
            const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }
            await subscription.renewSubscription();
            return { success: true, subscription };
        }
        catch (error) {
            console.error('Subscription renewal error:', error);
            return {
                success: false,
                error: error.message || 'Renewal failed'
            };
        }
    }
    async cancelSubscription(phoneNumber) {
        try {
            const subscription = await WhatsAppSubscription.findByPhone(phoneNumber);
            if (!subscription) {
                return { success: false, error: 'Subscription not found' };
            }
            await subscription.cancelSubscription();
            return { success: true, subscription };
        }
        catch (error) {
            console.error('Subscription cancellation error:', error);
            return {
                success: false,
                error: error.message || 'Cancellation failed'
            };
        }
    }
}
