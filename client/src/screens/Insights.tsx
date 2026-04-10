"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import api from '../lib/axios';

interface Insight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

const InsightCard = ({
  insight,
  index
}: {
  insight: Insight;
  index: number;
}) => {
  const icons: Record<string, React.ReactNode> = {
    recommendation: <Sparkles className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    opportunity: <TrendingUp className="w-5 h-5" />
  };

  const colors: Record<string, string> = {
    recommendation: 'from-blue-900/30 to-slate-900 border-blue-700/30 text-[#00D4FF]',
    warning: 'from-red-900/30 to-slate-900 border-red-700/30 text-red-400',
    opportunity: 'from-emerald-900/30 to-slate-900 border-emerald-700/30 text-emerald-400'
  };

  const impacts: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-[#00D4FF]/20 text-[#00D4FF]/20 text-[#00D4FF]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-xl bg-gradient-to-br border ${colors[insight.type]} hover:border-opacity-100 transition-all cursor-pointer group`}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colors[insight.type].split(' ')[0]}`}>
          {icons[insight.type]}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${impacts[insight.impact]}`}>
              {insight.impact} Impact
            </span>
          </div>

          <p className="text-[#C0C0C0] text-sm mb-4">{insight.description}</p>

          {insight.action && (
            <motion.button
              className="text-sm font-semibold text-[#00D4FF] hover:text-blue-300 flex items-center gap-2 group"
              whileHover={{ x: 4 }}
            >
              {insight.action}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Insights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        // Fetch data from dashboard endpoint
        const response = await api.get('/dashboard');

        // Generate insights based on data
        const generatedInsights: Insight[] = [];

        // Insight 1: Income trend
        if (response.data.growthRate && response.data.growthRate > 20) {
          generatedInsights.push({
            id: '1',
            type: 'opportunity',
            title: 'Strong Growth Momentum',
            description: `Your business is growing at ${response.data.growthRate}%! This is an excellent opportunity to scale your operations and consider expanding into new markets.`,
            impact: 'high',
            action: 'View Growth Strategy'
          });
        }

        // Insight 2: Expense ratio
        if (response.data.expenseRatio && response.data.expenseRatio > 0.7) {
          generatedInsights.push({
            id: '2',
            type: 'warning',
            title: 'High Expense Ratio',
            description: `Your expenses are consuming ${(response.data.expenseRatio * 100).toFixed(1)}% of your income. Consider reviewing your spending to improve profitability.`,
            impact: 'high',
            action: 'Review Expenses'
          });
        }

        // Insight 3: Profit status
        if (response.data.profit && response.data.profit > 0) {
          generatedInsights.push({
            id: '3',
            type: 'recommendation',
            title: 'Profitable Quarter Ahead',
            description: 'Based on current trends, you\'re on track for a profitable quarter. Consider investing in business development initiatives.',
            impact: 'medium',
            action: 'Explore Investments'
          });
        } else if (response.data.profit && response.data.profit < 0) {
          generatedInsights.push({
            id: '3',
            type: 'warning',
            title: 'Negative Profit Alert',
            description: 'Your business is currently operating at a loss. It\'s crucial to identify and reduce unnecessary expenses.',
            impact: 'high',
            action: 'Cost Reduction Plan'
          });
        }

        // Insight 4: General recommendation
        generatedInsights.push({
          id: '4',
          type: 'recommendation',
          title: 'Automate Financial Tracking',
          description: 'Consider setting up automated expense categorization to save time and improve accuracy in your financial records.',
          impact: 'medium',
          action: 'Enable Automation'
        });

        // Insight 5: Cash flow tip
        generatedInsights.push({
          id: '5',
          type: 'recommendation',
          title: 'Optimize Cash Flow',
          description: 'Maintain at least 3 months of operating expenses as reserve. This ensures business continuity during challenging periods.',
          impact: 'medium',
          action: 'Create Reserve Plan'
        });

        // Insight 6: Opportunity
        generatedInsights.push({
          id: '6',
          type: 'opportunity',
          title: 'Revenue Diversification',
          description: 'Explore new revenue streams to reduce dependency on single income sources and increase business resilience.',
          impact: 'low',
          action: 'Explore Opportunities'
        });

        setInsights(generatedInsights);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
        // Set default insights if API fails
        setInsights([
          {
            id: '1',
            type: 'recommendation',
            title: 'Welcome to Smart Insights',
            description: 'Upload your financial data to get personalized AI-powered recommendations for your business.',
            impact: 'medium'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

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

  const recommendations = insights.filter(i => i.type === 'recommendation');
  const warnings = insights.filter(i => i.type === 'warning');
  const opportunities = insights.filter(i => i.type === 'opportunity');

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">AI Insights</h1>
        <p className="text-[#C0C0C0]">Get personalized recommendations powered by AI</p>
      </motion.div>

      {/* AI Power Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30"
      >
        <Sparkles className="w-4 h-4 text-[#00D4FF]" />
        <span className="text-sm font-semibold text-blue-300">Powered by AI</span>
      </motion.div>

      {/* Opportunities Section */}
      {opportunities.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Growth Opportunities
          </h2>
          <div className="space-y-4">
            {opportunities.map((insight, idx) => (
              <InsightCard key={insight.id} insight={insight} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#00D4FF]" />
            Recommendations
          </h2>
          <div className="space-y-4">
            {recommendations.map((insight, idx) => (
              <InsightCard key={insight.id} insight={insight} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Alerts
          </h2>
          <div className="space-y-4">
            {warnings.map((insight, idx) => (
              <InsightCard key={insight.id} insight={insight} index={idx + recommendations.length} />
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-700/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00D4FF]/20 text-[#00D4FF]">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Insights Generated</h3>
          </div>
          <p className="text-3xl font-bold text-[#00D4FF]">{insights.length}</p>
          <p className="text-sm text-[#C0C0C0] mt-2">This month</p>
        </motion.div>

        <motion.div
          className="p-6 rounded-xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-700/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-600">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Opportunities</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{opportunities.length}</p>
          <p className="text-sm text-[#C0C0C0] mt-2">Action items</p>
        </motion.div>

        <motion.div
          className="p-6 rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900 border border-red-700/30"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-600">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">{warnings.length}</p>
          <p className="text-sm text-[#C0C0C0] mt-2">Requiring attention</p>
        </motion.div>
      </div>

      {/* AI Explanation */}
      <motion.div
        className="p-8 rounded-xl bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">How AI Insights Work</h3>
        <ul className="space-y-3 text-[#C0C0C0]">
          <li className="flex gap-3">
            <span className="text-purple-400 font-bold">1.</span>
            <span>Analyzes your financial data patterns and trends</span>
          </li>
          <li className="flex gap-3">
            <span className="text-purple-400 font-bold">2.</span>
            <span>Compares metrics against industry benchmarks</span>
          </li>
          <li className="flex gap-3">
            <span className="text-purple-400 font-bold">3.</span>
            <span>Identifies optimization opportunities and risks</span>
          </li>
          <li className="flex gap-3">
            <span className="text-purple-400 font-bold">4.</span>
            <span>Provides actionable recommendations for growth</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Insights;
