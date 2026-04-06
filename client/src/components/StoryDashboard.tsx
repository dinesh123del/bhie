import { motion } from 'framer-motion';
import { BookOpenText, Clock3 } from 'lucide-react';
import { PremiumBadge, PremiumCard } from './ui/PremiumComponents';
import { StoryBullet } from '../utils/dashboardIntelligence';

interface StoryDashboardProps {
  bullets: StoryBullet[];
  dailySummary: string;
}

export default function StoryDashboard({ bullets, dailySummary }: StoryDashboardProps) {
  return (
    <PremiumCard hoverable={false} className="h-full min-h-[420px] border border-white/10">
      <div className="flex h-full flex-col gap-6">
        <div className="space-y-3">
          <PremiumBadge tone="neutral" icon={<BookOpenText className="h-3.5 w-3.5" />}>
            Story dashboard
          </PremiumBadge>
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">Your numbers, written clearly</h3>
            <p className="mt-2 text-sm leading-7 text-ink-300">
              Finly translates raw metrics into readable business updates for faster decisions.
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-sky-300/15 bg-sky-400/10 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-sky-100">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/80">Daily summary</p>
              <p className="mt-2 text-base font-medium leading-7 text-white">{dailySummary}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {bullets.map((bullet, index) => (
            <motion.div
              key={bullet.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{bullet.title}</p>
              <p className="mt-2 text-sm leading-6 text-white">{bullet.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
}
