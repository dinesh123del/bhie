import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import api from '../lib/axios';

interface AnalyticsData {
  totalIncome?: number;
  totalExpenses?: number;
  profit?: number;
  growthRate?: number;
  expenseRatio?: number;
}

interface ChartData {
  month: string;
  income?: number;
  expenses?: number;
  profit?: number;
  value?: number;
}

const ScrollableSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 600);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <motion.button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg transition-all ${
              canScrollLeft
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            whileHover={canScrollLeft ? { scale: 1.1 } : {}}
            whileTap={canScrollLeft ? { scale: 0.95 } : {}}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-lg transition-all ${
              canScrollRight
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            whileHover={canScrollRight ? { scale: 1.1 } : {}}
            whileTap={canScrollRight ? { scale: 0.95 } : {}}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        <motion.div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={checkScroll}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

const AnalyticsCard = ({
  title,
  value,
  trend,
  icon: Icon,
  color
}: {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ComponentType<any>;
  color: string;
}) => {
  const isTrendPositive = (trend || 0) >= 0;

  return (
    <motion.div
      className="flex-shrink-0 w-72 p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 transition-all"
      whileHover={{
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {trend !== undefined && (
        <div className={`flex items-center gap-2 text-sm font-semibold ${isTrendPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isTrendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(trend)}% from last week
        </div>
      )}
    </motion.div>
  );
};

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mockMonthlyData: ChartData[] = [
    { month: 'Jan', income: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', income: 3000, expenses: 1398, profit: 1602 },
    { month: 'Mar', income: 2000, expenses: 9800, profit: -2800 },
    { month: 'Apr', income: 2780, expenses: 3908, profit: -1128 },
    { month: 'May', income: 1890, expenses: 4800, profit: -2910 },
    { month: 'Jun', income: 2390, expenses: 3800, profit: -1410 },
    { month: 'Jul', income: 3490, expenses: 4300, profit: -810 }
  ];

  const mockExpenseData = [
    { category: 'Rent', value: 30 },
    { category: 'Salaries', value: 25 },
    { category: 'Marketing', value: 20 },
    { category: 'Operations', value: 15 },
    { category: 'Other', value: 10 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-slate-400">Track your business metrics and trends in real-time</p>
      </motion.div>

      {/* Summary Metrics */}
      <ScrollableSection title="Key Metrics">
        <AnalyticsCard
          title="Revenue"
          value={`$${(data.totalIncome || 0).toLocaleString()}`}
          trend={12}
          icon={DollarSign}
          color="bg-green-600"
        />
        <AnalyticsCard
          title="Expenses"
          value={`$${(data.totalExpenses || 0).toLocaleString()}`}
          trend={-5}
          icon={DollarSign}
          color="bg-red-600"
        />
        <AnalyticsCard
          title="Net Balance"
          value={`$${(data.profit || 0).toLocaleString()}`}
          trend={18}
          icon={TrendingUp}
          color="bg-blue-600"
        />
        <AnalyticsCard
          title="Growth Rate"
          value={`${(data.growthRate || 0).toFixed(1)}%`}
          trend={8}
          icon={TrendingUp}
          color="bg-purple-600"
        />
      </ScrollableSection>

      {/* Revenue Trends (Mini Charts) */}
      <ScrollableSection title="Revenue Trends">
        {mockMonthlyData.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex-shrink-0 w-56 p-6 rounded-xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-700/30 hover:border-emerald-600/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-sm text-slate-400 mb-2">{item.month}</p>
            <p className="text-2xl font-bold text-emerald-400 mb-4">${(item.income || 0).toLocaleString()}</p>
            <div className="h-12 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg opacity-20" />
          </motion.div>
        ))}
      </ScrollableSection>

      {/* Expense Breakdown */}
      <ScrollableSection title="Expense Breakdown">
        {mockExpenseData.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex-shrink-0 w-56 p-6 rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900 border border-red-700/30 hover:border-red-600/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">{item.category}</p>
                <p className="text-2xl font-bold text-red-400">{item.value}%</p>
              </div>
              <PieChart className="w-6 h-6 text-red-500" />
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </ScrollableSection>

      {/* Net Balance Analysis */}
      <ScrollableSection title="Net Balance Analysis">
        {mockMonthlyData.map((item, idx) => {
          const isProfitable = (item.profit || 0) >= 0;
          return (
            <motion.div
              key={idx}
              className={`flex-shrink-0 w-56 p-6 rounded-xl border transition-all ${
                isProfitable
                  ? 'bg-gradient-to-br from-blue-900/30 to-slate-900 border-blue-700/30 hover:border-blue-600/50'
                  : 'bg-gradient-to-br from-orange-900/30 to-slate-900 border-orange-700/30 hover:border-orange-600/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-sm text-slate-400 mb-2">{item.month}</p>
              <p className={`text-2xl font-bold mb-4 ${isProfitable ? 'text-blue-400' : 'text-orange-400'}`}>
                ${(item.profit || 0).toLocaleString()}
              </p>
              <div className={`h-2 rounded-full overflow-hidden ${isProfitable ? 'bg-blue-600/30' : 'bg-orange-600/30'}`}>
                <motion.div
                  className={isProfitable ? 'bg-blue-500' : 'bg-orange-500'}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(item.profit || 0) / 30}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </ScrollableSection>

      {/* Insights Card */}
      <motion.div
        className="p-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">Quick Insights</h3>
        <ul className="space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            <span>Your Revenue is trending upward with a 12% increase compared to last week</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <span>Expenses are well-controlled at below the average budget threshold</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
            <span>Consider allocating more budget to marketing for improved ROI</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Analytics;
