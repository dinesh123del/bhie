import type { PlanType } from '../types/index.js';

export type PaidPlanType = Exclude<PlanType, 'free'>;

export const FREE_UPLOAD_LIMIT = 5;

// Note: Ensure your environment variables are set or replaced with real values
export const RAZORPAY_PLAN_IDS = {
  pro: process.env.RAZORPAY_PLAN_ID_PRO || 'plan_pro',
  premium: process.env.RAZORPAY_PLAN_ID_PREMIUM || 'plan_premium',
};

export const PLAN_CONFIG = {
  free: {
    code: 'free',
    label: 'Free',
    amount: 0,
    currency: 'INR',
    durationDays: 0,
    uploads: FREE_UPLOAD_LIMIT,
    aiInsights: false,
    features: [
      'Up to 5 uploads',
      'Business dashboard',
      'Basic analytics',
    ],
  },
  pro: {
    code: 'pro',
    label: '₹99/month',
    amount: 9900,
    currency: 'INR',
    durationDays: 30,
    uploads: null,
    aiInsights: true,
    features: [
      'Unlimited uploads',
      'AI-powered insights',
      'Advanced analytics',
      'Priority support',
      'Export data',
    ],
  },
  premium: {
    code: 'premium',
    label: '₹299/month',
    amount: 29900,
    currency: 'INR',
    durationDays: 30,
    uploads: null,
    aiInsights: true,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Advanced reporting',
      'Dedicated support',
      'API access',
    ],
  },
} as const;

export const PAID_PLAN_CODES = ['pro', 'premium'] as const;

export const isPaidPlan = (plan: string): plan is PaidPlanType =>
  PAID_PLAN_CODES.includes(plan as PaidPlanType);
