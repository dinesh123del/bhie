import { motion } from 'framer-motion';
import {
  RiAlarmWarningLine,
  RiArrowUpCircleLine,
  RiLockLine,
  RiInformationLine,
  RiSparkling2Fill,
} from 'react-icons/ri';
import { PremiumBadge, PremiumCard } from './ui/PremiumComponents';

export interface InsightItem {
  type: 'positive' | 'warning' | 'info';
  message: string;
  detail?: string;
  metric?: 'revenue' | 'expenses' | 'profit' | 'activity' | 'general';
  value?: string;
}

interface InsightsPanelProps {
  insights: InsightItem[];
  generatedAt: string;
  locked?: boolean;
  onUpgrade?: () => void;
}

const toneClasses = {
  positive: {
    badge: 'positive' as const,
    border: 'border-emerald-400/15',
    glow: 'from-emerald-500/14 via-transparent to-transparent',
    iconWrap: 'border-emerald-400/15 bg-emerald-500/10 text-emerald-200',
    icon: <RiArrowUpCircleLine className="h-5 w-5" />,
  },
  warning: {
    badge: 'warning' as const,
    border: 'border-amber-400/15',
    glow: 'from-amber-500/14 via-transparent to-transparent',
    iconWrap: 'border-amber-400/15 bg-amber-500/10 text-amber-200',
    icon: <RiAlarmWarningLine className="h-5 w-5" />,
  },
  info: {
    badge: 'brand' as const,
    border: 'border-indigo-400/15',
    glow: 'from-indigo-500/14 via-transparent to-transparent',
    iconWrap: 'border-indigo-400/15 bg-indigo-500/10 text-indigo-200',
    icon: <RiInformationLine className="h-5 w-5" />,
  },
};

const InsightsPanel = ({ insights, generatedAt, locked = false, onUpgrade }: InsightsPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <PremiumCard gradient hoverable={false} className="h-full min-h-[440px] border border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.12),transparent_30%)]" />

        <div className="relative flex h-full flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <PremiumBadge tone="brand">AI insights</PremiumBadge>
              <div>
                <h3 className="text-[1.95rem] font-black tracking-[-0.06em] text-white">What changed today</h3>
                <p className="mt-2 text-sm leading-6 text-ink-300">
                  Auto-highlighted patterns from revenue, expenses, profit, and activity data.
                </p>
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-200">
              <RiSparkling2Fill className="h-6 w-6" />
            </div>
          </div>

          {locked ? (
            <div className="rounded-[1.5rem] border border-dashed border-amber-400/20 bg-amber-500/10 px-5 py-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/12 text-amber-200">
                  <RiLockLine className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">AI insights are available on Pro and Enterprise</p>
                  <p className="mt-2 text-sm leading-6 text-ink-300">
                    Upgrade your plan to unlock automatic business insights, warnings, and premium recommendations.
                  </p>
                  {onUpgrade ? (
                    <button
                      type="button"
                      onClick={onUpgrade}
                      className="mt-4 rounded-full border border-amber-400/25 bg-amber-500/14 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
                    >
                      Upgrade plan
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const tone = toneClasses[insight.type];

                return (
                  <motion.div
                    key={`${insight.type}-${insight.metric || 'general'}-${insight.message}`}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative overflow-hidden rounded-[1.5rem] border ${tone.border} bg-white/[0.04] p-4`}
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${tone.glow}`} />

                    <div className="relative flex items-start gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${tone.iconWrap}`}>
                        {tone.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{insight.message}</p>
                            {insight.detail ? (
                              <p className="mt-1 text-sm leading-6 text-ink-300">{insight.detail}</p>
                            ) : null}
                          </div>

                          {insight.value ? <PremiumBadge tone={tone.badge}>{insight.value}</PremiumBadge> : null}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] px-5 py-6">
              <p className="text-sm font-semibold text-white">No insights available yet</p>
              <p className="mt-2 text-sm leading-6 text-ink-300">
                Add more records and upload business documents to unlock smart recommendations.
              </p>
            </div>
          )}

          <div className="mt-auto rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">Last refresh</p>
            <p className="mt-2 text-sm leading-6 text-white">{generatedAt}</p>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
};

export default InsightsPanel;
