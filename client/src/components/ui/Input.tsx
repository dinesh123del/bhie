"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        <motion.label
          initial={false}
          animate={{
            y: isFocused || hasValue ? -24 : 14,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: isFocused ? '#00D4FF' : '#C0C0C0'
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute left-4 top-0 origin-top-left pointer-events-none text-[15px]"
        >
          {label}
        </motion.label>

        {/* Cinematic Input */}
        <input
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full bg-white/5 border border-white/5 rounded-[16px] px-4 py-3.5 
            text-white text-[15px] outline-none transition-all duration-300
            hover:border-white/20 hover:bg-white/10
            focus:border-[#00D4FF] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] focus:bg-white/10
            ${error ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Underline Edge Lighting effect on focus */}
        <motion.div 
          className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent pointer-events-none"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: isFocused ? 1 : 0, scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {error && (
          <p className="absolute -bottom-6 left-2 text-xs text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
