import { Router } from 'express';
import crypto from 'crypto';
import { WhatsAppPaymentService } from '../services/whatsapp-payment-service.js';
import { WhatsAppClient } from '../services/whatsapp-client.js';
import WhatsAppSubscription from '../models/WhatsAppSubscription.js';
import { env } from '../config/env.js';

const router = Router();
const paymentService = new WhatsAppPaymentService();
const waClient = new WhatsAppClient();

router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || (Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})));

    if (!signature) {
      console.error('Missing Razorpay signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.error('Invalid Razorpay signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    console.log('Razorpay webhook event:', event.event);

    const result = await paymentService.handleWebhook(event);

    if (result.success && result.subscription) {
      const phoneNumber = result.subscription.phoneNumber;
      const plan = result.subscription.plan;
      
      await waClient.sendText(phoneNumber,
        `✅ *Payment Successful!*\\n\\n` +
        `💳 Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}\\n` +
        `📅 Valid until: ${result.subscription.expiryDate?.toLocaleDateString()}\\n\\n` +
        `You can now enjoy all premium features!\\n\\n` +
        `Type \"status\" to check your subscription anytime.`
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.get('/test', async (req, res) => {
  res.json({ status: 'WhatsApp payment webhook is active' });
});

export default router;
