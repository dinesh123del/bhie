import api from '../lib/axios';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
    };
  }
}

export interface SubscriptionResponse {
  plan: 'free' | 'pro' | 'enterprise';
  billingPlan?: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  expiryDate: string | null;
  recordCount: number;
  premiumAccess: boolean;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  plan: 'pro' | 'enterprise';
  label: string;
  key?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: VerifyPaymentPayload) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayLoaderPromise: Promise<void> | null = null;

export const paymentService = {
  async getSubscription() {
    const response = await api.get<SubscriptionResponse>('/payment/subscription');
    return response.data;
  },

  async createOrder(plan: 'pro' | 'enterprise') {
    const response = await api.post<CreateOrderResponse>('/payment/create-order', { plan });
    return response.data;
  },

  async verify(payload: VerifyPaymentPayload) {
    const response = await api.post('/payment/verify', payload);
    return response.data;
  },

  async ensureRazorpayLoaded() {
    if (window.Razorpay) {
      return;
    }

    if (!razorpayLoaderPromise) {
      razorpayLoaderPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve(), { once: true });
          existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay checkout')), { once: true });
          return;
        }

        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Unable to load Razorpay checkout'));
        document.body.appendChild(script);
      });
    }

    await razorpayLoaderPromise;
  },
};

export default paymentService;
