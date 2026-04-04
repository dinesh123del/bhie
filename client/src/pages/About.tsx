import { motion } from 'framer-motion';
import { ArrowRight, Building2, Orbit, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../components/marketing/MarketingLayout';

const principles = [
  {
    title: 'Clarity over dashboards',
    description: 'We design every BHIE experience to shorten the path from signal to action.',
  },
  {
    title: 'Automation with accountability',
    description: 'Intelligence should support teams with traceable, operationally useful decisions.',
  },
  {
    title: 'Enterprise trust by default',
    description: 'Security, governance, and reliability stay visible from pilot to scale.',
  },
];

const milestones = [
  'Unified finance, ops, and growth signals into one decision surface.',
  'Created automated analysis flows for leadership and revenue teams.',
  'Built enterprise-ready monitoring for scaling, forecasting, and planning.',
];

export default function About() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-kicker">About BHIE</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl"
            >
              We build the operating layer for companies that want to move with precision.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-2xl text-lg leading-8 text-slate-300"
            >
              BHIE turns fragmented business data into one living system for forecasting, prioritization, and decisive execution.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="brand-panel relative overflow-hidden rounded-[36px] p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%)]" />
            <div className="relative grid gap-4">
              <div className="flex items-center gap-3 text-cyan-200">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.28em]">Company Profile</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <Building2 className="mb-4 h-6 w-6 text-amber-300" />
                  <p className="text-sm leading-7 text-slate-300">
                    Founded for operators, analysts, and founders who need business intelligence that behaves like a strategic teammate.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <Orbit className="mb-4 h-6 w-6 text-cyan-300" />
                  <p className="text-sm leading-7 text-slate-300">
                    Our platform aligns planning, reporting, and insight generation inside one premium workflow.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <ShieldCheck className="mb-4 h-6 w-6 text-emerald-300" />
                  <p className="text-sm leading-7 text-slate-300">
                    Teams trust BHIE for reliable visibility across operations, revenue, and performance risk.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <motion.article
              key={principle.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="brand-panel rounded-[32px] p-8"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
                0{index + 1}
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">{principle.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{principle.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[40px] border border-white/10 bg-white/[0.035] p-8 shadow-[0_30px_90px_rgba(2,6,23,0.4)] backdrop-blur-xl sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="section-kicker">Momentum</span>
              <h2 className="mt-6 text-4xl font-black text-white">Designed for the next chapter of BHIE.</h2>
            </div>
            <div className="space-y-5">
              {milestones.map((milestone) => (
                <div key={milestone} className="rounded-[24px] border border-white/10 bg-slate-950/40 px-5 py-4 text-sm leading-7 text-slate-300">
                  {milestone}
                </div>
              ))}
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                Talk to BHIE
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
