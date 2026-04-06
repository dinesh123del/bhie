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

const springConfig = { type: 'spring', stiffness: 110, damping: 26, mass: 1.2 };
const inertiaConfig = { type: 'spring', stiffness: 80, damping: 25, mass: 1.5 };

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
        y: -4, 
        scale: extreme ? 1.02 : 1.01, 
        boxShadow: extreme 
          ? '0 40px 80px -12px rgba(168,85,247,0.15), 0 20px 40px -15px rgba(56,189,248,0.2)' 
          : '0 30px 60px -12px rgba(0,0,0,0.3), 0 16px 32px -16px rgba(0,0,0,0.4)',
        borderColor: 'rgba(255,255,255,0.15)'
      } : undefined}
      whileTap={hoverable ? { scale: 0.99, y: -1 } : undefined}
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
      className={`relative overflow-hidden rounded-[2.5rem] border transition-colors duration-700 ${extreme ? 'border-transparent' : 'border-white/[0.06] hover:border-white/[0.12]'} bg-white/[0.02] backdrop-blur-[40px] ${padded ? 'p-8' : ''} ${className}`}
    >
      {extreme && (
        <motion.div
          className="absolute -inset-[1px] -z-10 bg-gradient-to-r from-sky-400/50 via-purple-500/50 to-orange-500/50 rounded-[2.5rem]"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.005, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    premiumFeedback.click();
    if (onClick) onClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const baseStyles = "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl font-bold tracking-tight transition-all duration-400 group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: 'h-10 px-5 text-xs',
    md: 'h-12 px-7 text-sm',
    lg: 'h-14 px-9 text-base',
  };

  const variantClasses = {
    primary: 'bg-white text-black hover:shadow-[0_24px_48px_-12px_rgba(255,255,255,0.25)] shadow-white/10 dark:bg-white dark:text-black',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-xl',
    ghost: 'text-white/60 hover:text-white hover:bg-white/5',
    danger: 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20',
  };

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.96 }}
      onMouseEnter={() => {
        setIsHovered(true);
        premiumFeedback.haptic(2);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className={`${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {/* 1. MAGNETIC GLOW EFFECT */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle 120px at ${mousePosition.x}px ${mousePosition.y}px, ${
                variant === 'primary' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'
              }, transparent 100%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. GLASS SHINE STREAK */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%]"
          animate={isHovered ? { translateZ: 0, translateX: ['100%', '-100%'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
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
            className="relative z-10 flex items-center gap-2"
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
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

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
          className={`w-full bg-transparent border-b border-[var(--bhie-border)] py-3 text-white caret-sky-400 outline-none focus:border-sky-400/50 transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-red-500/40' : ''} ${className}`}
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
      {label && <label className="text-sm font-semibold tracking-tight text-[var(--secondary-text)] ml-2">{label}</label>}
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
          className={`w-full bg-[var(--bhie-surface)] border border-[var(--bhie-border)] rounded-2xl px-4 py-3 placeholder:text-[var(--tertiary-text)] text-white caret-[var(--bhie-primary)] outline-none focus:border-[var(--bhie-primary)]/40 focus:bg-[var(--bhie-surface)]/80 transition-all ${icon ? 'pl-11' : ''} ${error ? 'border-red-500/40 focus:border-red-500' : ''} ${className}`}
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
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--secondary-text)]">{label}</p>
      <div className="p-3 bg-[var(--bhie-surface)] rounded-xl border border-[var(--bhie-border)] text-[var(--primary-text)]">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <h3 className={`text-4xl font-black tracking-tight text-[var(--primary-text)] transition-opacity ${value === 0 || value === '0' || value === '₹0' ? 'opacity-30' : 'opacity-100'}`}>
        {value}
      </h3>
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
    neutral: 'border-[var(--bhie-border)] bg-[var(--bhie-surface)] text-[var(--secondary-text)]',
    positive: 'border-emerald-400/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    warning: 'border-amber-400/15 bg-amber-500/10 text-amber-600 dark:text-amber-300',
    brand: 'border-sky-300/18 bg-sky-400/10 text-sky-600 dark:text-sky-200',
    danger: 'border-rose-400/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
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
