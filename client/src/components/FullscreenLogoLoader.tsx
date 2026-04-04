import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface FullscreenLogoLoaderProps {
  label?: string;
}

const FullscreenLogoLoader = ({
  label = 'Preparing your workspace',
}: FullscreenLogoLoaderProps) => {
  useEffect(() => {
    // Premium startup sound (Rich Harmonic Layer)
    const playStartupSound = () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playTone = (freq: number, start: number, duration: number, volume: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
          
          // Soft attack and long release for "premium" feel
          gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
          gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + start + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(audioCtx.currentTime + start);
          osc.stop(audioCtx.currentTime + start + duration + 0.1);
        };

        // A Major 9th (Peaceful & Sophisticated)
        // A2, E3, A3, C#4, G#4, B4 (Spaced out for richness)
        playTone(110.00, 0.0, 3.5, 0.08); // A2 (Deep Foundation)
        playTone(164.81, 0.2, 3.2, 0.06); // E3 (Fifth)
        playTone(220.00, 0.4, 2.9, 0.05); // A3 (Octave)
        playTone(277.18, 0.6, 2.6, 0.04); // C#4 (Major Third)
        playTone(415.30, 0.8, 2.3, 0.03); // G#4 (Major Seventh)
        playTone(493.88, 1.0, 2.0, 0.02); // B4 (Ninth)
        
      } catch (e) {
        console.warn('Audio feedback not supported or blocked by browser');
      }
    };

    // Attempt to play sound (browsers might block without interaction, but worth a try)
    playStartupSound();
  }, []);

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
