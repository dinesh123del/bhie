import { motion } from 'framer-motion';
import { Download, Sparkles, Wand2 } from 'lucide-react';
import { PremiumBadge, PremiumButton, PremiumCard } from './ui/PremiumComponents';
import { ActionRecommendation } from '../utils/dashboardIntelligence';

interface ActionCenterProps {
  recommendations: ActionRecommendation[];
  onAskWhatShouldIDo: () => void;
  onExport: () => void;
}

const priorityClasses = {
  high: 'border-rose-400/15 bg-rose-500/10 text-rose-200',
  medium: 'border-amber-400/15 bg-amber-500/10 text-amber-200',
  low: 'border-sky-400/15 bg-sky-500/10 text-sky-200',
};

export default function ActionCenter({
  recommendations,
  onAskWhatShouldIDo,
  onExport,
}: ActionCenterProps) {
  return (
    <PremiumCard gradient hoverable={false} className="h-full min-h-[420px] border border-white/10">
      <div className="flex h-full flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <PremiumBadge tone="brand" icon={<Wand2 className="h-3.5 w-3.5" />}>
              What should I do?
            </PremiumBadge>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">Action center</h3>
              <p className="mt-2 text-sm leading-7 text-ink-300">
                Focus only on the next moves that can improve profit, reduce cost, or sharpen decisions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <PremiumButton variant="primary" onClick={onAskWhatShouldIDo} icon={<Sparkles className="h-4 w-4" />}>
              What should I do?
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={onExport} icon={<Download className="h-4 w-4" />}>
              Export report
            </PremiumButton>
          </div>
        </div>

        <div className="grid gap-3">
          {recommendations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.45, delay: 0.06 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-300">{item.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">{item.impact}</p>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${priorityClasses[item.priority]}`}>
                  {item.priority}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
}
