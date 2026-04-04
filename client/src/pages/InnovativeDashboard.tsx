import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/axios';
import { ModeToggle, ViewMode, SimpleSummary, SimplifiedInsight, OneClickAction, ModeSpecific } from '../components/SimpleModeUI';
import { InsightStory, FixActionCard, TodayActionCard, PredictionWarning, generateInsightStories } from '../components/InsightStory';
import { predictLoss, analyzeTrends, breakEvenAnalysis } from '../lib/predictiveAnalytics';
import type { HistoricalData } from '../lib/predictiveAnalytics';

const InnovativeDashboard = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<ViewMode>('simple');
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<any>(null);

  // Mock historical data - in production, fetch from backend
  const mockHistoricalData: HistoricalData[] = [
    { date: '2024-01', income: 5000, expenses: 3000, profit: 2000 },
    { date: '2024-02', income: 5500, expenses: 3200, profit: 2300 },
    { date: '2024-03', income: 5200, expenses: 3800, profit: 1400 },
    { date: '2024-04', income: 4800, expenses: 4200, profit: 600 },
    { date: '2024-05', income: 4500, expenses: 4600, profit: -100 },
    { date: '2024-06', income: 4700, expenses: 4900, profit: -200 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashData(response.data);
      } catch (error) {
        setDashData({
          totalIncome: 4700,
          totalExpenses: 4900,
          profit: -200,
          growthRate: -5,
          expenseRatio: 1.04
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Generate insights and predictions
  const insights = dashData ? generateInsightStories(dashData) : [];
  const trends = analyzeTrends(mockHistoricalData);
  const prediction = predictLoss(mockHistoricalData, 1);
  const breakeven = breakEvenAnalysis(mockHistoricalData);

  // Today's action (example)
  const todayAction = {
    id: '1',
    problem: 'Revenue Down 5% YoY',
    fix: 'You need to increase sales by 15% to stay on track. Start by reaching out to your top 5 clients.',
    priority: 'high' as const,
    estimatedImpact: '+$1,200/month',
    actionSteps: [
      'Review last quarter sales data',
      'Contact top 5 earling/paying clients',
      'Schedule coffee chats this week',
      'Present upsell opportunities'
    ],
    difficulty: 'easy' as const
  };

  // Fix actions (examples)
  const fixActions = [
    {
      id: '1',
      problem: 'Expenses Growing Too Fast',
      fix: 'Your expenses grew 15% while income dropped 5%. This is unsustainable.',
      priority: 'high' as const,
      estimatedImpact: '-$500/month in costs',
      actionSteps: [
        'Audit all monthly subscriptions (identify unused ones)',
        'Negotiate rates with top 3 vendors',
        'Consolidate vendors where possible',
        'Set spending approval limits'
      ],
      difficulty: 'medium' as const
    },
    {
      id: '2',
      problem: 'Uncollected Invoices',
      fix: 'You likely have 30+ days of outstanding invoices that should be collected.',
      priority: 'high' as const,
      estimatedImpact: '+$2,000-5,000',
      actionSteps: [
        'Export all unpaid invoices > 15 days',
        'Sort by amount (largest first)',
        'Make personal calls to top 10 debtors',
        'Offer 2% discount for payment this week'
      ],
      difficulty: 'easy' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">
            {mode === 'simple' ? '📊 Business Overview' : 'Advanced Dashboard'}
          </h1>
          <p className="text-slate-400">
            {mode === 'simple'
              ? 'Key numbers and actions for today'
              : 'Detailed analytics and predictions'}
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </motion.div>

      {/* SIMPLE MODE - Clean & Minimal */}
      <ModeSpecific mode={mode} showIn="simple">
        <div className="space-y-6">
          {/* Summary Stats */}
          <SimpleSummary
            stats={[
              { label: 'Net Balance', value: `$${dashData?.profit?.toLocaleString() || 0}`, change: dashData?.growthRate },
              { label: 'Revenue', value: `$${dashData?.totalIncome?.toLocaleString() || 0}` },
              { label: 'Expenses', value: `$${dashData?.totalExpenses?.toLocaleString() || 0}` }
            ]}
          />

          {/* TODAY'S FOCUS - Single, Prioritized Action */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">🎯 Today's Focus</h2>
            <TodayActionCard action={todayAction} />
          </div>

          {/* Simplified Insights */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">💡 What's Important</h2>
            <div className="space-y-3">
              {trends.healthScore < 60 && (
                <SimplifiedInsight
                  emoji="⚠️"
                  title="Business Health Low"
                  stat={`${trends.healthScore}%`}
                  insight="Your business velocity is slowing. Take action before it's too late."
                  action={{
                    label: 'View Prevention Plan',
                    onClick: () => alert('Prevention plan modal')
                  }}
                />
              )}

              {prediction.shouldAlert && (
                <SimplifiedInsight
                  emoji="🔴"
                  title="Loss Forecast"
                  stat={`$${prediction.predictedLoss}`}
                  insight={`System predicts potential deficit of $${prediction.predictedLoss} next month (${prediction.confidence}% confidence)`}
                  action={{
                    label: 'How to prevent',
                    onClick: () => alert('Prevention steps')
                  }}
                />
              )}

              {trends.incomeDirection === 'down' && (
                <SimplifiedInsight
                  emoji="📉"
                  title="Revenue Declining"
                  stat={`${trends.velocityIncome.toFixed(1)}%`}
                  insight="Your revenue is dropping faster than expected. Focus on new client acquisition."
                  action={{
                    label: 'Sales playbook',
                    onClick: () => alert('Sales strategies')
                  }}
                />
              )}

              <SimplifiedInsight
                emoji="💰"
                title="Breakeven Status"
                stat={breakeven.monthsToBreakEven > 0 ? `${breakeven.monthsToBreakEven}mo` : 'On track'}
                insight={breakeven.monthsToBreakEven > 0
                  ? `At current pace, you'll be profitable in ${breakeven.monthsToBreakEven} months`
                  : 'You are already profitable - focus on growth!'}
              />
            </div>
          </div>

          {/* One-Click Actions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h2>
            <div className="space-y-3">
              {fixActions.map((action, idx) => (
                <OneClickAction
                  key={idx}
                  title={action.problem}
                  description={action.fix}
                  buttonText={`Fix: ${action.estimatedImpact}`}
                  onClick={() => alert(`Taking action: ${action.problem}`)}
                  urgent={action.priority === 'high'}
                />
              ))}
            </div>
          </div>
        </div>
      </ModeSpecific>

      {/* ADVANCED MODE - Full Analytics */}
      <ModeSpecific mode={mode} showIn="advanced">
        <div className="space-y-8">
          {/* Insight Stories */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">📖 Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, idx) => (
                <InsightStory key={idx} insight={insight} />
              ))}
            </div>
          </div>

          {/* Prediction Warning */}
          {prediction.shouldAlert && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">🔮 Loss Forecast</h2>
              <PredictionWarning
                predictedLoss={prediction.predictedLoss}
                confidence={prediction.confidence}
                timeframe={prediction.timeframe}
                recommendations={prediction.recommendations}
              />
            </div>
          )}

          {/* Fix Actions */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🔧 Fix This</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixActions.map((action, idx) => (
                <FixActionCard key={idx} action={action} />
              ))}
            </div>
          </div>

          {/* Trend Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">📊 Trend Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Income Trend</p>
                <p className="text-2xl font-bold text-blue-400">
                  {trends.incomeDirection === 'up' ? '📈' : trends.incomeDirection === 'down' ? '📉' : '➡️'}
                </p>
                <p className="text-xs text-slate-500 mt-2">{trends.velocityIncome.toFixed(1)}% change</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Expense Trend</p>
                <p className="text-2xl font-bold text-red-400">
                  {trends.expenseDirection === 'up' ? '📈' : trends.expenseDirection === 'down' ? '📉' : '➡️'}
                </p>
                <p className="text-xs text-slate-500 mt-2">{trends.velocityExpense.toFixed(1)}% change</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Risk Score</p>
                <p className={`text-2xl font-bold ${trends.riskScore > 70 ? 'text-red-400' : trends.riskScore > 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                  {trends.riskScore}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Health Score</p>
                <p className={`text-2xl font-bold ${trends.healthScore > 70 ? 'text-emerald-400' : trends.healthScore > 50 ? 'text-orange-400' : 'text-red-400'}`}>
                  {trends.healthScore}%
                </p>
              </div>
            </div>
          </motion.div>

          {/* Today's Action (Advanced View) */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">🎯 Today's Action</h2>
            <TodayActionCard action={todayAction} />
          </div>
        </div>
      </ModeSpecific>

      {/* Footer Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-lg bg-blue-600/10 border border-blue-500/30 text-xs text-slate-400"
      >
        💡 <strong>PRO TIP:</strong> Switch between Simple and Advanced modes depending on your needs. Simple mode shows only what matters today. Advanced mode shows everything.
      </motion.div>
    </div>
  );
};

export default InnovativeDashboard;
