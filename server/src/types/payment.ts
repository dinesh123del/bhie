import { AuthRequest } from './index.js';
import type { PlanType } from './index.js';
import type { PaidPlanType } from '../utils/planConfig.js';

export interface CreateOrderRequest {
  plan: PaidPlanType;
}

export interface VerifyPaymentRequest {
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentResponse {
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
}
