import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RiArrowDownLine, RiArrowRightLine, RiArrowUpLine } from 'react-icons/ri';
import { PremiumCard } from './ui/PremiumComponents';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  detail: string;
  icon: ReactNode;
  tone?: 'positive' | 'negative' | 'accent';
  highlight?: boolean;
}

const toneStyles = {
  positive: {
    halo: 'from-emerald-500/14 via-emerald-400/8 to-transparent',
    chip: 'border-emerald-400/20 bg-emerald-500/12 text-emerald-200',
    iconWrap: 'border-emerald-400/20 bg-emerald-500/12 text-emerald-200',
    indicator: <RiArrowUpLine className="h-4 w-4" />,
  },
  negative: {
    halo: 'from-amber-500/12 via-amber-400/8 to-transparent',
    chip: 'border-amber-400/20 bg-amber-500/12 text-amber-200',
    iconWrap: 'border-amber-400/20 bg-amber-500/12 text-amber-200',
    indicator: <RiArrowDownLine className="h-4 w-4" />,
  },
  accent: {
    halo: 'from-sky-500/14 via-indigo-500/8 to-transparent',
    chip: 'border-sky-300/20 bg-sky-400/12 text-sky-100',
    iconWrap: 'border-sky-300/20 bg-sky-400/12 text-sky-100',
    indicator: <RiArrowRightLine className="h-4 w-4" />,
  },
};

const SummaryCard = ({
  title,
  value,
  change,
  detail,
  icon,
  tone = 'positive',
  highlight = false,
}: SummaryCardProps) => {
  const currentTone = toneStyles[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <PremiumCard
        gradient={highlight}
        hoverable={false}
        className={`h-full min-h-[230px] border ${highlight ? 'border-white/15 shadow-glass-hover' : 'border-white/10'}`}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${currentTone.halo} opacity-80`} />

        <div className="relative flex h-full flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">{title}</p>
              <h3 className="text-3xl font-semibold tracking-[-0.06em] text-white md:text-[2.4rem]">{value}</h3>
            </div>

            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-md ${currentTone.iconWrap}`}>
              {icon}
            </div>
          </div>

          <div className="space-y-3">
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${currentTone.chip}`}>
              {currentTone.indicator}
              {change}
            </span>
            <p className="max-w-xs text-sm leading-6 text-ink-300">{detail}</p>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
};

export default SummaryCard;
