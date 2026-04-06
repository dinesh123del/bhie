import { useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  FileText,
  IndianRupee,
  ScanSearch,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MainLayout } from '../components/Layout/MainLayout';
import { PremiumButton, PremiumCard } from '../components/ui/PremiumComponents';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const sidebarItems = [
  { icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard', href: '/dashboard' },
  { icon: <FileText className="h-5 w-5" />, label: 'Records', href: '/records' },
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Analytics', href: '/analytics' },
  { icon: <Users className="h-5 w-5" />, label: 'Admin', href: '/admin' },
  { icon: <Wallet className="h-5 w-5" />, label: 'Billing', href: '/pricing' },
  { icon: <ScanSearch className="h-5 w-5" />, label: 'Image Search', href: '/image-intelligence' },
];

const FILTERS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Data', value: 'all' },
];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatCurrency(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatCompactNumber(value) {
  return compactNumberFormatter.format(Number.isFinite(value) ? value : 0);
}

function normalizeAnalytics(summaryPayload) {
  const monthlyData = summaryPayload?.monthlyData;

  if (Array.isArray(monthlyData) && monthlyData.length > 0) {
    return monthlyData.map((item, index) => ({
      date: item.month || `P${index + 1}`,
      revenue: Number(item.revenue || 0),
      expenses: Number(item.expenses || 0),
      profit: Number(item.revenue || 0) - Number(item.expenses || 0),
    }));
  }

  return [];
}

function filterChartData(data, range) {
  if (range === '7d') {
    return data.slice(-7);
  }

  if (range === '30d') {
    return data.slice(-30);
  }

  return data;
}

function StatCard({ label, value, accent, icon, detail }) {
  return (
    <PremiumCard hoverable={false} className="border border-white/10 bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.08em] text-white">{value}</p>
          <p className="mt-2 text-sm leading-7 text-ink-300">{detail}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-md ${accent}`}>
          {icon}
        </div>
      </div>
    </PremiumCard>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-[190px] rounded-2xl border border-white/10 bg-[rgba(11,15,25,0.88)] p-4 shadow-[0_22px_48px_rgba(2,6,23,0.34)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">{label}</p>
      <div className="mt-3 space-y-2.5">
        {payload.map((item) => (
          <div key={`${item.dataKey}-${item.name}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color || item.payload?.fill || '#7dd3fc' }}
              />
              <span className="text-sm text-ink-200">{item.name || item.dataKey}</span>
            </div>
            <span className="text-sm font-semibold text-white">{formatCurrency(Number(item.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <PremiumCard hoverable={false} className={`group h-full border border-white/10 ${className}`}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.06em] text-white">{subtitle}</h3>
        </div>
        <div className="h-[320px] w-full transition-transform duration-500 ease-premium group-hover:scale-[1.01]">
          {children}
        </div>
      </PremiumCard>
    </motion.div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState('');
  const chartIdBase = useId().replace(/:/g, '');

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        const response = await analyticsAPI.getSummary();
        if (active) {
          setSummary(response.data);
          setLoadError('');
        }
      } catch {
        if (active) {
          setSummary(null);
          setLoadError('Analytics is available, but no live summary could be loaded right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(() => {
    const normalized = normalizeAnalytics(summary);
    return filterChartData(normalized, range);
  }, [range, summary]);

  const chartIds = useMemo(
    () => ({
      revenueLine: `revenue-line-${chartIdBase}`,
      profitLine: `profit-line-${chartIdBase}`,
      expenseBar: `expense-bar-${chartIdBase}`,
      combinedRevenue: `combined-revenue-${chartIdBase}`,
      combinedExpense: `combined-expense-${chartIdBase}`,
    }),
    [chartIdBase]
  );

  const hasChartData = chartData.length > 0;

  const totals = useMemo(() => {
    return chartData.reduce(
      (accumulator, item) => {
        accumulator.revenue += Number(item.revenue || 0);
        accumulator.expenses += Number(item.expenses || 0);
        accumulator.profit += Number(item.profit || 0);
        return accumulator;
      },
      { revenue: 0, expenses: 0, profit: 0 }
    );
  }, [chartData]);

  const averageRevenue = chartData.length > 0 ? totals.revenue / chartData.length : 0;
  const averageExpense = chartData.length > 0 ? totals.expenses / chartData.length : 0;
  const profitMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

  const xAxisProps = {
    dataKey: 'date',
    stroke: '#94a3b8',
    tickLine: false,
    axisLine: false,
    tickMargin: 10,
  };

  const yAxisProps = {
    stroke: '#94a3b8',
    tickLine: false,
    axisLine: false,
    tickMargin: 10,
    tickFormatter: formatCompactNumber,
  };

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      activePage="/analytics"
      onNavigate={(href) => navigate(href)}
      onLogout={logout}
      userName={user?.name}
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_28%),rgba(11,15,25,0.78)] p-6 shadow-glass md:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="section-kicker">
                <CalendarRange className="h-3.5 w-3.5" />
                Live analytics
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.07em] text-white md:text-[3.4rem]">
                Business analytics command center
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-ink-300 md:text-lg">
                Explore revenue, expenses, profit, and side-by-side performance in a dedicated chart view.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setRange(filter.value)}
                  className={`rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-300 ease-premium ${
                    range === filter.value
                      ? 'border-sky-300/18 bg-sky-400/10 text-white shadow-brand-glow'
                      : 'border-white/10 bg-white/[0.04] text-ink-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(totals.revenue)}
            detail={hasChartData ? 'Income captured in the selected period.' : 'No live revenue data in the selected range yet.'}
            accent="border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            icon={<IndianRupee className="h-5 w-5" />}
          />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(totals.expenses)}
            detail={hasChartData ? 'Operating outflow across your records.' : 'No live expense data in the selected range yet.'}
            accent="border-rose-400/20 bg-rose-500/10 text-rose-200"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <StatCard
            label="Net Profit"
            value={formatCurrency(totals.profit)}
            detail={hasChartData ? `${profitMargin.toFixed(1)}% margin for the active window.` : 'Margin will appear once live records are available.'}
            accent="border-sky-300/20 bg-sky-400/10 text-sky-100"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Daily Average"
            value={formatCurrency(Math.max(averageRevenue - averageExpense, 0))}
            detail={hasChartData ? 'Average profit contribution per data point.' : 'Waiting for enough live data to calculate averages.'}
            accent="border-indigo-300/20 bg-indigo-400/10 text-indigo-100"
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </section>

        {hasChartData ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Revenue Trend" subtitle="Revenue movement over time" delay={0.05}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id={chartIds.revenueLine} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" vertical={false} />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: 'rgba(125,211,252,0.24)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={`url(#${chartIds.revenueLine})`}
                    strokeWidth={3.5}
                    dot={false}
                    activeDot={{ r: 6, fill: '#dbeafe', stroke: '#60a5fa', strokeWidth: 2 }}
                    animationDuration={1100}
                    animationBegin={120}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Expenses" subtitle="Expense distribution by period" delay={0.1}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={30}>
                  <defs>
                    <linearGradient id={chartIds.expenseBar} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.46" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" vertical={false} />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill={`url(#${chartIds.expenseBar})`}
                    radius={[16, 16, 10, 10]}
                    animationDuration={950}
                    animationBegin={150}
                    animationEasing="ease-out"
                    activeBar={{ fill: '#a5b4fc', stroke: '#e0e7ff', strokeWidth: 1 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Profit" subtitle="Net profit line graph" delay={0.15}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id={chartIds.profitLine} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" vertical={false} />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: 'rgba(125,211,252,0.24)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke={`url(#${chartIds.profitLine})`}
                    strokeWidth={3.5}
                    dot={false}
                    activeDot={{ r: 6, fill: '#f8fafc', stroke: '#38bdf8', strokeWidth: 2 }}
                    animationDuration={1100}
                    animationBegin={180}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Combined Chart" subtitle="Revenue vs expenses" delay={0.2}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id={chartIds.combinedExpense} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.36" />
                    </linearGradient>
                    <linearGradient id={chartIds.combinedRevenue} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" vertical={false} />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 18 }}
                    formatter={(value) => <span className="text-sm text-ink-200">{value}</span>}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill={`url(#${chartIds.combinedExpense})`}
                    radius={[14, 14, 10, 10]}
                    animationDuration={950}
                    animationBegin={160}
                    animationEasing="ease-out"
                    activeBar={{ fill: '#a5b4fc', stroke: '#e0e7ff', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={`url(#${chartIds.combinedRevenue})`}
                    strokeWidth={3.25}
                    dot={false}
                    activeDot={{ r: 6, fill: '#dbeafe', stroke: '#60a5fa', strokeWidth: 2 }}
                    animationDuration={1100}
                    animationBegin={220}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <PremiumCard hoverable={false} className="border border-dashed border-white/12">
              <div className="max-w-2xl space-y-3 py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Live analytics</p>
                <h2 className="text-3xl font-semibold tracking-[-0.06em] text-white">No chart data yet</h2>
                <p className="text-sm leading-7 text-ink-300">
                  Finly now shows only live analytics. Add dated income and expense records to unlock trend charts and period comparisons.
                </p>
                {loadError ? (
                  <p className="text-sm font-semibold text-amber-200">{loadError}</p>
                ) : null}
              </div>
            </PremiumCard>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <PremiumCard hoverable={false} className="border border-white/10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">Quick summary</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.06em] text-white">
                  {loading ? 'Loading analytics...' : `Tracking ${chartData.length} periods of business activity`}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-300">
                  {hasChartData
                    ? 'These charts are based on your current business records and update with your dashboard data.'
                    : 'This space is ready for live records. Once entries are added, Finly will build trend lines and comparisons here automatically.'}
                </p>
              </div>
              <PremiumButton onClick={() => navigate('/dashboard')} icon={<ArrowRight className="h-4 w-4" />}>
                Back to Dashboard
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.section>
      </div>
    </MainLayout>
  );
}
