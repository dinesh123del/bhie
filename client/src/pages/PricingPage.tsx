import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../components/marketing/MarketingLayout';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For early teams that want a sharper view of business health.',
    features: ['Core analytics workspace', 'Weekly intelligence summary', 'Up to 3 team members'],
  },
  {
    name: 'Growth',
    price: '₹59',
    period: '/month',
    description: 'For scaling companies that need live planning, forecasting, and AI assistance.',
    features: ['Live business intelligence dashboards', 'Forecasting and predictive insights', 'Unlimited stakeholders', 'Priority implementation support'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '₹119',
    period: '/month',
    description: 'For organizations with advanced governance, integrations, and executive workflows.',
    features: ['Custom data pipelines', 'Advanced security controls', 'Dedicated success partner', 'Executive reporting design'],
  },
];

export default function PricingPage() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="section-kicker"
          >
            Pricing
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
            Start free, move fast with Growth, or design an enterprise rollout with BHIE specialists.
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
                  to={plan.name === 'Enterprise' ? '/contact' : '/login'}
                  className={`mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:scale-[1.02] ${
                    plan.featured
                      ? 'bg-white text-slate-950'
                      : 'border border-white/15 bg-white/5 text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[40px] border border-white/10 bg-white/[0.035] p-8 shadow-[0_30px_90px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="section-kicker">What’s Included</span>
              <h2 className="mt-6 text-4xl font-black text-white">Every plan carries the BHIE design standard.</h2>
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
