export type AppPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface PlanAwareUser {
  plan?: string;
  subscriptionStatus?: string;
  recordCount?: number;
  expiryDate?: string | null;
}

export const FREE_UPLOAD_LIMIT = 5;

export const PLAN_DETAILS: Record<AppPlan, {
  code: AppPlan;
  label: string;
  price: number;
  billingText: string;
  premium: boolean;
  features: string[];
}> = {
  free: {
    code: 'free',
    label: 'Free',
    price: 0,
    billingText: 'Free forever',
    premium: false,
    features: ['Up to 5 uploads', 'Dashboard access', 'Basic analytics'],
  },
  pro: {
    code: 'pro',
    label: '₹59/month',
    price: 59,
    billingText: 'per month',
    premium: true,
    features: ['Unlimited uploads', 'AI insights', 'Advanced analytics', 'Priority support'],
  },
  enterprise: {
    code: 'enterprise',
    label: '₹119/month',
    price: 119,
    billingText: 'per month',
    premium: true,
    features: ['Everything in Pro', 'Custom integrations', 'Advanced reporting', 'Dedicated support'],
  },
};

export const hasPremiumAccess = (user?: PlanAwareUser | null): boolean =>
  Boolean(user && (user.plan === 'pro' || user.plan === 'enterprise') && user.subscriptionStatus === 'active');

export const canUseAIInsights = (user?: PlanAwareUser | null): boolean => hasPremiumAccess(user);

export const getRemainingUploads = (user?: PlanAwareUser | null): number =>
  hasPremiumAccess(user) ? Number.POSITIVE_INFINITY : Math.max(0, FREE_UPLOAD_LIMIT - Number(user?.recordCount || 0));

export const canUploadMore = (user?: PlanAwareUser | null): boolean =>
  hasPremiumAccess(user) || getRemainingUploads(user) > 0;

export const getPlanLabel = (plan?: string): string => {
  switch (plan) {
    case 'enterprise':
      return 'Enterprise';
    case 'pro':
      return 'Pro';
    case 'free':
    default:
      return 'Free';
  }
};
