import { AuthRequest } from './index';
import type { PlanType } from './index';
import type { PaidPlanType } from '../utils/planConfig';

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
