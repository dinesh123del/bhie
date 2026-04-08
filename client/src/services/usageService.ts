import api from '../lib/axios';

export interface UsageStat {
  type: string;
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
  overage: number;
  overageCost: number;
}

export interface BillingSummary {
  period: {
    start: string;
    end: string;
  };
  plan: string;
  usage: Array<{
    type: string;
    consumed: number;
    included: number | 'unlimited';
    overage: number;
    overageCost: number;
  }>;
  totalOverageCost: number;
  currency: string;
}

export interface UsageCheck {
  canUse: boolean;
  balance: number;
  limit: number | 'unlimited';
  type: string;
}

export const usageService = {
  // Get usage stats for all types
  getStats: async () => {
    const response = await api.get('/usage/stats');
    return response.data;
  },

  // Get usage history
  getHistory: async (page = 1, limit = 50) => {
    const response = await api.get(`/usage/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get billing summary for current period
  getBillingSummary: async () => {
    const response = await api.get('/usage/billing');
    return response.data;
  },

  // Check if can use a specific resource
  checkLimit: async (type: string, amount = 1) => {
    const response = await api.get(`/usage/check/${type}/${amount}`);
    return response.data;
  },

  // Purchase additional credits
  purchaseCredits: async (type: string, amount: number) => {
    const response = await api.post('/usage/purchase', { type, amount });
    return response.data;
  },
};
