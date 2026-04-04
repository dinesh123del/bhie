import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',

}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap border border-white/10 shadow-lg`}
          >
            {content}
            <motion.div
              className={`absolute w-1.5 h-1.5 bg-gray-900 border border-white/10 ${
                position === 'top'
                  ? '-bottom-1 left-1/2 -translate-x-1/2 rotate-45'
                  : position === 'bottom'
                  ? '-top-1 left-1/2 -translate-x-1/2 rotate-45'
                  : position === 'left'
                  ? '-right-1 top-1/2 -translate-y-1/2 rotate-45'
                  : '-left-1 top-1/2 -translate-y-1/2 rotate-45'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
