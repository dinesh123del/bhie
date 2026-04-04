import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, HeartPulse } from 'lucide-react';
import Ring from './Ring';
import AnimatedNumber from './AnimatedNumber';
import { PremiumBadge, PremiumCard } from './ui/PremiumComponents';
import { HealthBreakdownItem } from '../utils/dashboardIntelligence';

interface BusinessHealthEngineProps {
  score: number;
  status: string;
  breakdown: HealthBreakdownItem[];
}

const toneClasses = {
  positive: 'border-emerald-400/18 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-400/18 bg-amber-500/10 text-amber-200',
  danger: 'border-rose-400/18 bg-rose-500/10 text-rose-200',
  brand: 'border-sky-300/18 bg-sky-400/10 text-sky-100',
};

export default function BusinessHealthEngine({
  score,
  status,
  breakdown,
}: BusinessHealthEngineProps) {
  return (
    <PremiumCard gradient hoverable={false} className="min-h-[430px] overflow-hidden border border-white/10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(125,211,252,0.14),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(129,140,248,0.12),transparent_26%),radial-gradient(circle_at_50%_82%,rgba(96,165,250,0.08),transparent_24%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative flex h-[300px] w-[300px] items-center justify-center">
            <div className="absolute inset-12 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(255,255,255,0.02))] blur-2xl" />
            <Ring
              size={280}
              progress={score}
              strokeWidth={26}
              label="Health"
              colors={['#7dd3fc', '#818cf8']}
              glowColor="rgba(129,140,248,0.38)"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ink-400">Health score</p>
                <AnimatedNumber
                  value={score}
                  className="mt-2 block text-[3rem] font-semibold tracking-[-0.09em] text-white"
                />
                <p className="mt-2 text-sm font-medium text-ink-200">{status}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-md">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-slate-950 shadow-brand-glow">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Business health engine</p>
              <p className="text-sm font-medium text-white">One score. Three drivers. Clear action.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div>
            <PremiumBadge tone="brand" icon={<Activity className="h-3.5 w-3.5" />}>
              Single score
            </PremiumBadge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-white md:text-4xl">
              Revenue, expenses, and profit in one clean view
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-300 md:text-base">
              BHIE turns your latest business data into a health score that is easy to trust and fast to act on.
            </p>
          </div>

          <div className="grid gap-4">
            {breakdown.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.45, delay: 0.08 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white">{item.displayValue}</p>
                    <p className="mt-2 text-sm leading-6 text-ink-300">{item.insight}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[item.tone]}`}>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <AnimatedNumber value={item.value} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
