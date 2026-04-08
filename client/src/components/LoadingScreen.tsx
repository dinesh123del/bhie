import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkBackground from './ui/SparkBackground';
import InteractiveGlobe from './ui/InteractiveGlobe';
import { Scanlines, GlassShine } from './ui/MicroEngines';

// ── AERA Signature Sound ──────────────
// Unique 3-note harmony: Stability → Growth → Achievement
const playAERASound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.25);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
    filter.Q.value = 0.8;

    // Reverb for space
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

const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const statuses = [
    "Welcome to AERA.",
    "Preparing your workspace.",
    "Loading your data.",
    "Almost ready."
  ];

  useEffect(() => {
    // Play signature sound on mount
    playAERASound();

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 1000);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 4;
        return prev + step;
      });
    }, 450);

    const statusTimer = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statuses.length);
    }, 2200);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">


      {/* 1. PREMIUM BACKGROUNDS */}
      <SparkBackground />
      <Scanlines />
      <GlassShine />

      {/* 2. THE FINANCIAL GLOBE */}
      <div className="absolute inset-0 z-10 opacity-70">
        <React.Suspense fallback={null}>
          <InteractiveGlobe />
        </React.Suspense>
      </div>

      {/* 3. CENTRAL HUB OVERLAY */}
      <div className="relative z-20 flex flex-col items-center max-w-sm px-6 text-center">

        {/* Anti-gravity Core Branding (Now utilizing User's Generated Logo) */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[1px] border-white/20 blur-[1px]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-[0.5px] border-indigo-500/30"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-24 h-24 rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-[0_0_80px_rgba(79,70,229,0.4)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-purple-500/20 mix-blend-overlay" />

            {/* Clean AERA Mark */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#AF52DE] flex items-center justify-center relative z-10">
              <span className="text-white font-black text-2xl">A</span>
            </div>
          </motion.div>
        </div>

        {/* 3. CINEMATIC TEXT ANIMATION */}
        <div className="relative pt-12 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIdx}
              initial={{ opacity: 0, y: 20, filter: 'blur(15px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(15px)' }}
              transition={{
                duration: 1.5,
                ease: [0.2, 0.8, 0.2, 1]
              }}
              className="relative flex flex-col items-center gap-4"
            >
              <h1 className="text-3xl md:text-5xl font-black tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/50 text-center">
                {statuses[statusIdx]}
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="text-[#007AFF]/80 text-xs font-black uppercase tracking-[0.4em] text-center"
              >
                AERA
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Apple-style minimalist loading bar */}
          <div className="w-[260px] h-[2px] bg-white/5 rounded-full overflow-hidden mx-auto mt-8 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-white to-purple-500 shadow-[0_0_10px_#fff]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Apple-style Micro-detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">
            Connecting securely...
          </span>
        </motion.div>

      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10vw] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter mix-blend-overlay">
        AERA
      </div>
    </div>
  );
};

export default LoadingScreen;

