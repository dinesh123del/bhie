import api from '../lib/axios';

export interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'premium';
  planExpiry?: string | null;
  isActive: boolean;
  subscriptionStatus?: string;
  hasPremiumAccess: boolean;
  features: PlanFeatures;
}

export interface PlanFeatures {
  maxRecords: number; // -1 for unlimited
  basicInsights: boolean;
  advancedInsights: boolean;
  predictions: boolean;
  reports: boolean;
  support: string;
}

export interface SubscribeRequest {
  plan: 'pro' | 'premium';
}

export const subscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get('/subscription/status');
    return response.data.data;
  },

  create: async (plan: 'pro' | 'premium'): Promise<{
    subscriptionId: string;
    plan_id: string;
    key: string;
  }> => {
    const response = await api.post('/subscription/create', { plan });
    return response.data;
  },

  verify: async (payload: {
    razorpay_payment_id: string;
    razorpay_signature: string;
    razorpay_subscription_id: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      plan: string;
      planExpiry: string;
      features: PlanFeatures;
    };
  }> => {
    const response = await api.post('/subscription/verify', payload);
    return response.data;
  },

  cancel: async (): Promise<{
    plan: 'free';
    features: PlanFeatures;
  }> => {
    const response = await api.post('/subscription/cancel');
    return response.data.data;
  }
};

export const planFeatures: Record<'free' | 'pro' | 'premium', PlanFeatures> = {
  free: {
    maxRecords: 5,
    basicInsights: true,
    advancedInsights: false,
    predictions: false,
    reports: false,
    support: 'basic'
  },
  pro: {
    maxRecords: -1,
    basicInsights: true,
    advancedInsights: true,
    predictions: false,
    reports: false,
    support: 'priority'
  },
  premium: {
    maxRecords: -1,
    basicInsights: true,
    advancedInsights: true,
    predictions: true,
    reports: true,
    support: 'premium'
  }
};