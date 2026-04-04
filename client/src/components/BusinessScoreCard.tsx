import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Award,
  BarChart3,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PremiumBadge, PremiumCard } from './ui/PremiumComponents';
import { AnimatedNumber } from './AnimatedNumber';


interface Breakdown {
  profitability: number;
  growth: number;
  activity: number;
  efficiency: number;
}

interface ScoreData {
  score: number;
  status: string;
  breakdown: Breakdown;
}

interface BusinessScoreCardProps {
  scoreData?: ScoreData;
  loading?: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Excellent':
      return {
        tone: 'positive' as const,
        icon: Award,
        gradient: 'from-emerald-400/30 via-emerald-500/18 to-transparent',
        ring: '#34d399',
      };
    case 'Good':
      return {
        tone: 'brand' as const,
        icon: ShieldCheck,
        gradient: 'from-sky-400/30 via-indigo-500/18 to-transparent',
        ring: '#818cf8',
      };
    case 'Average':
      return {
        tone: 'warning' as const,
        icon: BarChart3,
        gradient: 'from-amber-400/28 via-orange-500/18 to-transparent',
        ring: '#f59e0b',
      };
    default:
      return {
        tone: 'danger' as const,
        icon: AlertTriangle,
        gradient: 'from-rose-400/30 via-rose-500/18 to-transparent',
        ring: '#fb7185',
      };
  }
};

const getSuggestion = (breakdown: Breakdown) => {
  const lowest = Object.entries(breakdown).reduce((lowestEntry, currentEntry) =>
    lowestEntry[1] < currentEntry[1] ? lowestEntry : currentEntry
  );

  const suggestions = {
    profitability: 'Reduce unnecessary spending and focus more on your best-selling offers.',
    growth: 'Work on getting more customers or increasing repeat sales.',
    activity: 'Add more records regularly so the dashboard can guide you better.',
    efficiency: 'Simplify repeated work and remove steps that waste time.',
  };

  return suggestions[lowest[0] as keyof typeof suggestions] ?? 'Keep compounding the current momentum.';
};

const normalizeBreakdownValue = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const BusinessScoreCard: React.FC<BusinessScoreCardProps> = ({ scoreData, loading = false }) => {
  if (loading) {
    return (
      <PremiumCard className="min-h-[360px] group hover:scale-105 transition-all duration-300 card-glow glow-pulse" gradient>
        <div className="animate-pulse space-y-7">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-4 w-32 rounded-full bg-white/10" />
              <div className="h-10 w-48 rounded-2xl bg-white/10" />
            </div>
            <div className="h-24 w-24 rounded-full bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="mb-3 h-4 w-20 rounded-full bg-white/10" />
                <div className="h-2 w-full rounded-full bg-white/10" />
              </div>
            ))}
          </div>
          <div className="h-20 rounded-[1.5rem] bg-white/10" />
        </div>
      </PremiumCard>
    );
  }

  if (!scoreData) {
    return (
      <PremiumCard className="min-h-[360px]" gradient>
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <ShieldCheck className="h-9 w-9 text-ink-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-[-0.05em] text-white">Business Health</h3>
            <p className="mx-auto max-w-sm text-sm leading-6 text-ink-300">
              Add company details and records to see your business score here.
            </p>
          </div>
        </div>
      </PremiumCard>
    );
  }

  const safeScore = Math.max(0, Math.min(scoreData.score, 100));
  const status = getStatusConfig(scoreData.status);
  const StatusIcon = status.icon;
  const suggestion = getSuggestion(scoreData.breakdown);

  const breakdowns = [
    {
      label: 'Profitability',
      value: normalizeBreakdownValue(scoreData.breakdown.profitability),
      icon: DollarSign,
      tone: 'text-emerald-300',
      fill: 'from-emerald-400 to-teal-300',
    },
    {
      label: 'Growth',
      value: normalizeBreakdownValue(scoreData.breakdown.growth),
      icon: TrendingUp,
      tone: 'text-sky-300',
      fill: 'from-sky-400 to-indigo-300',
    },
    {
      label: 'Record activity',
      value: normalizeBreakdownValue(scoreData.breakdown.activity),
      icon: Users,
      tone: 'text-indigo-200',
      fill: 'from-indigo-400 to-violet-300',
    },
    {
      label: 'Work speed',
      value: normalizeBreakdownValue(scoreData.breakdown.efficiency),
      icon: BarChart3,
      tone: 'text-fuchsia-200',
      fill: 'from-fuchsia-400 to-violet-300',
    },
  ];

  return (
    <PremiumCard className="min-h-[360px] group hover:scale-105 transition-all duration-300 card-glow glow-pulse" gradient>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${status.gradient} opacity-80`} />

      <div className="relative grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="section-kicker">
                <StatusIcon className="h-3.5 w-3.5" />
                Business score
              </div>
              <div>
                <h3 className="text-[2rem] font-black tracking-[-0.07em] text-white">Business Health</h3>
                <p className="max-w-md text-sm leading-6 text-ink-300">
                  This score is based on profit, growth, records, and how smoothly your work is running.
                </p>
              </div>
            </div>

            <PremiumBadge tone={status.tone}>
              {scoreData.status}
            </PremiumBadge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {breakdowns.map(({ label, value, icon: Icon, tone, fill }) => (
              <div
                key={label}
                className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-xl"
              >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${tone}`} />
                      <span className="text-sm font-semibold text-ink-100">{label}</span>
                    </div>
                    <AnimatedNumber value={value} className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400" />
                  </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${fill}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">What to improve first</p>
            <p className="text-sm leading-6 text-ink-200">{suggestion}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 rounded-[1.8rem] border border-white/10 bg-white/[0.05] px-5 py-6 text-center">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full card-glow shadow-outer-ring-glow [filter:drop-shadow(0_0_25px_rgba(255,255,255,0.3))]"
            style={{
              background: `conic-gradient(${status.ring} ${safeScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            }}
          >
            <div className="absolute inset-[11px] rounded-full border border-white/10 bg-[#08101f]/95 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-[1] flex flex-col items-center"
            >
              <AnimatedNumber value={safeScore} className="text-[3.1rem] font-black tracking-[-0.09em] text-white" />
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-400">Out of 100</div>
            </motion.div>

          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.26em] text-ink-400">Current Status</div>
            <div className="text-2xl font-black tracking-[-0.06em] text-white">{scoreData.status}</div>
            <p className="max-w-[16rem] text-sm leading-6 text-ink-300">
              Try to keep this score above 70 by improving the lowest category first.
            </p>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

export default BusinessScoreCard;
