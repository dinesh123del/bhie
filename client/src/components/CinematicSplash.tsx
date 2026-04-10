"use client"
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────────
   BIZ PLUS SPLASH SCREEN
   Pure black · minimalist logo · signature sound
   ─────────────────────────────────────────────────────────────── */

interface CinematicSplashProps {
  onComplete: () => void;
  duration?: number;
  muted?: boolean;
}

// ── BIZ PLUS Signature Sound ──────────────
// Unique 3-note harmony: Stability → Growth → Achievement
// Distinctly different from Netflix - cleaner, more professional
function playBizPlusSound(muted: boolean) {
  if (muted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Master output chain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.25);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

    // Clean, bright filter (less "boomy" than Netflix)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
    filter.Q.value = 0.8;

    // Spacious reverb for "cloud" feel
    const reverb = ctx.createConvolver();
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.25;

    // Create simple impulse response for reverb
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

    // BIZ PLUS 3-note signature: C → E → G (Major triad ascending)
    // Represents: Foundation → Growth → Success
    const playNote = (freq: number, start: number, duration: number, vol: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Elegant envelope - quick attack, smooth decay
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.08);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.3);
    };

    const baseFreq = 130.81; // C3 - solid foundation

    // Note 1: C3 (Foundation) - clear, stable
    playNote(baseFreq, 0.0, 1.4, 0.45, 'sine');
    playNote(baseFreq, 0.0, 1.4, 0.2, 'triangle'); // Harmonic support

    // Note 2: E3 (Growth) - major 3rd, optimistic - 0.18s delay
    playNote(baseFreq * 1.26, 0.18, 1.2, 0.4, 'sine');

    // Note 3: G3 (Achievement) - perfect 5th, resolving - 0.38s delay
    playNote(baseFreq * 1.5, 0.38, 1.0, 0.35, 'sine');

    // High shimmer for "intelligence" feel - 0.5s delay
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime + 0.5); // C4
    shimmerGain.gain.setValueAtTime(0, ctx.currentTime + 0.5);
    shimmerGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.65);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(filter);
    shimmer.start(ctx.currentTime + 0.5);
    shimmer.stop(ctx.currentTime + 2.0);

    // Subtle bass anchor (C2) - very gentle
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
}

function BizPlusLogoMark({ phase }: { phase: 'awaiting' | 'revealing' | 'exiting' }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-20 md:w-28 relative z-10"
      aria-label="BIZ PLUS"
      initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
      animate={
        phase === 'revealing'
          ? { opacity: 1, filter: 'blur(0px)', scale: 1 }
          : phase === 'exiting'
            ? { opacity: 0, scale: 1.05, filter: 'blur(10px)' }
            : { opacity: 0, filter: 'blur(10px)', scale: 0.9 }
      }
      transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {/* BIZ PLUS Mark - Clean Geometric A */}
      <rect x="15" y="15" width="70" height="70" rx="18" fill="url(#bizPlusGrad)" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fill="white"
        fontSize="42"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >+ </text>

      <defs>
        <linearGradient id="bizPlusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#AF52DE" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export default function CinematicSplash({
  onComplete,
  duration = 5000,
  muted = false,
}: CinematicSplashProps) {
  const [phase, setPhase] = useState<'awaiting' | 'revealing' | 'exiting'>('awaiting');
  const [ads, setAds] = useState<string[]>([]);
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    // Fetch dynamic ads
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/pricing');
        const json = await res.json();
        if (json.success && json.data.splashAds && json.data.splashAds.length > 0) {
          setAds(json.data.splashAds);
        } else {
          // Default fallbacks
          setAds([
            "Instant receipt scanning.",
            "Visualizing your financial health.",
            "Cash flow predictions.",
            "Automatic data extraction."
          ]);
        }
      } catch {
        // Fallback tips
        setAds(["Intelligence at the speed of thought."]);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase !== 'awaiting') return;
      playBizPlusSound(muted);
      setPhase('revealing');

      setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          setPhase('exiting');
          setTimeout(() => onComplete(), 1000);
        }
      }, duration - 1000);
    }, 400);

    return () => clearTimeout(timer);
  }, [phase, muted, duration, onComplete]);

  // Cycle ads if they exist
  useEffect(() => {
    if (ads.length <= 1) return;
    const adTimer = setInterval(() => {
      setCurrentAdIdx(prev => (prev + 1) % ads.length);
    }, 2500);
    return () => clearInterval(adTimer);
  }, [ads]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={phase === 'exiting' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1.0, ease: 'easeInOut' }}
    >
      <div className="relative flex flex-col items-center justify-center pointer-events-none w-full h-full">
        {/* Apple Intelligence Mesh Glow Background */}
        <AnimatePresence>
          {phase === 'revealing' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
            >
              <motion.div
                className="w-[500px] h-[500px] rounded-full opacity-25 blur-[100px]"
                style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, #FF2D55 0deg, #AF52DE 120deg, #007AFF 240deg, #FF2D55 360deg)',
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 8,
                  ease: "linear",
                  repeat: Infinity
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Logo Morph */}
        <BizPlusLogoMark phase={phase} />

        {/* Bottom Section: Loader + Ad/Tip */}
        <div className="absolute bottom-24 flex flex-col items-center gap-6 w-full max-w-[280px]">
          {/* Tip/Ad text */}
          <AnimatePresence mode="wait">
            {phase === 'revealing' && ads.length > 0 && (
              <motion.p
                key={currentAdIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="text-white/40 text-[11px] font-bold uppercase tracking-[0.25em] text-center px-4"
              >
                {ads[currentAdIdx]}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Apple-style minimalist loading bar */}
          <motion.div
            className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={phase === 'revealing' ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.0, delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-white/40"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: (duration / 1000) - 1.2, ease: "linear" }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
