import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, Loader2, X, Zap } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-transparent/72 backdrop-blur-xl"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={`${sizeClasses[size]} glass-panel-strong relative w-full overflow-hidden rounded-[2rem]`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_26%)]" />

              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-7">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ink-400">Dialog</p>
                    <h2 className="text-2xl font-black tracking-[-0.05em] text-white">{title}</h2>
                  </div>

                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.04, rotate: 90 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-ink-300 transition-colors hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="px-6 py-6 md:px-7 md:py-7">{children}</div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
  loading = false,
}) => {
  const typeConfig = {
    danger: {
      icon: AlertTriangle,
      tone: 'from-rose-400/20 to-rose-500/8',
      button: 'border-rose-400/22 bg-rose-500/16 text-rose-50 hover:bg-rose-500/22',
      iconTone: 'text-rose-300',
    },
    warning: {
      icon: Zap,
      tone: 'from-amber-400/20 to-orange-500/10',
      button: 'border-amber-400/22 bg-amber-500/16 text-amber-50 hover:bg-amber-500/22',
      iconTone: 'text-amber-200',
    },
    info: {
      icon: Info,
      tone: 'from-sky-400/20 to-indigo-500/10',
      button: 'border-indigo-400/22 bg-indigo-500/16 text-indigo-50 hover:bg-indigo-500/22',
      iconTone: 'text-indigo-200',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-40 bg-transparent/72 backdrop-blur-xl"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel-strong relative w-full max-w-md rounded-[2rem] p-6"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.tone}`} />

              <div className="relative space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <Icon className={`h-6 w-6 ${config.iconTone}`} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-[-0.05em] text-white">{title}</h3>
                  <p className="text-sm leading-6 text-ink-300">{message}</p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08] disabled:opacity-60"
                  >
                    {cancelText}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${config.button}`}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {confirmText}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
