import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  name?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  error,
  name,
}) => {
  return (
    <motion.label
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="block space-y-2.5"
    >
      <span className="text-sm font-semibold tracking-tight text-ink-100">{label}</span>

      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-300">
            {icon}
          </div>
        ) : null}

        <motion.input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          whileFocus={{ scale: 1.005 }}
          className={`w-full rounded-[1.3rem] border bg-white/[0.04] px-4 py-3.5 text-[15px] text-white placeholder:text-ink-400 transition-all duration-200 ease-premium focus-brand ${
            icon ? 'pl-12' : ''
          } ${
            error
              ? 'border-rose-400/30'
              : 'border-white/10 hover:border-white/18'
          }`}
        />
      </div>

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-rose-300"
        >
          {error}
        </motion.p>
      ) : null}
    </motion.label>
  );
};

interface FeedbackToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ type, message, onClose }) => {
  const typeConfig = {
    success: {
      icon: Check,
      shell: 'border-emerald-400/15 bg-emerald-500/10 text-emerald-50',
      iconTone: 'text-emerald-200',
    },
    error: {
      icon: X,
      shell: 'border-rose-400/15 bg-rose-500/10 text-rose-50',
      iconTone: 'text-rose-200',
    },
    info: {
      icon: Info,
      shell: 'border-indigo-400/15 bg-indigo-500/10 text-indigo-50',
      iconTone: 'text-indigo-100',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      className={`glass-panel flex items-center gap-3 rounded-[1.4rem] border px-4 py-4 ${config.shell}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
        <Icon className={`h-4 w-4 ${config.iconTone}`} />
      </div>

      <p className="flex-1 text-sm leading-6 text-white">{message}</p>

      <motion.button
        type="button"
        onClick={onClose}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-ink-300"
      >
        <X className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};
