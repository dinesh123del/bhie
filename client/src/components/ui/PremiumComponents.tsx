import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMiniSparkles } from 'react-icons/hi2';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
  padded?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  hoverable = true,
  gradient = false,
  padded = true,
}) => {
  return (
    <motion.section
      whileHover={hoverable ? { y: -5, scale: 1.01, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.5)' } : undefined}
      whileTap={hoverable ? { scale: 0.99 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl ${padded ? 'p-8' : ''} ${className}`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/5 pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
};

interface PremiumButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | 'onAnimationStart'
    | 'onDrag'
    | 'onDragEnd'
    | 'onDragEnter'
    | 'onDragExit'
    | 'onDragLeave'
    | 'onDragOver'
    | 'onDragStart'
    | 'onDrop'
  > {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-bold tracking-tight transition-all duration-400 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: 'h-10 px-5 text-xs',
    md: 'h-12 px-7 text-sm',
    lg: 'h-14 px-9 text-base',
  };

  const variantClasses = {
    primary: 'bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-xl',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin"
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            {icon && <span className="text-current/70 group-hover:text-current transition-colors">{icon}</span>}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};


interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  hint,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-semibold tracking-tight text-ink-100">{label}</span>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300">
            {icon}
          </span>
        ) : null}
        <input
          className={`w-full rounded-2xl border bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-ink-400 transition-all duration-300 ease-premium focus-brand ${icon ? 'pl-12' : ''} ${error ? 'border-rose-400/35' : 'border-white/10 hover:border-white/18'} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <span className="text-sm text-rose-300">{error}</span>
      ) : hint ? (
        <span className="text-sm text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
};

interface PremiumBadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'positive' | 'warning' | 'brand' | 'danger';
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'positive' | 'brand' | 'danger';
  icon?: React.ReactNode;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  children,
  tone = 'brand',
  variant,
  icon,
}) => {
  const resolvedTone = (() => {
    switch (variant) {
      case 'success':
        return 'positive';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      case 'info':
        return 'brand';
      case 'neutral':
      case 'positive':
      case 'brand':
        return variant;
      default:
        return tone;
    }
  })();

  const toneClasses = {
    neutral: 'border-white/10 bg-white/[0.05] text-ink-200',
    positive: 'border-emerald-400/15 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-400/15 bg-amber-500/10 text-amber-200',
    brand: 'border-sky-300/18 bg-sky-400/10 text-sky-100',
    danger: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.01 }}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[resolvedTone]}`}
    >
      {icon}
      {children}
    </motion.span>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  gradient?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  icon,
  label,
  value,
  change,
  trend = 'neutral',
  description,
  gradient = 'from-sky-500/20 via-indigo-500/10 to-fuchsia-500/20',
}) => {
  const trendClasses = {
    up: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/15',
    down: 'text-rose-300 bg-rose-500/10 border-rose-400/15',
    neutral: 'text-ink-200 bg-white/[0.04] border-white/10',
  };

  return (
    <PremiumCard gradient className="h-full min-h-[210px]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      <div className="relative flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-300">{label}</p>
            <h3 className="text-3xl font-black tracking-[-0.06em] text-white md:text-[2.35rem]">
              {value}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl text-white shadow-card">
            {icon}
          </div>
        </div>

        <div className="space-y-3">
          {change ? (
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${trendClasses[trend]}`}>
              <HiMiniSparkles className="text-sm" />
              {change}
            </span>
          ) : null}
          {description ? (
            <p className="max-w-xs text-sm leading-6 text-ink-300">{description}</p>
          ) : null}
        </div>
      </div>
    </PremiumCard>
  );
};
