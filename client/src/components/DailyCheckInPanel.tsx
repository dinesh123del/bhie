import { CheckCircle2, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { PremiumBadge, PremiumButton, PremiumCard } from './ui/PremiumComponents';
import { DailyStatusItem } from '../utils/dashboardIntelligence';

interface DailyCheckInPanelProps {
  items: DailyStatusItem[];
  confirmationMessage: string;
  onRefresh: () => void;
  refreshing: boolean;
}

const toneClasses = {
  positive: 'border-emerald-400/15 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-400/15 bg-amber-500/10 text-amber-200',
  brand: 'border-sky-400/15 bg-sky-500/10 text-sky-200',
};

export default function DailyCheckInPanel({
  items,
  confirmationMessage,
  onRefresh,
  refreshing,
}: DailyCheckInPanelProps) {
  return (
    <PremiumCard hoverable={false} className="h-full min-h-[420px] border border-white/10">
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <PremiumBadge tone="positive" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Daily check-in
            </PremiumBadge>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl">Business status for today</h3>
              <p className="mt-2 text-sm leading-7 text-ink-300">
                Clear status, fresh sync time, and a trust signal you can check in seconds.
              </p>
            </div>
          </div>

          <PremiumButton
            variant="secondary"
            onClick={onRefresh}
            loading={refreshing}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </PremiumButton>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{item.label}</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-base font-semibold text-white">{item.value}</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[item.tone]}`}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-[1.5rem] border border-emerald-400/15 bg-emerald-500/10 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Confirmation</p>
              <p className="mt-2 text-sm leading-6 text-ink-200">{confirmationMessage}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
