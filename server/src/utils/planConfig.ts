import type { PlanType } from '../types/index.js';

export type PaidPlanType = Exclude<PlanType, 'free'>;

export const FREE_UPLOAD_LIMIT = 5;

// Note: Ensure your environment variables are set or replaced with real values
export const RAZORPAY_PLAN_IDS = {
  pro_monthly: process.env.RAZORPAY_PLAN_ID_PRO_MONTHLY || 'plan_pro_monthly',
  pro_yearly: process.env.RAZORPAY_PLAN_ID_PRO_YEARLY || 'plan_pro_yearly',
  premium_monthly: process.env.RAZORPAY_PLAN_ID_PREMIUM_MONTHLY || 'plan_premium_monthly',
  premium_yearly: process.env.RAZORPAY_PLAN_ID_PREMIUM_YEARLY || 'plan_premium_yearly',
};

export const PLAN_CONFIG = {
  free: {
    code: 'free',
    label: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'INR',
    features: [
      'Up to 5 uploads/month',
      'Basic dashboard',
      'Community support',
    ],
  },
  pro: {
    code: 'pro',
    label: 'Pro Business',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    currency: 'INR',
    features: [
      'Unlimited uploads',
      'Power AI Insights',
      'Inventory Tracking',
      'Sales Forecasting',
      'Priority Email Support',
    ],
  },
  premium: {
    code: 'premium',
    label: 'Premium Enterprise',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    currency: 'INR',
    features: [
      'Everything in Pro',
      'Advanced Risk Alerts',
      'Custom API access',
      'White-label Reports',
      'Dedicated Account Manager',
      '24/7 Phone Support',
    ],
  },
} as const;

export const PAID_PLAN_CODES = ['pro', 'premium'] as const;

export const isPaidPlan = (plan: string): plan is PaidPlanType =>
  PAID_PLAN_CODES.includes(plan as PaidPlanType);
