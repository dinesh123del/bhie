import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Clock,
  DollarSign,
  Lightbulb
} from 'lucide-react';

interface StoryInsight {
  story: string;
  metric: string;
  value: number | string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
}

interface FixAction {
  id: string;
  problem: string;
  fix: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  actionSteps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * InsightStory Component
 * Replaces boring charts with engaging narrative insights
 * Uses storytelling to make data meaningful and actionable
 */
export const InsightStory = ({ insight }: { insight: StoryInsight }) => {
  const sentimentColors = {
    positive: 'from-emerald-900/30 to-slate-900 border-emerald-700/30',
    negative: 'from-red-900/30 to-slate-900 border-red-700/30',
    neutral: 'from-blue-900/30 to-slate-900 border-blue-700/30',
    warning: 'from-orange-900/30 to-slate-900 border-orange-700/30'
  };

  const textColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-blue-400',
    warning: 'text-orange-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-xl bg-gradient-to-br ${sentimentColors[insight.sentiment]} border transition-all hover:border-opacity-100 cursor-default`}
    >
      {/* Icon & Metric */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg ${insight.color}`}>
          {insight.icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${textColors[insight.sentiment]} uppercase tracking-wide`}>
            {insight.metric}
          </p>
          <p className="text-3xl font-bold text-white mt-1">{insight.value}</p>
          {insight.trend !== undefined && (
            <p className={`text-xs mt-2 ${insight.trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {insight.trend > 0 ? '↑' : '↓'} {Math.abs(insight.trend)}% from last week
            </p>
          )}
        </div>
      </div>

      {/* Story/Narrative */}
      <p className="text-slate-300 text-sm leading-relaxed">
        {insight.story}
      </p>
    </motion.div>
  );
};

/**
 * FixAction Component
 * Provides actionable, step-by-step solutions to problems
 * Shows impact, difficulty, and priority
 */
export const FixActionCard = ({ action }: { action: FixAction }) => {
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  const difficultyLevels = {
    easy: { label: '⚡ Easy', color: 'text-emerald-400' },
    medium: { label: '⚙️ Medium', color: 'text-orange-400' },
    hard: { label: '🔧 Complex', color: 'text-red-400' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all group"
    >
      {/* Header with Priority Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${priorityColors[action.priority]} mb-2`}>
            {action.priority.toUpperCase()} PRIORITY
          </div>
          <h3 className="text-lg font-bold text-white">{action.problem}</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all"
        >
          <Zap className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Fix Summary */}
      <p className="text-slate-300 text-sm mb-4">{action.fix}</p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-700">
        <div>
          <p className="text-xs text-slate-400">Estimated Impact</p>
          <p className="text-sm font-semibold text-emerald-400">{action.estimatedImpact}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Difficulty</p>
          <p className={`text-sm font-semibold ${difficultyLevels[action.difficulty].color}`}>
            {difficultyLevels[action.difficulty].label}
          </p>
        </div>
      </div>

      {/* Step by Step */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase">How to Fix</p>
        {action.actionSteps.map((step, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-400">{idx + 1}</span>
            </div>
            <p className="text-sm text-slate-300 pt-0.5">{step}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2"
      >
        Apply Fix
      </motion.button>
    </motion.div>
  );
};

/**
 * TodayActionCard Component
 * Shows one prioritized action for the day
 * Minimal, focused, highly actionable
 */
export const TodayActionCard = ({
  action,
  completed = false
}: {
  action: FixAction;
  completed?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative p-6 rounded-xl border-2 transition-all ${
        completed
          ? 'bg-slate-700/30 border-slate-600 opacity-75'
          : 'bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/50 hover:border-blue-400/80'
      }`}
    >
      {/* Animated background glow */}
      {!completed && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: completed ? 360 : 0 }}
              transition={{ duration: 0.6 }}
              className={`p-2 rounded-full ${completed ? 'bg-emerald-500/20' : 'bg-blue-600/20'}`}
            >
              {completed ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <Clock className="w-6 h-6 text-blue-400" />
              )}
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Today's Focus</p>
              <p className="text-lg font-bold text-white">{action.problem}</p>
            </div>
          </div>
        </div>

        {/* Action Description */}
        <p className="text-slate-300 text-sm mb-4">{action.fix}</p>

        {/* Progress/Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            action.priority === 'high'
              ? 'bg-red-500/20 text-red-400'
              : action.priority === 'medium'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {action.estimatedImpact}
          </span>
          {!completed && (
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-blue-400 text-sm font-semibold"
            >
              →
            </motion.div>
          )}
        </div>

        {/* CTA Button */}
        {!completed ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Start This Now
          </motion.button>
        ) : (
          <div className="w-full py-3 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold rounded-lg text-center">
            ✓ Completed Today
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * PredictionWarning Component
 * Shows AI-predicted losses and proactive warnings
 */
export const PredictionWarning = ({
  predictedLoss,
  confidence,
  timeframe,
  recommendations
}: {
  predictedLoss: number;
  confidence: number;
  timeframe: string;
  recommendations: string[];
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl bg-gradient-to-br from-red-900/30 to-slate-900 border border-red-700/50 hover:border-red-600/80 transition-all"
    >
      {/* Alert Header */}
      <div className="flex items-start gap-3 mb-4">
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-2 rounded-lg bg-red-600/20"
        >
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Predicted Loss Alert</h3>
          <p className="text-xs text-slate-400 mt-1">Based on current trends</p>
        </div>
      </div>

      {/* Prediction Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-red-700/30">
        <div>
          <p className="text-xs text-slate-400 mb-1">Projected Loss</p>
          <p className="text-2xl font-bold text-red-400">${predictedLoss.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Timeframe</p>
          <p className="text-2xl font-bold text-red-400">{timeframe}</p>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400">Prediction Confidence</p>
          <p className="text-xs font-bold text-red-400">{confidence}%</p>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-red-600 to-red-400"
          />
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">What You Can Do</p>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-slate-300">
              <span className="text-red-400 font-bold">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
      >
        View Prevention Plan
      </motion.button>
    </motion.div>
  );
};

/**
 * Insight storytelling generator
 * Converts raw numbers into human-readable narratives
 */
export const generateInsightStories = (data: any): StoryInsight[] => {
  const stories: StoryInsight[] = [];

  // Income story
  const incomeChange = data.incomeGrowth || 0;
  stories.push({
    story: incomeChange > 20
      ? `Your business is scaling! Income grew by ${incomeChange}% - this momentum is what successful companies build on. Consider reinvesting 20% for sustainable growth.`
      : incomeChange > 5
      ? `Steady progress. Your income is growing at a healthy ${incomeChange}%. Maintain current strategies while testing new revenue channels.`
      : `Income is stable. Focus on incremental improvements and exploring new client segments to accelerate growth.`,
    metric: 'Revenue Growth',
    value: `+${incomeChange}%`,
    trend: incomeChange,
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-emerald-600',
    sentiment: incomeChange > 10 ? 'positive' : 'neutral'
  });

  // Expense story
  const expenseRatio = data.expenseRatio || 0;
  stories.push({
    story: expenseRatio < 0.5
      ? `You're lean! Expenses are only ${(expenseRatio * 100).toFixed(0)}% of income. You have room to invest in growth without risk.`
      : expenseRatio < 0.7
      ? `Balanced spending. At ${(expenseRatio * 100).toFixed(0)}%, you're in the healthy zone. Monitor for rate creep.`
      : `⚠️ High expense ratio at ${(expenseRatio * 100).toFixed(0)}%. Prioritize cost reduction immediately.`,
    metric: 'Spending Health',
    value: `${(expenseRatio * 100).toFixed(0)}%`,
    icon: <DollarSign className="w-6 h-6" />,
    color: expenseRatio > 0.7 ? 'bg-red-600' : 'bg-blue-600',
    sentiment: expenseRatio > 0.7 ? 'warning' : 'neutral'
  });

  // Profit story
  const profit = data.profit || 0;
  const profitMargin = data.profitMargin || 0;
  stories.push({
    story: profit > 0
      ? `You're profitable! ${profitMargin.toFixed(1)}% margin puts you ahead of ${profitMargin > 20 ? '90%' : profitMargin > 10 ? '70%' : '50%'} of your peers.`
      : `Not profitable this period. Don't panic - focus on your best-performing revenue streams.`,
    metric: 'Profitability',
    value: `$${profit.toLocaleString()}`,
    trend: 5,
    icon: <Target className="w-6 h-6" />,
    color: profit > 0 ? 'bg-emerald-600' : 'bg-red-600',
    sentiment: profit > 0 ? 'positive' : 'negative'
  });

  return stories;
};

export default InsightStory;
