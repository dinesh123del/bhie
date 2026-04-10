import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { gsap } from 'gsap';
import BizPlusLogo, { BizPlusIcon } from './BizPlusLogo';
import CinematicHero3D from './CinematicHero3D';

// ── Letterbox Micro-component ────────────────────────────────────────────────
const Letterbox = () => (
  <div className="fixed inset-0 pointer-events-none z-[60] flex flex-col justify-between">
    <motion.div 
      initial={{ height: '20vh' }}
      animate={{ height: '8vh' }}
      transition={{ duration: 2, ease: "expo.out" }}
      className="w-full bg-black" 
    />
    <motion.div 
      initial={{ height: '20vh' }}
      animate={{ height: '8vh' }}
      transition={{ duration: 2, ease: "expo.out" }}
      className="w-full bg-black" 
    />
  </div>
);

// ── Cinematic Text Engine ────────────────────────────────────────────────────
const ScrambleText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [display, setDisplay] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let iteration = 0;
    let interval: any = null;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplay(text.split('').map((char, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(''));
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
    }, delay * 1000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, delay]);

  return <span>{display}</span>;
};

// ── Phase 1: Cinematic Quantum Loader ─────────────────────────────────────────
const CinematicLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });
    gsap.to(progressRef, {
      current: 100,
      duration: 3.5,
      ease: 'expo.inOut',
      onUpdate: () => setProgress(Math.floor(progressRef.current)),
    });
    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(100px)' }}
      transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-20">
        <div className="relative group">
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-[10%] rounded-full bg-indigo-500/30 blur-[80px]"
          />
          <BizPlusIcon size={120} animated glowing />
        </div>

        <div className="text-center space-y-8">
          <div className="flex flex-col items-center translate-y-4">
             <span className="text-[12px] font-black text-white/20 uppercase tracking-[1em] mb-4">
              <ScrambleText text="GLOBAL DEPLOYMENT SUCCESSFUL" />
            </span>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl font-black text-white tracking-[-0.05em] tabular-nums">{progress}</span>
              <span className="text-[12px] font-black text-indigo-500/40 uppercase tracking-[0.5em] mb-2">Platform</span>
            </div>
          </div>
          <div className="w-80 h-[1px] bg-white/5 relative overflow-hidden rounded-full">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="absolute h-full bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,1)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Phase 2: Live 3D Cinematic Scene ──────────────────────────────────────────
const WelcomeScene = ({ onEnter }: { onEnter: () => void }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState(4);
  
  const smoothX = useSpring(useTransform(mouseX, [-1, 1], [-30, 30]), { stiffness: 30, damping: 30 });
  const smoothY = useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), { stiffness: 30, damping: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); onEnter(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onEnter]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
      mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo('.cinematic-stagger', 
      { opacity: 0, y: 100, filter: 'blur(30px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2.2, stagger: 0.25, ease: 'expo.out', delay: 0.8 }
    );
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(80px)' }}
      className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 🏛 ── HYPER-PREMIUM 3D ENGINE ── */}
      <CinematicHero3D />

      <Letterbox />

      {/* 🔬 ── GRAIN & NOISE OVERLAY ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 pointer-events-none"
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* ── CENTRAL HERO ORCHESTRATION ── */}
      <div className="relative z-10 flex flex-col items-center gap-24 w-full max-w-6xl px-8">
        
        {/* The Core identity with 3D Interaction */}
        <motion.div 
          style={{ x: useTransform(smoothX, x => x * -0.8), y: useTransform(smoothY, y => y * -0.8) }}
          className="cinematic-stagger"
        >
          <motion.div className="relative cursor-pointer transition-transform duration-700 active:scale-90">
             <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full scale-[2.5]" />
             <BizPlusLogo size={160} variant="full" animated glowing />
          </motion.div>
        </motion.div>

        {/* Messaging Infrastructure */}
        <div className="text-center space-y-12 max-w-3xl">
          <div className="cinematic-stagger space-y-8">
            <h1 className="text-[14px] font-black text-white/40 uppercase tracking-[1.2em] ml-[1.2em]">
              <ScrambleText text="GLOBAL · IMPACT · 2026" delay={1.5} />
            </h1>
            <p className="text-6xl md:text-8xl font-black text-white tracking-[-0.07em] leading-[0.85] text-balance">
              Redefining the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-900/40">Canvas of Wealth.</span>
            </p>
          </div>

          {/* Action Trigger with Trailer Aesthetic */}
          <div className="cinematic-stagger flex flex-col items-center gap-10 pt-10">
            <motion.button
              onClick={onEnter}
              whileHover={{ scale: 1.1, letterSpacing: '0.6em' }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-20 py-8 bg-white text-black font-black text-[14px] uppercase tracking-[0.4em] rounded-none overflow-hidden transition-all duration-700 hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white tracking-widest animate-pulse">LIVE NOW</div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-700">
                <ScrambleText text="LAUNCH EXPERIENCE" delay={0.8} />
              </span>
            </motion.button>
            
            <div className="flex items-center gap-10 text-white/5">
              <div className="w-24 h-[1px] bg-white/10" />
              <span className="text-[11px] font-mono tracking-[0.5em] uppercase">AUTO-SYNC IN {countdown}S</span>
              <div className="w-24 h-[1px] bg-white/10" />
            </div>
          </div>
        </div>

      </div>

      {/* ── PERIPHERAL DATA ── */}
      <div className="absolute bottom-20 left-20 cinematic-stagger hidden 2xl:block z-[70]">
        <div className="space-y-3">
          <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.6em]">System Architecture</div>
          <div className="text-[11px] font-mono text-indigo-500/40 tabular-nums uppercase tracking-widest">Core-V2 // Stable-Node</div>
        </div>
      </div>

      <div className="absolute bottom-20 right-20 cinematic-stagger hidden 2xl:block z-[70]">
        <div className="flex items-center gap-6 bg-white/[0.01] px-8 py-4 border border-white/5 backdrop-blur-[40px]">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_#fff]" />
          </div>
          <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em]">Live Uplink Active</span>
        </div>
      </div>

      {/* Cinematic Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none opacity-[0.02] scale-150">
        <h2 className="text-[40vw] font-black tracking-[-0.1em] text-white leading-none">BIZ+</h2>
      </div>

    </motion.div>
  );
};

// ── Master Orchestrator ───────────────────────────────────────────────────────
const BizPlusWelcome3D: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const [phase, setPhase] = useState<'loading' | 'welcome'>('loading');
  return (
    <div className="fixed inset-0 bg-black">
      <AnimatePresence mode="wait">
        {phase === 'loading' ? (
          <CinematicLoader key="loader" onComplete={() => setPhase('welcome')} />
        ) : (
          <WelcomeScene key="welcome" onEnter={onEnter} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BizPlusWelcome3D;
