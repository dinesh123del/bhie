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
  extreme?: boolean;
}

const springConfig = { type: 'spring', stiffness: 200, damping: 20 };
const inertiaConfig = { type: 'spring', stiffness: 100, damping: 10, mass: 1 };

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  className = '',
  hoverable = true,
  gradient = false,
  padded = true,
  floating = false,
  delay = 0,
  extreme = false,
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
        y: -10, 
        scale: extreme ? 1.05 : 1.03, 
        boxShadow: extreme 
          ? '0 40px 80px -12px rgba(168,85,247,0.25), 0 20px 40px -20px rgba(56,189,248,0.3)' 
          : '0 30px 60px -12px rgba(0,0,0,0.4), 0 18px 36px -18px rgba(0,0,0,0.45)' 
      } : undefined}
      whileTap={hoverable ? { scale: 0.98, y: -4 } : undefined}
      onMouseEnter={() => hoverable && premiumFeedback.haptic(5)}
      transition={{ 
        ...springConfig,
        animate: floating ? {
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          default: { delay }
        } : { delay }
      }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-10px" }}
      className={`relative overflow-hidden rounded-[2.5rem] border ${extreme ? 'border-transparent' : 'border-white/10'} bg-white/[0.04] backdrop-blur-3xl ${padded ? 'p-8' : ''} ${className}`}
    >
      {extreme && (
        <motion.div
          className="absolute -inset-[1px] -z-10 bg-gradient-to-r from-sky-400 via-purple-500 to-orange-500 rounded-[2.5rem]"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.01, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      {extreme && (
        <div className="absolute inset-[1px] -z-10 bg-slate-950 rounded-[2.5rem] opacity-90" />
      )}

      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/8 pointer-events-none" />
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

  const baseStyles = "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-bold tracking-tight transition-all duration-400 group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: 'h-10 px-5 text-xs',
    md: 'h-12 px-7 text-sm',
    lg: 'h-14 px-9 text-base',
  };

  const variantClasses = {
    primary: 'bg-white text-black hover:shadow-2xl shadow-white/10',
    secondary: 'bg-white/5 border border-white/15 text-white hover:bg-white/8 backdrop-blur-xl',
    ghost: 'text-white/60 hover:text-white hover:bg-white/6',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
  };

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.05, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)' }}
      whileTap={{ scale: 0.96 }}
      onMouseEnter={() => premiumFeedback.haptic(5)}
      transition={springConfig}
      onClick={handleClick}
      className={`${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {/* Ripple/Pulse Effect */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0 pointer-events-none"
        initial={false}
        whileTap={{ opacity: 0.2, scale: 1.5, transition: { duration: 0.4 } }}
      />
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            className="flex items-center gap-2"
          >
            {icon && (
              <motion.span 
                className="group-hover:rotate-12 transition-transform duration-300"
                whileHover={{ rotate: 15 }}
              >
                {icon}
              </motion.span>
            )}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export const PremiumInput: React.FC<{
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  floating?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  error,
  icon,
  floating = false,
  className = '',
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const hasValue = value && value.toString().length > 0;

  if (floating) {
    return (
      <div className="relative pt-6 group">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[1px] bg-sky-400 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm -z-10"
          animate={{ scaleX: isFocused ? [0.8, 1] : 1 }}
        />
        
        {icon && (
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFocused || hasValue ? 'text-sky-400 -translate-y-9 scale-90' : 'text-white/30'}`}>
            {icon}
          </span>
        )}

        <motion.label
          className={`absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 font-bold uppercase tracking-widest text-[10px] ${icon ? 'ml-10' : 'ml-0'} ${isFocused || hasValue ? 'text-sky-400 -translate-y-10' : 'text-white/40'}`}
        >
          {label}
        </motion.label>

        <input
          className={`w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-sky-400/50 transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-red-500/40' : ''} ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
            premiumFeedback.haptic(5);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          value={value}
          {...props}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] text-rose-400 font-bold tracking-tighter mt-1"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold tracking-tight text-white/60 ml-2">{label}</label>}
      <div className="relative group">
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl -z-10"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors">
            {icon}
          </span>
        )}
        <input
          className={`w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 placeholder:text-white/20 text-white outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all ${icon ? 'pl-11' : ''} ${error ? 'border-red-500/40 focus:border-red-500' : ''} ${className}`}
          onFocus={(e) => {
            props.onFocus?.(e);
            premiumFeedback.haptic(5);
          }}
          value={value}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: [0, -5, 5, -5, 5, 0],
              transition: { duration: 0.4 }
            }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center gap-2 mt-1.5 ml-2 text-rose-400"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <p className="text-[10px] font-black tracking-widest uppercase leading-none">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SuccessCheckmark: React.FC = () => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40"
  >
    <motion.svg
      viewBox="0 0 24 24"
      className="w-7 h-7 text-emerald-400"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
    >
      <motion.path
        fill="none"
        strokeWidth="3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </motion.svg>
  </motion.div>
);

export const ShakeContainer: React.FC<{ children: React.ReactNode; shouldShake: boolean }> = ({ children, shouldShake }) => (
  <motion.div
    animate={shouldShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

export const KPICard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { val: string; positive: boolean };
}> = ({ label, value, icon, trend }) => (
  <PremiumCard floating gradient className="h-full">
    <div className="flex justify-between items-start mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</p>
      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/80">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-4xl font-black tracking-tight text-white">{value}</h3>
      {trend && (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
          <HiMiniSparkles className="text-sm" />
          {trend.val}
        </div>
      )}
    </div>
  </PremiumCard>
);
export const PremiumBadge: React.FC<{
  children: React.ReactNode;
  tone?: 'neutral' | 'positive' | 'warning' | 'brand' | 'danger';
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'positive' | 'brand' | 'danger';
  icon?: React.ReactNode;
}> = ({
  children,
  tone = 'brand',
  variant,
  icon,
}) => {
  const resolvedTone = (() => {
    switch (variant) {
      case 'success': return 'positive';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'info': return 'brand';
      default: return variant || tone;
    }
  })();

  const toneClasses = {
    neutral: 'border-white/10 bg-white/[0.05] text-white/50',
    positive: 'border-emerald-400/15 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-400/15 bg-amber-500/10 text-amber-300',
    brand: 'border-sky-300/18 bg-sky-400/10 text-sky-200',
    danger: 'border-rose-400/20 bg-rose-500/10 text-rose-300',
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      onMouseEnter={() => premiumFeedback.haptic(2)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneClasses[resolvedTone as keyof typeof toneClasses]}`}
    >
      {icon}
      {children}
    </motion.span>
  );
};
