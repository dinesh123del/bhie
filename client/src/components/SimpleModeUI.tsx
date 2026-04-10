import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, EyeOff } from 'lucide-react';

export type ViewMode = 'simple' | 'advanced';

interface SimpleModeContextType {
  mode: ViewMode;
  toggleMode: () => void;
}

export const useSimpleMode = (mode: ViewMode, hideIfAdvanced: boolean = false): boolean => {
  if (hideIfAdvanced) {
    return mode === 'simple';
  }
  return mode !== 'simple';
};

/**
 * Simplified Dashboard Components
 * Used in SIMPLE mode - minimal, focused, high-impact
 */

export const SimpleCard = ({
  title,
  value,
  description,
  icon,
  color,
  action
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
  action?: { label: string; onClick: () => void };
}) => {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-emerald-600 to-emerald-700',
    red: 'from-red-600 to-red-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700'
  };

  const bgClasses = {
    blue: 'bg-[#00D4FF]/20 text-[#00D4FF]/10',
    green: 'bg-emerald-500/10',
    red: 'bg-red-500/10',
    purple: 'bg-purple-500/10',
    orange: 'bg-orange-500/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-lg ${bgClasses[color]} border border-slate-700 hover:border-slate-600 transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold text-[#00D4FF] hover:text-blue-300"
          >
            {action.label}
          </button>
        )}
      </div>

      <h3 className="text-sm text-[#C0C0C0] mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>

      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}
    </motion.div>
  );
};

/**
 * Mode Toggle Component
 * Minimalist switcher between Simple and Advanced modes
 */
export const ModeToggle = ({
  mode,
  onChange
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A]/60/50 border border-slate-700"
    >
      <button
        onClick={() => onChange('simple')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          mode === 'simple'
            ? 'bg-[#00D4FF]/20 text-[#00D4FF] text-white'
            : 'text-[#C0C0C0] hover:text-[#C0C0C0]'
        }`}
      >
        <Eye className="w-4 h-4" />
        <span className="text-xs font-semibold">Simple</span>
      </button>

      <div className="w-px h-6 bg-slate-700" />

      <button
        onClick={() => onChange('advanced')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          mode === 'advanced'
            ? 'bg-[#00D4FF]/20 text-[#00D4FF] text-white'
            : 'text-[#C0C0C0] hover:text-[#C0C0C0]'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-xs font-semibold">Advanced</span>
      </button>
    </motion.div>
  );
};

/**
 * Content Wrapper
 * Shows/hides content based on mode
 */
export const ModeSpecific = ({
  children,
  mode,
  showIn
}: {
  children: ReactNode;
  mode: ViewMode;
  showIn: ViewMode | ViewMode[];
}): JSX.Element | null => {
  const modes = Array.isArray(showIn) ? showIn : [showIn];

  if (!modes.includes(mode)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Simplified Insights
 * No charts, no jargon - just actionable insights
 */
export const SimplifiedInsight = ({
  emoji,
  title,
  stat,
  insight,
  action
}: {
  emoji: string;
  title: string;
  stat: string;
  insight: string;
  action?: { label: string; onClick: () => void };
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-lg bg-[#0A0A0A]/60/50 border border-slate-700 border-l-2 border-l-blue-600 hover:bg-[#0A0A0A]/60/80 transition-all cursor-default"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
          <p className="text-2xl font-bold text-[#00D4FF] mb-1">{stat}</p>
          <p className="text-xs text-[#C0C0C0] mb-3">{insight}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-semibold text-[#00D4FF] hover:text-blue-300 transition-all"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * One-Click Action
 * Minimal, high-contrast action button
 */
export const OneClickAction = ({
  title,
  description,
  buttonText,
  onClick,
  urgent = false
}: {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  urgent?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-lg border-2 transition-all ${
        urgent
          ? 'bg-gradient-to-br from-red-900/40 to-slate-900 border-red-500'
          : 'bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500'
      }`}
    >
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-[#C0C0C0] mb-4">{description}</p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full py-3 font-bold rounded-lg transition-all ${
          urgent
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-blue-700 text-white'
        }`}
      >
        {buttonText}
      </motion.button>
    </motion.div>
  );
};

/**
 * Simple Summary Stats
 * 3 key numbers, no clutter
 */
export const SimpleSummary = ({
  stats
}: {
  stats: Array<{
    label: string;
    value: string | number;
    change?: number;
  }>;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-3 gap-4"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 rounded-lg bg-[#0A0A0A]/60/50 border border-slate-700 text-center"
        >
          <p className="text-xs text-[#C0C0C0] mb-2">{stat.label}</p>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          {stat.change !== undefined && (
            <p className={`text-xs mt-2 ${stat.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
            </p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Help tooltip for simple mode
 * Minimal, context-aware help
 */
export const SimpleHelp = ({
  text,
  icon = '?'
}: {
  text: string;
  icon?: string;
}) => {
  return (
    <motion.div
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-[#C0C0C0] text-xs font-bold cursor-help group"
      whileHover={{ scale: 1.1 }}
    >
      {icon}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0A0A0A]/80 border border-white/5 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-slate-700 z-50">
        {text}
      </div>
    </motion.div>
  );
};

export default ModeToggle;
