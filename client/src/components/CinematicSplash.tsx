import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────────
   BHIE CINEMATIC SPLASH SCREEN
   Pure black · glow logo · particles · signature sound · tagline
   ─────────────────────────────────────────────────────────────── */

interface CinematicSplashProps {
  onComplete: () => void;
  /** Duration before transitioning away (ms). Default: 3500 */
  duration?: number;
  /** Muted state — if true, audio is suppressed */
  muted?: boolean;
}

// ── Particle helper ──────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,          // 1–4 px
    dur: Math.random() * 3 + 5,            // 5–8 s
    delay: Math.random() * 3,              // stagger
    opacity: Math.random() * 0.4 + 0.1,  // brighter particles for explosion
  }));
}

// ── Grand Cinematic Sound (Apple-style F# Major) ──────────────
function playGrandStartup(muted: boolean) {
  if (muted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Master out with compression
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, ctx.currentTime);
    compressor.knee.setValueAtTime(30, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0.01, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.1);
    masterGain.gain.setTargetAtTime(0.001, ctx.currentTime + 0.5, 2.0); // Smooth decay
    
    // Smooth lowpass filter for warmth and "mac synth" feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    // Envelope for filter - opens up sharp, then sweeps down gracefully
    filter.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + 0.05);
    filter.frequency.setTargetAtTime(300, ctx.currentTime + 0.1, 2.0);
    filter.Q.value = 2.5; // Added resonance for a synth-bell ring

    filter.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Advanced synth chord generator
    const playNote = (freq: number, start: number, dur: number, vol: number, type: OscillatorType, detune: number = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      osc.detune.value = detune;
      
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      // Punchy attack
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.05);
      // Long, graceful decay mimicking a grand piano / bell chamber
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime + start + 0.1, dur / 1.5);
      
      osc.connect(gain);
      gain.connect(filter);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 1.0);
    };

    const baseF = 46.25; // F#1
    const t = 0.0;
    
    // Layer 0: SUB-BASS (Tremendous foundation, felt rather than heard)
    playNote(baseF / 2, t, 6.0, 0.5, 'sine');     // F#0 (23.12 Hz)

    // Layer 1: Bass foundation (Deep Saw/Triangle for rich lower harmonics)
    playNote(baseF, t, 6.0, 0.4, 'triangle');     // F#1
    playNote(baseF * 2, t, 5.5, 0.35, 'sawtooth'); // F#2
    
    // Layer 2: Main Body (Square/Saw for width, slightly detuned for massive chorus effect)
    playNote(baseF * 4, t + 0.02, 5.0, 0.25, 'square', -8); // F#3 detuned flat
    playNote(baseF * 4, t + 0.02, 5.0, 0.25, 'square', 8);  // F#3 detuned sharp
    playNote(138.59, t + 0.03, 5.0, 0.2, 'sawtooth');       // C#3
    
    // Layer 3: Warmth/Major third and fifth
    playNote(233.08, t + 0.04, 5.0, 0.15, 'sawtooth');    // A#3 (Major 3rd)
    playNote(277.18, t + 0.04, 5.0, 0.15, 'triangle');    // C#4 (Perfect 5th)
    
    // Layer 4: Crystalline Top (Sine for pure bell-like overtones)
    playNote(369.99, t + 0.05, 6.0, 0.15, 'sine');        // F#4
    playNote(554.37, t + 0.06, 6.0, 0.1, 'sine');         // C#5
    playNote(739.99, t + 0.08, 5.0, 0.05, 'sine');        // F#5
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Silently continue if audio isn't supported
  }
}

// ── BHIE Logo SVG (inline, GPU-animated) ────────────────────
function BHIELogoSVG({ phase }: { phase: 'awaiting' | 'revealing' | 'pulsing' | 'exiting' | 'hidden' }) {
  return (
    <svg
      viewBox="0 0 220 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-56 md:w-72"
      aria-label="BHIE"
    >
      <defs>
        <linearGradient id="bhie-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <filter id="bhie-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="bhie-glow-strong" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow halo behind text */}
      {phase === 'pulsing' && (
        <text
          x="110" y="62"
          textAnchor="middle"
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="72"
          letterSpacing="-4"
          fill="url(#bhie-grad)"
          filter="url(#bhie-glow-strong)"
          opacity="0.4"
        >
          BHIE
        </text>
      )}

      {/* Main BHIE text */}
      <text
        x="110" y="62"
        textAnchor="middle"
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="72"
        letterSpacing="-4"
        fill="url(#bhie-grad)"
        filter={(phase !== 'hidden' && phase !== 'awaiting') ? 'url(#bhie-glow)' : undefined}
      >
        BHIE
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────
export default function CinematicSplash({
  onComplete,
  duration = 3500, // Longer to let the massive chord ring out
  muted = false,
}: CinematicSplashProps) {
  const [phase, setPhase] = useState<'awaiting' | 'revealing' | 'pulsing' | 'exiting'>('awaiting');
  const particles = useRef(generateParticles(40));
  const completedRef = useRef(false);

  const startSequence = () => {
    if (phase !== 'awaiting') return;
    
    // Play majestic sound on click
    playGrandStartup(muted);
    setPhase('revealing');

    // Phase 2: pulsing (after reveal anim ~1200ms)
    setTimeout(() => setPhase('pulsing'), 1200);

    // Phase 3: begin exit transition and call onComplete
    setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        setPhase('exiting');
        onComplete();
      }
    }, duration);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      {/* ── Awaiting Gateway (Tap to Begin) ── */}
      <AnimatePresence>
        {phase === 'awaiting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-50 group"
            onClick={startSequence}
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl group-hover:bg-white/10 transition-colors"
                animate={{ boxShadow: ['0 0 0px rgba(79,70,229,0)', '0 0 40px rgba(79,70,229,0.5)', '0 0 0px rgba(79,70,229,0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
              </motion.div>
              <p className="text-sm font-bold tracking-[0.4em] uppercase text-white/40 group-hover:text-white/80 transition-colors">
                Enter Experience
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Background: very subtle radial gradients ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 60%, rgba(79,70,229,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 30% 30%, rgba(147,51,234,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 30% 25% at 70% 70%, rgba(79,70,229,0.04) 0%, transparent 50%)
          `,
        }}
      />

      {/* ── Cinematic Explosion Particles ── */}
      <AnimatePresence>
        {phase !== 'awaiting' && particles.current.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `50%`,
              top: `50%`,
              width: p.size,
              height: p.size,
              background: p.id % 3 === 0
                ? '#818CF8'
                : p.id % 3 === 1 ? '#9333EA' : '#4F46E5',
              '--dur': `${p.dur}s`,
              '--delay': `${p.delay}s`,
            } as React.CSSProperties}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, p.opacity, 0],
              x: (p.x - 50) * 8, // Explode outward mapped to 0-100 random values
              y: (p.y - 50) * 8,
              scale: [0, 1.5, 0.5]
            }}
            transition={{
              duration: p.dur,
              delay: 0, // No stagger on explosion
              ease: [0.11, 0, 0.5, 0] // Expo out for explosion trajectory
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Center stage ── */}
      <div className="relative flex flex-col items-center gap-8 pointer-events-none mt-10">

        {/* Logo wrapper with scale-up + pulse */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            phase === 'awaiting'
              ? { opacity: 0, scale: 0.8 }
              : phase === 'revealing'
                ? { opacity: 1, scale: 1, filter: 'drop-shadow(0 0 40px rgba(79,70,229,1))' }
                : phase === 'pulsing'
                  ? {
                    opacity: 1, scale: [1, 1.02, 1], filter: [
                      'drop-shadow(0 0 12px rgba(79,70,229,0.5))',
                      'drop-shadow(0 0 30px rgba(79,70,229,0.9))',
                      'drop-shadow(0 0 12px rgba(79,70,229,0.5))',
                    ]
                  }
                  : { opacity: 0, scale: 1.1, filter: 'blur(10px)' }
          }
          transition={
            phase === 'revealing'
              ? { duration: 1.2, ease: [0.11, 0, 0.2, 1] } // Epic explosive reveal ease
              : phase === 'pulsing'
                ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.8 }
          }
        >
          <BHIELogoSVG phase={phase as any} />
        </motion.div>

        {/* Tagline — fades in after initial blast */}
        <AnimatePresence>
          {(phase === 'pulsing' || phase === 'revealing') && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm font-medium tracking-[0.3em] uppercase"
              style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em' }}
            >
              Your Business. Your Control.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Thin animated line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            phase === 'pulsing'
              ? { scaleX: [0.6, 1, 0.6], opacity: [0.3, 0.7, 0.3] }
              : phase === 'revealing'
                ? { scaleX: [0, 1], opacity: [0, 0.5] }
                : { scaleX: 0, opacity: 0 }
          }
          transition={
            phase === 'pulsing'
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 1.0, delay: 0.5, ease: 'easeOut' }
          }
          style={{
            height: 1,
            width: 120,
            background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.8), rgba(147,51,234,0.8), transparent)',
          }}
        />
      </div>
    </motion.div>
  );
}
