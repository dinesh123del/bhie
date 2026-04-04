import api from '../lib/axios';

export interface SubscriptionStatus {
  plan: 'free' | '59' | '119';
  planExpiry?: string | null;
  isActive: boolean;
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
  plan: '59' | '119';
}

export const subscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get('/subscription/status');
    return response.data.data;
  },

  subscribe: async (data: SubscribeRequest): Promise<{
    plan: '59' | '119';
    planExpiry: string;
    features: PlanFeatures;
  }> => {
    const response = await api.post('/subscription/subscribe', data);
    return response.data.data;
  },

  cancel: async (): Promise<{
    plan: 'free';
    features: PlanFeatures;
  }> => {
    const response = await api.post('/subscription/cancel');
    return response.data.data;
  }
};

export const planFeatures: Record<'free' | '59' | '119', PlanFeatures> = {
  free: {
    maxRecords: 10,
    basicInsights: true,
    advancedInsights: false,
    predictions: false,
    reports: false,
    support: 'basic'
  },
  '59': {
    maxRecords: -1, // unlimited
    basicInsights: true,
    advancedInsights: true,
    predictions: false,
    reports: false,
    support: 'priority'
  },
  '119': {
    maxRecords: -1, // unlimited
    basicInsights: true,
    advancedInsights: true,
    predictions: true,
    reports: true,
    support: 'premium'
  }
};