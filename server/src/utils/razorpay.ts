import Razorpay from 'razorpay';
import { env } from '../config/env';
import { AppError } from './appError';

let razorpayClient: Razorpay | null = null;

export const getRazorpayClient = (): Razorpay => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError(503, 'Payments are not configured');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
};
