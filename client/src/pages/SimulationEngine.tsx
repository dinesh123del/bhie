import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, TrendingUp, TrendingDown, AlertTriangle,
  ArrowRight, BarChart3, ShieldCheck, Target, Zap
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface SimulationResult {
  simulations_run: number;
  months_simulated: number;
  success_probability: number;
  median_outcome: number;
  best_case: number;
  worst_case: number;
  average_outcome: number;
  bankruptcy_risk: number;
  verdict: string;
}

const SimulationEngine = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Form state
  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [months, setMonths] = useState('24');
  const [newHires, setNewHires] = useState('0');
  const [avgSalary, setAvgSalary] = useState('600000');
  const [loanAmount, setLoanAmount] = useState('0');
  const [loanRate, setLoanRate] = useState('12');
  const [revenueGrowth, setRevenueGrowth] = useState('5');
  const [expenseGrowth, setExpenseGrowth] = useState('2');

  const runSimulation = async () => {
    if (!revenue || !expenses) {
      toast.error('Please enter your current revenue and expenses');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/simulate', {
        current_monthly_revenue: parseFloat(revenue),
        current_monthly_expenses: parseFloat(expenses),
        months_to_simulate: parseInt(months),
        new_hires: parseInt(newHires),
        avg_salary_per_hire: parseFloat(avgSalary),
        loan_amount: parseFloat(loanAmount),
        loan_interest_rate: parseFloat(loanRate),
        revenue_growth_rate: parseFloat(revenueGrowth),
        expense_growth_rate: parseFloat(expenseGrowth),
      });

      setResult(response.data);
      toast.success('Simulation complete! 1,000 futures analyzed.');
    } catch (error) {
      console.error('Simulation failed:', error);
      toast.error('Simulation failed. Make sure the ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
    return `${sign}₹${abs.toFixed(0)}`;
  };

  const getSuccessColor = (prob: number) => {
    if (prob >= 75) return 'text-emerald-400';
    if (prob >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getSuccessBg = (prob: number) => {
    if (prob >= 75) return 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30';
    if (prob >= 50) return 'from-amber-600/20 to-amber-900/10 border-amber-500/30';
    return 'from-red-600/20 to-red-900/10 border-red-500/30';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
            <FlaskConical className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Simulation Engine</h1>
            <p className="text-[#C0C0C0] text-sm">Ask "What If?" — 1,000 parallel futures analyzed instantly</p>
          </div>
        </div>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-[#0A0A0A]/60/60 border border-slate-700/50 backdrop-blur-sm"
      >
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-400" /> Define Your Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Revenue */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Monthly Revenue (₹)</label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Expenses */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Monthly Expenses (₹)</label>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder="e.g. 350000"
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Months */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Simulate Months</label>
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* New Hires */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">New Hires</label>
            <input
              type="number"
              value={newHires}
              onChange={(e) => setNewHires(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Avg Salary */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Avg Annual Salary (₹)</label>
            <input
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Loan Amount (₹)</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Loan Rate */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Loan Interest Rate (%)</label>
            <input
              type="number"
              value={loanRate}
              onChange={(e) => setLoanRate(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Revenue Growth */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Revenue Growth (%/mo)</label>
            <input
              type="number"
              value={revenueGrowth}
              onChange={(e) => setRevenueGrowth(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>

          {/* Expense Growth */}
          <div>
            <label className="block text-sm font-medium text-[#C0C0C0] mb-1.5">Expense Growth (%/mo)</label>
            <input
              type="number"
              value={expenseGrowth}
              onChange={(e) => setExpenseGrowth(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/5/60 border border-slate-600 rounded-lg text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Run Button */}
        <motion.button
          onClick={runSimulation}
          disabled={loading}
          className="mt-6 w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running 1,000 Simulations...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Simulate 1,000 Futures
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Verdict Card */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${getSuccessBg(result.success_probability)} border backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Simulation Verdict</h2>
                <span className="text-xs bg-slate-700/50 text-[#C0C0C0] px-3 py-1 rounded-full">
                  {result.simulations_run.toLocaleString()} simulations · {result.months_simulated} months
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className={`text-6xl font-black ${getSuccessColor(result.success_probability)}`}>
                  {result.success_probability}%
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Success Probability</p>
                  <p className="text-[#C0C0C0] text-sm">{result.verdict}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    result.success_probability >= 75 ? 'bg-emerald-500' :
                    result.success_probability >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.success_probability}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-xl bg-[#0A0A0A]/60/60 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-[#00D4FF]" />
                  <span className="text-sm text-[#C0C0C0]">Median Outcome</span>
                </div>
                <p className={`text-2xl font-bold ${result.median_outcome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(result.median_outcome)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-xl bg-[#0A0A0A]/60/60 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-[#C0C0C0]">Best Case (95th %ile)</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(result.best_case)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 rounded-xl bg-[#0A0A0A]/60/60 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-[#C0C0C0]">Worst Case (5th %ile)</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(result.worst_case)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-5 rounded-xl bg-[#0A0A0A]/60/60 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-[#C0C0C0]">Bankruptcy Risk</span>
                </div>
                <p className={`text-2xl font-bold ${result.bankruptcy_risk <= 10 ? 'text-emerald-400' : result.bankruptcy_risk <= 30 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.bankruptcy_risk}%
                </p>
              </motion.div>
            </div>

            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-xl bg-violet-900/20 border border-violet-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
                <h3 className="text-white font-semibold">How This Works</h3>
              </div>
              <p className="text-[#C0C0C0] text-sm leading-relaxed">
                We ran <strong>{result.simulations_run.toLocaleString()} Monte Carlo simulations</strong> of your business
                over <strong>{result.months_simulated} months</strong>. Each simulation applies random market fluctuations
                (±15% revenue variance, ±8% expense variance) to model real-world uncertainty. The Success Probability
                tells you the chances of staying financially healthy across all those parallel futures.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimulationEngine;
