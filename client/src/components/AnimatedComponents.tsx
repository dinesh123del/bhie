import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Button Component
export const PremiumButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
}) => {
  const baseClasses = 'font-bold rounded-xl transition-all duration-200';

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105',
    secondary:
      'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105',
    outline: 'border-2 border-indigo-400 text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-300',
    ghost: 'text-indigo-200 hover:bg-white/15',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⟳
        </motion.span>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Premium Card Component
export const PremiumCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}> = ({ children, className = '', hover = true, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    whileHover={hover ? { y: -6, scale: 1.02 } : {}}
    className="group"
  >
    <div className={`relative overflow-hidden rounded-2xl shadow-xl ${className}`}>
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/5 to-transparent backdrop-blur-xl border border-white/20 group-hover:border-white/30 transition-all duration-300" />

      {/* Glow Overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 rounded-2xl blur-xl" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 0px rgba(99, 102, 241, 0)',
            '0 0 25px rgba(99, 102, 241, 0.25)',
            '0 0 0px rgba(99, 102, 241, 0)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  </motion.div>
);

// Premium Badge Component
export const PremiumBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}> = ({ children, variant = 'info', className = '' }) => {
  const colors = {
    success: 'bg-emerald-500/30 text-emerald-100 border-emerald-400/50 font-semibold',
    warning: 'bg-amber-500/30 text-amber-100 border-amber-400/50 font-semibold',
    error: 'bg-red-500/30 text-red-100 border-red-400/50 font-semibold',
    info: 'bg-[#00D4FF]/20 text-[#00D4FF]/30 text-blue-100 border-blue-400/50 font-semibold',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${colors[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
};

// Loading Skeleton Component
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
        className="h-40 bg-gradient-to-br from-white/12 to-white/4 rounded-2xl border border-white/20 p-6 shadow-xl"
      >
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="space-y-4"
        >
          <div className="h-4 bg-white/25 rounded w-1/3"></div>
          <div className="h-8 bg-white/25 rounded w-2/3"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
        </motion.div>
      </motion.div>
    ))}
  </>
);

// Animated Progress Bar Component
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  color?: string;
  label?: string;
}> = ({ value, max = 100, color = 'from-indigo-500 to-purple-600', label }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span className="text-sm font-bold text-[#C0C0C0]">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="w-full h-3 bg-white/15 rounded-full overflow-hidden border border-white/20 shadow-inner">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full shadow-lg`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Toast Notification Component
export const Toast: React.FC<{
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  action?: { label: string; onClick: () => void };
  onClose?: () => void;
  duration?: number;
}> = ({ message, type = 'info', action, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    success: 'from-emerald-600 to-emerald-700 text-emerald-50 border border-emerald-400',
    error: 'from-red-600 to-red-700 text-red-50 border border-red-400',
    warning: 'from-amber-600 to-amber-700 text-amber-50 border border-amber-400',
    info: 'from-indigo-600 to-indigo-700 text-indigo-50 border border-indigo-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 400 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 400 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`max-w-md bg-gradient-to-r ${colors[type]} rounded-xl p-5 shadow-2xl flex items-center justify-between gap-4 backdrop-blur`}
    >
      <p className="font-bold text-base">{message}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={action.onClick}
          className="font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

// Modal Component
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, footer }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md relative overflow-hidden rounded-2xl"
        >
          {/* Glassmorphism Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/8 backdrop-blur-xl border border-white/25 shadow-2xl" />

          {/* Content */}
          <div className="relative z-10 p-8">
            {title && (
              <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
            )}
            <div className="text-white">{children}</div>
            {footer && <div className="mt-8 flex gap-3">{footer}</div>}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Number Counter Component
export const CounterAnimation: React.FC<{
  value: number;
  duration?: number;
  format?: (num: number) => string;
  className?: string;
}> = ({
  value,
  duration = 2,
  format = (n) => n.toLocaleString(),
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    const difference = end - start;
    const increment = difference / (duration * 60);

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className={className}>{format(displayValue)}</span>;
};

// Stat Card Component
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}> = ({ label, value, icon, trend, className = '' }) => (
  <PremiumCard className={`p-6 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-sm font-semibold text-[#C0C0C0] uppercase tracking-widest">
        {label}
      </h3>
      {icon && (
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
          {icon}
        </motion.div>
      )}
    </div>

    <div className="flex items-baseline gap-3">
      <span className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
        {value}
      </span>
      {trend && (
        <motion.span
          className={`text-sm font-semibold px-2 py-1 rounded-full ${
            trend.isPositive
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
        </motion.span>
      )}
    </div>
  </PremiumCard>
);

// Animated List Item Component
export const AnimatedListItem: React.FC<{
  children: React.ReactNode;
  index?: number;
  onClick?: () => void;
  className?: string;
}> = ({ children, index = 0, onClick, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ x: 4 }}
    onClick={onClick}
    className={`cursor-pointer transition-colors ${className}`}
  >
    {children}
  </motion.div>
);

// Shimmer Loading Effect
export const ShimmerLoading: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <motion.div
    className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg ${className}`}
    animate={{
      backgroundPosition: ['200% 0%', '-200% 0%'],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

// Floating Label Input
export const FloatingInput: React.FC<{
  id: string;
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
}> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <motion.input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl outline-none transition-all duration-200 text-white placeholder-transparent peer ${
          error ? 'border-red-500/50' : isFocused ? 'border-blue-500/50' : ''
        } ${className}`}
        placeholder=" "
      />
      <motion.label
        htmlFor={id}
        animate={{
          y: isFocused || value ? -24 : 0,
          scale: isFocused || value ? 0.85 : 1,
          color: isFocused ? '#93c5fd' : '#9ca3af',
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-4 top-3 origin-left pointer-events-none font-medium"
      >
        {label}
      </motion.label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
