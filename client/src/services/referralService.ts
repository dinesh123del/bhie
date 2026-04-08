import api from '../lib/axios';

export interface ReferralStats {
  totalSent: number;
  pending: number;
  converted: number;
  rewardsEarned: number;
  totalXP: number;
}

export interface Referral {
  id: string;
  refereeEmail: string;
  status: 'pending' | 'converted' | 'expired';
  code: string;
  createdAt: string;
  convertedAt?: string;
  rewardGiven: boolean;
}

export interface SocialShares {
  twitter: string;
  linkedin: string;
  email: {
    subject: string;
    body: string;
  };
}

export const referralService = {
  // Get user's referral stats and history
  getStats: async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
  },

  // Create a new referral invite
  createReferral: async (refereeEmail: string) => {
    const response = await api.post('/referrals/create', { refereeEmail });
    return response.data;
  },

  // Get pre-written social media shares
  getSocialShares: async () => {
    const response = await api.get('/referrals/social-shares');
    return response.data;
  },

  // Validate a referral code (for registration page)
  validateCode: async (code: string) => {
    const response = await api.get(`/referrals/validate/${code}`);
    return response.data;
  },

  // Convert referral after registration
  convertReferral: async (code: string, newUserId: string, newUserEmail: string) => {
    const response = await api.post('/referrals/convert', {
      code,
      newUserId,
      newUserEmail,
    });
    return response.data;
  },
};
