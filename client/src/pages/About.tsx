import { motion } from 'framer-motion';
import { ArrowRight, Building2, Orbit, ShieldCheck, Sparkles, Zap, ZapOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../components/marketing/MarketingLayout';

const principles = [
  {
    title: 'Focus on Growth',
    description: 'We make it easy to see exactly what you need to do next to grow.',
  },
  {
    title: 'Simple Decisions',
    description: 'We give you the facts so you can make smart choices for your business.',
  },
  {
    title: 'Safety First',
    description: 'Your business data is always safe, encrypted, and private.',
  },
];

const milestones = [
  'Money and growth info all in one easy place.',
  'Smart reports that tell you exactly how you are doing.',
  'Built for growing businesses that want to stay organized.',
];

export default function About() {
  return (
    <MarketingLayout>
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-kicker">About BIZ PLUS</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-3xl text-6xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl"
            >
              Your business story,{' '}
              told simply.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-xl text-lg leading-relaxed text-slate-400"
            >
              BIZ PLUS turns messy lists of bills and numbers into a clear plan for you to grow.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 60, delay: 0.2 }}
            className="group relative overflow-hidden rounded-[48px] border border-white/10 bg-slate-900 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <img
              src="/about_hero_image_1775387707759.png"
              alt="Intelligence Hub"
              className="aspect-square h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4">
              <div className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Assistant Online</span>
              </div>
              <h3 className="text-3xl font-bold text-white">Building the Future of Decisions.</h3>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <motion.article
              key={principle.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.03] p-10 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-white/[0.06]"
            >
              <div className="mb-8 text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
                0{index + 1}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{principle.title}</h2>
              <p className="mt-4 text-sm leading-8 text-slate-400">{principle.description}</p>
              <div className="mt-8 flex h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ x: '-100%' }}
                  whileInView={{ x: '0%' }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="h-full w-full bg-cyan-500"
                />
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <span className="section-kicker mx-auto">Our Story</span>
            <h2 className="mt-6 text-4xl font-black text-white sm:text-5xl">Built by people who understand business.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Dinesh Bolla', role: 'Founder & CEO', bio: 'Building tools that help small business owners track their money and grow confidently.' },
              { name: 'Engineering Team', role: 'Product & Engineering', bio: 'A dedicated team focused on making financial tools simple, fast, and reliable.' },
              { name: 'Support Team', role: 'Customer Success', bio: 'Real people ready to help you get started and answer any questions along the way.' },
            ].map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 text-center transition-all hover:bg-white/[0.08]"
              >
                <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-1">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-3xl font-black text-white">
                    {member.name[0]}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-cyan-400">{member.role}</p>
                <p className="mt-4 text-sm leading-7 text-slate-400">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[48px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-1 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[44px] bg-slate-950/80 p-8 sm:p-16">
            <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-6">
                <span className="section-kicker">Our Vision</span>
                <h2 className="text-4xl font-black text-white sm:text-5xl">Built to help you succeed.</h2>
                <p className="text-lg text-slate-400">BIZ PLUS is here to make business simple for everyone.</p>
              </div>
              <div className="grid gap-4">
                {milestones.map((milestone, idx) => (
                  <motion.div
                    key={milestone}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-5 rounded-[24px] border border-white/10 bg-white/5 px-6 py-5 text-sm font-medium text-slate-300"
                  >
                    <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Zap size={14} />
                    </div>
                    {milestone}
                  </motion.div>
                ))}
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-4 rounded-2xl bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
                  >
                    Partner with BIZ PLUS
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
