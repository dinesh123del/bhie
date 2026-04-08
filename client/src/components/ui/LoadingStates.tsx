import React from 'react';
import { motion } from 'framer-motion';
import FullscreenLogoLoader from '../FullscreenLogoLoader';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className={`${sizeMap[size]} border-2 border-white/20 border-t-indigo-500 rounded-full`}
    />
  );
};

export const PageLoader: React.FC = () => <FullscreenLogoLoader label="Loading AERA" />;

export const SuccessAnimation: React.FC<{ message?: string }> = ({ message = 'Success!' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    className="flex flex-col items-center gap-3"
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6 }}
      className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center"
    >
      <motion.svg
        className="w-8 h-8 text-emerald-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </motion.svg>
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-sm font-medium text-emerald-300"
    >
      {message}
    </motion.p>
  </motion.div>
);

export const ErrorAnimation: React.FC<{ message?: string }> = ({ message = 'Error!' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center gap-3"
  >
    <motion.div
      animate={{ x: [-8, 8, -8, 8, -4, 4, 0] }}
      transition={{ duration: 0.5 }}
      className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center"
    >
      <span className="text-2xl text-red-400">✕</span>
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-sm font-medium text-red-300"
    >
      {message}
    </motion.p>
  </motion.div>
);
