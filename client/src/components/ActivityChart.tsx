import { motion } from 'framer-motion';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PremiumBadge, PremiumCard } from './ui/PremiumComponents';

export interface ActivityPoint {
  day: string;
  uploads: number;
  transactions: number;
}

interface ActivityChartProps {
  data: ActivityPoint[];
}

const tooltipStyle = {
  backgroundColor: 'rgba(6, 11, 23, 0.96)',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  borderRadius: '18px',
  boxShadow: '0 24px 60px rgba(2, 6, 23, 0.45)',
};

const ActivityChart = ({ data }: ActivityChartProps) => {
  const totalUploads = data.reduce((sum, item) => sum + item.uploads, 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <PremiumCard gradient hoverable={false} className="h-full min-h-[440px] border border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_26%)]" />

        <div className="relative flex h-full flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <PremiumBadge tone="neutral">Activity timeline</PremiumBadge>
              <div>
                <h3 className="text-[2rem] font-black tracking-[-0.06em] text-white">Daily uploads and transactions</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-300">
                  Bar height shows uploads. The line shows transaction activity across the last seven days.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Uploads</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-white">{totalUploads}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Transactions</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-white">{totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboard-uploads-bar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.12} />
                  </linearGradient>
                  <linearGradient id="dashboard-transactions-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value: number) => [value.toLocaleString('en-IN'), '']}
                />
                <Bar
                  dataKey="uploads"
                  fill="url(#dashboard-uploads-bar)"
                  barSize={20}
                  radius={[14, 14, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="url(#dashboard-transactions-line)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#60a5fa', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#a855f7', stroke: '#0f172a', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
};

export default ActivityChart;
