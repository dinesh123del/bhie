import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMiniSparkles } from 'react-icons/hi2';
import { premiumFeedback } from '../../utils/premiumFeedback';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
  padded?: boolean;
  floating?: boolean;
  delay?: number;
}

const springConfig = { type: 'spring', stiffness: 200, damping: 15 };

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  hoverable = true,
  gradient = false,
  padded = true,
  floating = false,
  delay = 0,
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: floating ? [0, -5, 0] : 0 
      }}
      whileHover={hoverable ? { 
        y: -8, 
        scale: 1.03, 
        boxShadow: '0 40px 80px -15px rgba(0,0,0,0.6)' 
      } : undefined}
      whileTap={hoverable ? { scale: 0.98 } : undefined}
      transition={{ 
        ...springConfig,
        animate: floating ? {
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          default: { delay }
        } : { delay }
      }}
      className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl ${padded ? 'p-8' : ''} ${className}`}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-purple-500/10 pointer-events-none" />
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
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    premiumFeedback.click();
    if (onClick) onClick(e);
  };

  const baseStyles = "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-bold tracking-tight transition-all duration-400 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: 'h-10 px-5 text-xs',
    md: 'h-12 px-7 text-sm',
    lg: 'h-14 px-9 text-base',
  };

  const variantClasses = {
    primary: 'bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10',
    secondary: 'bg-white/5 border border-white/15 text-white hover:bg-white/10 backdrop-blur-xl',
    ghost: 'text-white/60 hover:text-white hover:bg-white/8',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25',
  };

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      transition={springConfig}
      onClick={handleClick}
      className={`${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin"
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            {icon && <span className="group-hover:rotate-12 transition-transform duration-300">{icon}</span>}
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
