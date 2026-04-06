import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { PremiumButton } from './ui/PremiumComponents';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatingTransition = {
  duration: 9,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: 'easeInOut',
};

const stats = [
  { label: 'Forecast accuracy', value: '98.4%' },
  { label: 'Operational speed', value: '6.2x' },
  { label: 'Decision confidence', value: '24/7' },
];

const insightCards = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    title: 'Revenue pulse',
    value: '+28%',
    tone: 'from-emerald-400/30 to-cyan-400/10',
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Risk control',
    value: 'Stable',
    tone: 'from-sky-400/30 to-indigo-400/10',
  },
  {
    icon: <Zap className="h-4 w-4" />,
    title: 'Automation',
    value: 'Live',
    tone: 'from-fuchsia-400/30 to-violet-400/10',
  },
];

export default function Hero({ onPrimaryClick, onSecondaryClick }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#020617_0%,#050816_38%,#0b1022_74%,#020617_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(56,189,248,0.24),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(168,85,247,0.2),transparent_26%),radial-gradient(circle_at_58%_82%,rgba(34,197,94,0.08),transparent_20%)]" />

      <motion.div
        className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-500/18 blur-[110px]"
        animate={{ x: [0, 48, 0], y: [0, -18, 0], opacity: [0.45, 0.72, 0.45] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-4rem] top-12 h-96 w-96 rounded-full bg-fuchsia-500/16 blur-[135px]"
        animate={{ x: [0, -42, 0], y: [0, 24, 0], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-5rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/12 blur-[150px]"
        animate={{ scale: [1, 1.14, 1], opacity: [0.24, 0.42, 0.24] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 pb-20 pt-24 md:px-10 lg:grid-cols-[1.02fr_0.98fr] lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl text-center lg:text-left"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 backdrop-blur-xl"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-500 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.4)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
              Finly Premium Intelligence
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-8 text-balance text-[3rem] font-black leading-[0.95] tracking-[-0.08em] text-white sm:text-[4.2rem] lg:text-[5.35rem]"
          >
            Turn every business signal into
            <span className="mt-2 block bg-[linear-gradient(135deg,#e0f2fe_0%,#7dd3fc_26%,#a78bfa_60%,#f0abfc_100%)] bg-clip-text text-transparent">
              confident action.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg lg:mx-0 lg:max-w-xl"
          >
            Monitor revenue, uncover risk, and automate decisions with a polished intelligence
            workspace built for fast-moving teams.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
          >
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <button
                type="button"
                onClick={onPrimaryClick}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-sky-300/35 bg-[linear-gradient(135deg,#38bdf8_0%,#6366f1_48%,#a855f7_100%)] px-7 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[0_0_40px_rgba(99,102,241,0.38)] transition-all duration-300"
              >
                <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.26),transparent_38%,transparent_64%,rgba(255,255,255,0.18))] opacity-70" />
                <span className="absolute -inset-10 bg-[radial-gradient(circle,rgba(125,211,252,0.34),transparent_54%)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Start Free
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <button
                type="button"
                onClick={onSecondaryClick}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/14 bg-white/[0.06] px-7 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.1]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.08]">
                  <Play className="h-4 w-4 fill-current" />
                </span>
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-[132px]">
                <p className="text-2xl font-black tracking-[-0.06em] text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
        >
          <motion.div
            className="absolute h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.38),rgba(168,85,247,0.14),transparent_72%)] blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.52, 0.76, 0.52] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            animate={{ y: [-12, 14, -12], rotate: [0, 4, -3, 0] }}
            transition={floatingTransition}
            className="relative h-[25rem] w-full max-w-[34rem]"
          >
            <div className="absolute inset-x-8 bottom-2 h-10 rounded-full bg-cyan-400/18 blur-3xl" />

            <motion.div
              className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(56,189,248,0.06),rgba(99,102,241,0.44),rgba(168,85,247,0.1),rgba(56,189,248,0.06))] shadow-[0_0_70px_rgba(99,102,241,0.25)] backdrop-blur-xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-5 rounded-full border border-white/10 bg-slate-950/80" />
              <motion.div
                className="absolute inset-12 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(125,211,252,0.96),rgba(96,165,250,0.25),rgba(15,23,42,0.05))] shadow-[0_0_80px_rgba(56,189,248,0.48)]"
                animate={{ scale: [1, 1.08, 1], opacity: [0.84, 1, 0.84] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            <motion.div
              className="absolute left-4 top-8 rounded-[1.6rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-2xl shadow-[0_24px_80px_rgba(2,6,23,0.42)]"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Signal flow</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,rgba(34,197,94,0.9),rgba(56,189,248,0.85))] shadow-[0_0_24px_rgba(34,197,94,0.28)]" />
                <div>
                  <p className="text-sm font-semibold text-white">Live ingestion</p>
                  <p className="text-xs text-slate-400">Invoices, banking, ops</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-8 right-0 w-[14rem] rounded-[1.8rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur-2xl shadow-[0_24px_80px_rgba(2,6,23,0.42)]"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Smart pulse</p>
              <div className="mt-4 space-y-3">
                {insightCards.map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-200">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${card.tone}`}>
                          {card.icon}
                        </span>
                        <span className="text-sm font-semibold">{card.title}</span>
                      </div>
                      <span className="text-sm font-bold tracking-[-0.03em] text-white">{card.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="absolute right-20 top-12 h-24 w-24 rounded-full border border-cyan-200/20 bg-cyan-300/12 backdrop-blur-3xl"
              animate={{ y: [0, 22, 0], x: [0, -10, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-16 left-14 h-16 w-16 rounded-full border border-fuchsia-200/20 bg-fuchsia-300/12 backdrop-blur-3xl"
              animate={{ y: [0, -18, 0], x: [0, 8, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
