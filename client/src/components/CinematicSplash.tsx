import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ──────────────────────────────────────────────────────────────
   Finly APPLE-INTELLIGENCE SPLASH SCREEN
   Pure black · minimalist logo · intelligence mesh · signature sound
   ─────────────────────────────────────────────────────────────── */

interface CinematicSplashProps {
  onComplete: () => void;
  duration?: number;
  muted?: boolean;
}

// ── Apple Startup Sound ──────────────
function playMacStartup(muted: boolean) {
  if (muted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1); 
    masterGain.gain.setTargetAtTime(0.001, ctx.currentTime + 1.0, 2.0); 
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.05);
    filter.frequency.setTargetAtTime(400, ctx.currentTime + 0.1, 2.0);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const playNote = (freq: number, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.05);
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime + start + 0.2, dur);
      
      osc.connect(gain);
      gain.connect(filter);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 1.0);
    };

    // Subdued F# Major Startup Chord
    const base = 184.99; // F#3
    playNote(base, 0.0, 3.0, 0.4);            
    playNote(base * 1.25, 0.02, 3.0, 0.2); // A# (Major 3rd)
    playNote(base * 1.5, 0.04, 3.0, 0.2);  // C# (Perfect 5th)
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch {
    // Silently continue
  }
}

function FinlyLogoSVG({ phase }: { phase: 'awaiting' | 'revealing' | 'exiting' }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-20 md:w-28 relative z-10"
      aria-label="Finly"
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
      <path
        d="M50 10 C 20 10 10 20 10 50 C 10 80 20 90 50 90 C 80 90 90 80 90 50 C 90 20 80 10 50 10 Z"
        fill="white"
        opacity="0.05"
      />
      <path 
        d="M32 40 L45 40 Q55 40 55 50 Q55 60 45 60 L32 60 Z"
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M32 40 L32 60"
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <path 
        d="M32 50 L48 50"
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <circle cx="68" cy="50" r="4" fill="url(#aiGrad)" />
      
      <defs>
        <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="50%" stopColor="#AF52DE" />
          <stop offset="100%" stopColor="#FF2D55" />
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
            "AI-powered receipt scanning.",
            "Visualizing your financial pulse.",
            "Smart cash flow predictions.",
            "Zero manual data entry."
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
      playMacStartup(muted);
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
        <FinlyLogoSVG phase={phase} />
        
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
