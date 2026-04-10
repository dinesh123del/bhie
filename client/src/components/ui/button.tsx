import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDrop'> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'cinematic-btn bg-white/5',
    outline: 'btn-apple-outline',
    ghost: 'hover:bg-white/5 text-[#C0C0C0] transition-colors rounded-[16px]',
    destructive: 'cinematic-btn border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white'
  };

  const sizeClasses = {
    default: 'h-11 py-2 px-8',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-14 px-10 text-lg'
  };

  return (
    <motion.button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
