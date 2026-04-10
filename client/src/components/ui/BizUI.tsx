import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { designTokens } from '../../lib/design-tokens';

const { colors, radius, typography, animation, shadow } = designTokens;

export const Button = React.forwardRef<HTMLButtonElement, {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
} & React.ButtonHTMLAttributes<HTMLButtonElement>>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `bg-white text-black hover:bg-gray-100 focus:ring-white`,
    secondary: `bg-surface-default text-text-primary border border-border-default hover:bg-surface-hover hover:border-border-hover focus:ring-accent-blue`,
    ghost: `text-text-secondary hover:text-text-primary hover:bg-surface-hover focus:ring-accent-blue`,
    danger: `bg-accent-rose text-white hover:bg-opacity-90 focus:ring-accent-rose`,
  };

  const sizes = {
    sm: `h-8 px-3 text-xs rounded-${radius.sm}`,
    md: `h-10 px-4 text-sm rounded-${radius.md}`,
    lg: `h-12 px-6 text-base rounded-${radius.md}`,
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
});
Button.displayName = 'Button';

export const Card = React.forwardRef<HTMLDivElement, {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>>(({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-bg-secondary border border-border-default',
    elevated: 'bg-bg-elevated shadow-lg',
    outlined: 'bg-transparent border border-border-default',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      ref={ref}
      className={`rounded-${radius.lg} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const Input = React.forwardRef<HTMLInputElement, {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>>(({
  label,
  error,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full h-10 px-3 ${icon ? 'pl-10' : ''} 
            bg-bg-secondary border border-border-default rounded-${radius.md}
            text-text-primary placeholder-text-muted
            focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
            transition-colors duration-300
            ${error ? 'border-accent-rose' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-accent-rose">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export const Badge: React.FC<{
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-surface-default text-text-secondary',
    success: 'bg-accent-emerald/20 text-accent-emerald',
    warning: 'bg-accent-amber/20 text-accent-amber',
    error: 'bg-accent-rose/20 text-accent-rose',
    info: 'bg-accent-blue/20 text-accent-blue',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Skeleton: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`animate-pulse bg-bg-tertiary rounded-${radius.md} ${className}`} />
);

export const Divider: React.FC<{
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}> = ({ orientation = 'horizontal', className = '' }) => (
  orientation === 'horizontal' ? (
    <div className={`h-px bg-border-default ${className}`} />
  ) : (
    <div className={`w-px bg-border-default ${className}`} />
  )
);

export const Avatar: React.FC<{
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
  className?: string;
}> = ({ src, alt, size = 'md', fallback, className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-bg-tertiary overflow-hidden flex items-center justify-center ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-text-secondary font-medium">{fallback}</span>
      )}
    </div>
  );
};

export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`${sizes[size]} border-2 border-border-default border-t-accent-blue rounded-full animate-spin ${className}`} />
  );
};

export const Progress: React.FC<{
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}> = ({ value, max = 100, variant = 'default', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variants = {
    default: 'bg-accent-blue',
    success: 'bg-accent-emerald',
    warning: 'bg-accent-amber',
    error: 'bg-accent-rose',
  };

  return (
    <div className={`h-1 w-full bg-bg-tertiary rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full ${variants[variant]} transition-all duration-500 rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const Tabs: React.FC<{
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className = '' }) => (
  <div className={`flex gap-1 p-1 bg-bg-secondary rounded-${radius.md} ${className}`}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-${radius.sm} text-sm font-medium transition-colors duration-300
          ${activeTab === tab.id 
            ? 'bg-bg-tertiary text-text-primary' 
            : 'text-text-muted hover:text-text-secondary'
          }
        `}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);

export const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ content, children, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${positions[position]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
        <div className="px-2 py-1 bg-bg-elevated text-text-secondary text-xs rounded whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  );
};

export {
  colors,
  radius,
  typography,
  animation,
  shadow,
  designTokens,
};