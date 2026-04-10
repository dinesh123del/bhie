"use client"
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Crown,
  Lock,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PremiumBadge, PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import paymentService, { SubscriptionResponse } from '../services/paymentService';
import { PLAN_DETAILS, getPlanLabel, getRemainingUploads, hasPremiumAccess, type AppPlan } from '../utils/plan';
import { premiumFeedback } from '../utils/premiumFeedback';

type PaidPlan = Exclude<AppPlan, 'free'>;

interface PlanCard {
  code: AppPlan;
  name: string;
  price: number;
  billingText: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const planCards: PlanCard[] = [
  {
    code: 'free',
    name: 'Free',
    price: PLAN_DETAILS.free.price,
    billingText: PLAN_DETAILS.free.billingText,
    description: 'Best for getting started with BIZ PLUS and managing a small number of uploads.',
    features: PLAN_DETAILS.free.features,
  },
  {
    code: 'pro',
    name: 'Pro',
    price: PLAN_DETAILS.pro.price,
    billingText: PLAN_DETAILS.pro.billingText,
    description: 'Best for growing businesses that need unlimited uploads and AI insights.',
    features: PLAN_DETAILS.pro.features,
    popular: true,
  },
  {
    code: 'premium',
    name: 'Premium',
    price: PLAN_DETAILS.premium.price,
    billingText: PLAN_DETAILS.premium.billingText,
    description: 'For larger teams that need premium workflows, reporting, and support.',
    features: PLAN_DETAILS.premium.features,
  },
];

const Payments = () => {
  const navigate = useNavigate();
  const { user, refetchUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<AppPlan>('pro');
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const response = await paymentService.getSubscription();
        setSubscription(response);
        if (response.plan === 'pro' || response.plan === 'premium') {
          setSelectedPlan(response.plan);
        }
      } catch (err: any) {
        const errorMsg = err?.displayMessage || 'Unable to load subscription details';
        toast.error(errorMsg, { id: 'subscription-load-error' });
        console.error('[Billing] Status Fetch Failed:', err);
      } finally {
        setLoadingSubscription(false);
      }
    };

    void loadSubscription();
  }, [user]);

  const effectivePlan = subscription?.plan || (user?.plan as AppPlan | undefined) || 'free';
  const premiumActive = subscription?.premiumAccess ?? hasPremiumAccess(user);
  const remainingUploads = getRemainingUploads(user);
  const expiryLabel = subscription?.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    : null;

  const currentSelection = useMemo(
    () => planCards.find((plan) => plan.code === selectedPlan) || planCards[1],
    [selectedPlan]
  );

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please login first');
      premiumFeedback.error();
      return;
    }

    if (selectedPlan === 'free') {
      toast.success('Free plan is already available');
      navigate('/dashboard');
      premiumFeedback.click();
      return;
    }

    setPaymentLoading(true);
    const loadingToast = toast.loading(`Initiating ${selectedPlan} upgrade...`);
    premiumFeedback.click();

    try {
      // 1. Create order on backend
      const orderData = await paymentService.createOrder(selectedPlan as PaidPlan);

      // 2. Ensure Razorpay is loaded
      await paymentService.ensureRazorpayLoaded();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY || 'rzp_live_SYwkStp5U2NhjF',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BIZ PLUS Platform',
        description: `Upgrade to ${selectedPlan.toUpperCase()} Plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            toast.loading('Verifying payment...', { id: loadingToast });
            await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(`${currentSelection.name} plan activated!`, { id: loadingToast });
            premiumFeedback.success();
            await refetchUser();
            const latestSubscription = await paymentService.getSubscription();
            setSubscription(latestSubscription);
            setTimeout(() => navigate('/dashboard'), 1500);
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Payment verification failed', { id: loadingToast });
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#0ea5e9',
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast.dismiss(loadingToast);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      setPaymentLoading(false);
      toast.error(error?.response?.data?.message || error?.message || 'Unable to initiate payment', { id: loadingToast });
      premiumFeedback.error();
    }
  };

  const handleDirectUpgrade = async () => {
    if (!user) return;
    setPaymentLoading(true);
    const loadingToast = toast.loading('Bypassing payment gateway...');
    try {
      const result = await paymentService.directUpgrade(selectedPlan as PaidPlan);
      if (result.success) {
        await refetchUser();
        const latestSubscription = await paymentService.getSubscription();
        setSubscription(latestSubscription);
        toast.success(`${selectedPlan.toUpperCase()} plan activated!`, { id: loadingToast });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error: any) {
      toast.error('Direct upgrade failed', { id: loadingToast });
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#050914] to-[#0b1220] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <PremiumButton
            variant="secondary"
            onClick={() => {
              navigate('/dashboard');
              premiumFeedback.click();
            }}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to dashboard
          </PremiumButton>

          <PremiumBadge tone="neutral">Secure payments in INR</PremiumBadge>
        </div>

        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink-300">Pricing</p>
          <h1 className="text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
            Upgrade BIZ PLUS when your business is ready
          </h1>
          <p className="mt-4 text-base leading-7 text-ink-300 md:text-lg">
            Free gets you started. Pro and Enterprise unlock unlimited uploads, smart insights, and premium workflows.
          </p>
        </div>

        {loadingSubscription ? null : (
          <PremiumCard gradient hoverable={false} className="mb-8 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-ink-400">Current Plan</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{getPlanLabel(effectivePlan)}</h2>
                <p className="mt-2 text-sm text-ink-300">
                  Status: {subscription?.subscriptionStatus || user?.subscriptionStatus || 'active'}
                </p>
                {expiryLabel ? (
                  <p className="mt-1 text-sm text-ink-300">Expires on {expiryLabel}</p>
                ) : (
                  <p className="mt-1 text-sm text-ink-300">
                    {premiumActive ? 'Premium access is active.' : `${remainingUploads} free uploads remaining.`}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Uploads</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {premiumActive ? 'Unlimited' : `${remainingUploads} left`}
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Smart Insights</p>
                  <p className="mt-2 text-lg font-bold text-white">{premiumActive ? 'Unlocked' : 'Locked'}</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        )}

        <div className="mb-12 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {planCards.map((plan) => {
            const isCurrentPlan = effectivePlan === plan.code && (plan.code === 'free' || premiumActive);
            const isSelected = selectedPlan === plan.code;

            return (
              <PremiumCard
                key={plan.code}
                gradient
                className={`relative min-h-[460px] border ${isSelected ? 'border-indigo-400/40 shadow-brand-glow' : 'border-white/10'
                  }`}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                      {plan.popular ? <PremiumBadge tone="brand">Most Popular</PremiumBadge> : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-300">{plan.description}</p>
                  </div>

                  <PremiumBadge tone={plan.code === 'free' ? 'positive' : plan.code === 'pro' ? 'brand' : 'warning'}>
                    {plan.code === 'free' ? 'Free' : 'Monthly'}
                  </PremiumBadge>
                </div>

                <div className="mb-8">
                  <div className="text-4xl font-black tracking-[-0.06em] text-white">
                    {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                  </div>
                  <div className="mt-2 text-sm text-ink-400">{plan.billingText}</div>
                </div>

                <ul className="mb-8 space-y-3 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-ink-200">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <PremiumButton
                  onClick={() => {
                    setSelectedPlan(plan.code);
                    premiumFeedback.click();
                  }}
                  variant={isSelected ? 'primary' : 'secondary'}
                  className="mt-6 w-full"
                  icon={plan.code === 'free' ? <Lock className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                >
                  {isCurrentPlan ? `Current ${plan.name} plan` : `Choose ${plan.name}`}
                </PremiumButton>
              </PremiumCard>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-4">
          <PremiumButton
            onClick={handleUpgrade}
            loading={paymentLoading}
            size="lg"
            icon={<CreditCard className="h-5 w-5" />}
            disabled={currentSelection.code !== 'free' && effectivePlan === currentSelection.code && premiumActive}
          >
            {currentSelection.code === 'free'
              ? 'Continue with Free'
              : effectivePlan === currentSelection.code && premiumActive
                ? `${currentSelection.name} already active`
                : `Pay & Upgrade to ${currentSelection.name}`}
          </PremiumButton>

          {!premiumActive && (
            <button
              onClick={handleDirectUpgrade}
              className="text-xs text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest font-black"
            >
              Skip Payment (Developer Mode)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
