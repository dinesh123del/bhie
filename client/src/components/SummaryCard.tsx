import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RiArrowDownLine, RiArrowRightLine, RiArrowUpLine } from 'react-icons/ri';
import { PremiumCard } from './ui/PremiumComponents';

interface SummaryCardProps {
  title: string;
  value: ReactNode;
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
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <div className={`group relative h-full overflow-hidden rounded-[3rem] p-px transition-all duration-500 shadow-2xl ${highlight ? 'bg-gradient-to-br from-brand-400 to-purple-500' : 'bg-white/10 hover:bg-white/20'}`}>
        <div className="relative h-full bg-white dark:bg-[#0A0A0B] rounded-[2.95rem] p-10 flex flex-col justify-between gap-8 backdrop-blur-3xl transition-colors duration-500 group-hover:bg-white/95 dark:group-hover:bg-[#121214]">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTone.halo} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-[#C0C0C0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {title}
                </p>
                <div className="text-4xl md:text-5xl font-[900] tracking-tighter text-gray-900 dark:text-white leading-none tabular-nums">
                  {value}
                </div>
              </div>

              <div className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] border backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 ${currentTone.iconWrap}`}>
                {icon}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
               <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${currentTone.chip}`}>
                {currentTone.indicator}
                {change}
              </span>
            </div>
          </div>

          <p className="relative z-10 text-sm leading-relaxed font-semibold text-gray-500 dark:text-[#C0C0C0] group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
            {detail}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
