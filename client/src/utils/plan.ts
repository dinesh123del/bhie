export type AppPlan = 'free' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface PlanAwareUser {
  plan?: string;
  subscriptionStatus?: string;
  usageCount?: number;
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
    label: '₹79/month',
    price: 79,
    billingText: 'per month',
    premium: true,
    features: ['Unlimited uploads', 'Advanced insights', 'Advanced analytics', 'Priority support', 'Export data'],
  },
  premium: {
    code: 'premium',
    label: '₹299/month',
    price: 299,
    billingText: 'per month',
    premium: true,
    features: ['Everything in Pro', 'Custom integrations', 'Advanced reporting', 'Dedicated support', 'API access'],
  },
};

export const hasPremiumAccess = (user?: PlanAwareUser | null): boolean =>
  Boolean(user && (user.plan === 'pro' || user.plan === 'premium'));

export const canUseDeepInsights = (user?: PlanAwareUser | null): boolean => hasPremiumAccess(user);

export const getRemainingUploads = (user?: PlanAwareUser | null): number => {
  const count = Number(user?.usageCount ?? user?.recordCount ?? 0);
  return hasPremiumAccess(user) ? Number.POSITIVE_INFINITY : Math.max(0, FREE_UPLOAD_LIMIT - count);
};

export const canUploadMore = (user?: PlanAwareUser | null): boolean =>
  hasPremiumAccess(user) || getRemainingUploads(user) > 0;

export const getPlanLabel = (plan?: string): string => {
  switch (plan) {
    case 'premium':
      return 'Premium';
    case 'pro':
      return 'Pro';
    case 'free':
    default:
      return 'Free';
  }
};
