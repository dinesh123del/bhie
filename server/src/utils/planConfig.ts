import type { PlanType } from '../types';

export type PaidPlanType = Exclude<PlanType, 'free'>;

export const FREE_UPLOAD_LIMIT = 5;

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
  '59': {
    code: '59',
    label: '₹59/month',
    amount: 5900,
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
  '119': {
    code: '119',
    label: '₹119/month',
    amount: 11900,
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

export const PAID_PLAN_CODES = ['59', '119'] as const;

export const isPaidPlan = (plan: string): plan is PaidPlanType =>
  PAID_PLAN_CODES.includes(plan as PaidPlanType);
