import express from 'express';
import StripeService, { stripe } from '../services/stripeService';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';
import User from '../models/User';
const router = express.Router();
const createSubscriptionSchema = z.object({
    tier: z.enum(['pro', 'business']),
    paymentMethodId: z.string().optional()
});
router.post('/create-checkout-session', authenticateToken, asyncHandler(async (req, res) => {
    const { tier } = createSubscriptionSchema.parse(req.body);
    const userId = req.user.userId;
    // Get user from DB to ensure we have email
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Get or create Stripe customer
    const customerId = await StripeService.createCustomer(userId, user.email);
    // Price IDs from env
    const priceId = tier === 'pro' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_BUSINESS_PRICE_ID;
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
                price: priceId,
                quantity: 1,
            }],
        success_url: `${process.env.CLIENT_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/pricing`,
        metadata: { userId }
    });
    res.json({ url: session.url });
}));
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;
    await StripeService.handleWebhook(payload, sig);
    res.json({ received: true });
}));
export default router;
