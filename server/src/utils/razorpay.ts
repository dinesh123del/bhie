import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { AppError } from './appError.js';
import Settings from '../models/Settings.js';

let razorpayClient: Razorpay | null = null;
let currentKeyId: string | null = null;

export const getRazorpayClient = async (forceRefresh = false): Promise<Razorpay> => {
  let keyId = env.RAZORPAY_KEY_ID;
  let keySecret = env.RAZORPAY_KEY_SECRET;

  try {
    const settings = await Settings.findOne();
    if (settings?.razorpayKeyId && settings?.razorpayKeySecret) {
      keyId = settings.razorpayKeyId;
      keySecret = settings.razorpayKeySecret;
    }
  } catch {
    console.warn('Failed to fetch Razorpay keys from DB, falling back to ENV');
  }

  if (!keyId || !keySecret) {
    throw new AppError(503, 'Payments are not configured');
  }

  // Re-initialize if keys changed or first time
  if (!razorpayClient || keyId !== currentKeyId || forceRefresh) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    currentKeyId = keyId;
  }

  return razorpayClient;
};
