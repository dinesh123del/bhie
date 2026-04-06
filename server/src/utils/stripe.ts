import Stripe from 'stripe';
import { env } from '../config/env.js';

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
  if (!stripeClient) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    // Stripe constructor for v14+ of stripe-node
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia', // A stable version
    });
  }
  return stripeClient;
};
