import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useFeedback } from '@/hooks/useSound';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  withSound?: boolean;
  withHaptic?: boolean;
  soundType?: 'click' | 'success' | 'error' | 'hover';
}

export const SoundButton = memo(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    withSound = true,
    withHaptic = true,
    soundType = 'click',
    onClick,
    ...props
  }: SoundButtonProps) => {
    const { trigger: playFeedback } = useFeedback(soundType, 'click');

    const baseClasses =
      'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 will-change-transform';

    const variantClasses = {
      primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/40',
      secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30 hover:shadow-lg',
      danger: 'bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30',
      ghost: 'text-white hover:bg-white/5 border border-transparent hover:border-white/10',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (withSound || withHaptic) {
        playFeedback();
      }
      onClick?.(e);
    };

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
        disabled={loading}
        onClick={handleClick}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        } ${className}`}
        {...(props as any)}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          icon && <motion.div whileHover={{ rotate: 5 }}>{icon}</motion.div>
        )}
        {children}
      </motion.button>
    );
  }
);

SoundButton.displayName = 'SoundButton';
