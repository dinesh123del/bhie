import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

interface SoundInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  withSound?: boolean;
  onFocusWithFeedback?: () => void;
}

export const SoundInput = memo(
  ({
    label,
    icon,
    error,
    className = '',
    withSound = true,
    onFocus,
    onFocusWithFeedback,
    ...props
  }: SoundInputProps) => {
    const { play: playHoverSound } = useSound('hover');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (withSound) {
        playHoverSound();
      }
      onFocusWithFeedback?.();
      onFocus?.(e);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <motion.div
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
              whileHover={{ scale: 1.1 }}
            >
              {icon}
            </motion.div>
          )}
          <motion.input
            type="text"
            onFocus={handleFocus}
            whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)' }}
            className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-white/5 border ${
              error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500'
            } rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 ${
              error ? 'focus:ring-red-500/30' : 'focus:ring-indigo-500/30'
            } transition-all duration-200 will-change-transform ${className}`}
            {...(props as any)}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

SoundInput.displayName = 'SoundInput';
