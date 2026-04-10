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
    // BIZ PLUS Signature Sound - Unique 3-note harmony
    const playBizPlusSound = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.25);
        masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
        filter.Q.value = 0.8;

        const reverb = ctx.createConvolver();
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.25;

        const rate = ctx.sampleRate;
        const length = rate * 1.5;
        const impulse = ctx.createBuffer(2, length, rate);
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3) * 0.5;
          }
        }
        reverb.buffer = impulse;

        filter.connect(masterGain);
        masterGain.connect(ctx.destination);
        filter.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        const playNote = (freq: number, start: number, duration: number, vol: number, type: OscillatorType = 'sine') => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

          gain.gain.setValueAtTime(0, ctx.currentTime + start);
          gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.08);
          gain.gain.setValueAtTime(vol, ctx.currentTime + start + duration * 0.6);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

          osc.connect(gain);
          gain.connect(filter);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration + 0.3);
        };

        const baseFreq = 130.81; // C3

        // Note 1: Foundation
        playNote(baseFreq, 0.0, 1.4, 0.45, 'sine');
        playNote(baseFreq, 0.0, 1.4, 0.2, 'triangle');

        // Note 2: Growth - 0.18s delay
        playNote(baseFreq * 1.26, 0.18, 1.2, 0.4, 'sine');

        // Note 3: Achievement - 0.38s delay
        playNote(baseFreq * 1.5, 0.38, 1.0, 0.35, 'sine');

        // High shimmer - 0.5s delay
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime + 0.5);
        shimmerGain.gain.setValueAtTime(0, ctx.currentTime + 0.5);
        shimmerGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.65);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(filter);
        shimmer.start(ctx.currentTime + 0.5);
        shimmer.stop(ctx.currentTime + 2.0);

        // Subtle bass anchor
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = 'sine';
        bass.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);
        bassGain.gain.setValueAtTime(0, ctx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.2);
        bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        bass.connect(bassGain);
        bassGain.connect(masterGain);
        bass.start(ctx.currentTime);
        bass.stop(ctx.currentTime + 2.2);

        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch {
        // Silently continue
      }
    };

    playBizPlusSound();
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
          <Logo size="lg" glow showSubtitle subtitle="Economic Resilience" />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="h-px w-48 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.92, 1.04, 0.92] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.p
            className="text-sm uppercase tracking-[0.34em] text-[#C0C0C0]"
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
