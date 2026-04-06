import { motion } from 'framer-motion';
import { ArrowRight, Check, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useTranslation } from 'react-i18next';

export default function PricingPage() {
  const { t } = useTranslation();
  const [pricingData, setPricingData] = useState({
    country: 'US',
    currency: 'USD',
    price: 5,
    premiumPrice: 15
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const cachedPricing = localStorage.getItem('userPricing');
        if (cachedPricing) {
          setPricingData(JSON.parse(cachedPricing));
          setLoading(false);
          // Still fetch in background to verify/update
        }

        const response = await api.get('/pricing');
        
        if (response.data.success) {
          setPricingData(response.data.data);
          localStorage.setItem('userPricing', JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error("Failed to fetch pricing", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    const mockConfig: Record<string, { currency: string, price: number, premiumPrice: number }> = {
      IN: { currency: "INR", price: 79, premiumPrice: 299 },
      US: { currency: "USD", price: 5, premiumPrice: 15 },
      GB: { currency: "GBP", price: 4, premiumPrice: 12 },
      DEFAULT: { currency: "USD", price: 5, premiumPrice: 15 }
    };
    
    const newPricing = mockConfig[country] || mockConfig['DEFAULT'];
    const updatedData = { country, ...newPricing };
    setPricingData(updatedData);
    localStorage.setItem('userPricing', JSON.stringify(updatedData));
  };

  const getCurrencySymbol = (currency: string) => {
    switch(currency) {
      case 'INR': return '₹';
      case 'GBP': return '£';
      case 'USD': default: return '$';
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'For early teams that want a sharper view of business health.',
      features: ['Core analytics workspace', 'Weekly intelligence summary', 'Up to 5 uploads'],
    },
    {
      name: 'Pro',
      price: loading ? '...' : `${getCurrencySymbol(pricingData.currency)}${pricingData.price}`,
      period: '/month',
      description: 'For scaling companies that need live planning, forecasting, and advanced assistance.',
      features: ['Unlimited uploads', 'Smart insights', 'Advanced analytics', 'Priority support', 'Export data'],
      featured: true,
    },
    {
      name: 'Premium',
      price: loading ? '...' : `${getCurrencySymbol(pricingData.currency)}${pricingData.premiumPrice}`, 
      period: '/month',
      description: 'For organizations with advanced governance, integrations, and executive workflows.',
      features: ['Everything in Pro', 'Custom integrations', 'Advanced reporting', 'Dedicated support', 'API access'],
    },
  ];

  return (
    <MarketingLayout>
      <section className="px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center relative">
          
          <div className="absolute right-0 top-0 hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
            <Globe className="w-4 h-4 text-emerald-400" />
            <select 
              value={pricingData.country}
              onChange={handleCountryChange}
              className="bg-transparent text-white text-sm outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="US" className="text-black">United States (USD)</option>
              <option value="IN" className="text-black">India (INR)</option>
              <option value="GB" className="text-black">United Kingdom (GBP)</option>
            </select>
            <span className="text-xs text-white/40 border-l border-white/10 pl-2 ml-1">
              Smart Pricing Active
            </span>
          </div>

          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="section-kicker"
          >
            {t('pricing')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.04 }}
            className="mt-6 text-5xl font-black leading-[0.95] text-white sm:text-6xl"
          >
            Premium intelligence for every stage of company growth.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300"
          >
            Our platform aligns planning, reporting, and insight generation inside one premium workflow.
          </motion.p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 * index }}
              className={`rounded-[36px] p-[1px] ${
                plan.featured
                  ? 'bg-[linear-gradient(135deg,rgba(255,255,255,0.55),rgba(251,191,36,0.45),rgba(34,211,238,0.55))]'
                  : 'bg-white/10'
              }`}
            >
              <div className="brand-panel h-full rounded-[35px] p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{plan.description}</p>
                  </div>
                  {plan.featured && (
                    <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mt-10 flex items-end gap-2">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  {plan.period ? <span className="pb-1 text-sm text-slate-400">{plan.period}</span> : null}
                </div>

                <div className="mt-10 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                      <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300/15">
                        <Check className="h-3.5 w-3.5 text-cyan-200" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={plan.price === 'Free' ? '/login' : '/payments'}
                  className={`mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:scale-[1.02] ${
                    plan.featured
                      ? 'bg-white text-slate-950'
                      : 'border border-white/15 bg-white/5 text-white'
                  }`}
                >
                  {plan.price === 'Free' ? 'Get started' : `Get ${plan.name}`}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      
      <div className="md:hidden flex justify-center mt-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
            <Globe className="w-4 h-4 text-emerald-400" />
            <select 
              value={pricingData.country}
              onChange={handleCountryChange}
              className="bg-transparent text-white text-sm outline-none cursor-pointer pr-4"
            >
              <option value="US" className="text-black">US (USD)</option>
              <option value="IN" className="text-black">IN (INR)</option>
              <option value="GB" className="text-black">UK (GBP)</option>
            </select>
          </div>
      </div>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[40px] border border-white/10 bg-white/[0.035] p-8 shadow-[0_30px_90px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="section-kicker">What’s Included</span>
              <h2 className="mt-6 text-4xl font-black text-white">Every plan carries the Finly design standard.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Premium reporting interface',
                'Secure access controls',
                'Cross-functional visibility',
                'Frictionless onboarding',
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-slate-950/35 px-5 py-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
