import { motion } from 'framer-motion';
import Logo from './Logo';

interface FullscreenLogoLoaderProps {
  label?: string;
}

const FullscreenLogoLoader = ({
  label = 'Preparing your workspace',
}: FullscreenLogoLoaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%),linear-gradient(145deg,#030712,#020617_45%,#0f172a)]"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-60"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15), transparent 28%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.18), transparent 24%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Logo size="lg" glow showSubtitle subtitle="Business Intelligence Engine" />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="h-px w-48 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.92, 1.04, 0.92] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.p
            className="text-sm uppercase tracking-[0.34em] text-slate-300"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {label}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default FullscreenLogoLoader;
