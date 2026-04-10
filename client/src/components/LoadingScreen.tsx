import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkBackground from './ui/SparkBackground';
import { Scanlines, GlassShine } from './ui/MicroEngines';

// ── Scramble Text Micro-engine ────────────────────────────────────────────────
const ScrambleText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [display, setDisplay] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let iteration = 0;
    let interval: any = null;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplay(text
          .split('')
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
        );
        
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  return <span>{display}</span>;
};

// ── BIZ PLUS Quantum Audio Engine ──────────────────────────
const playQuantumStartup = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
    master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
    master.connect(ctx.destination);

    const playPulse = (freq: number, time: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      g.gain.setValueAtTime(0, ctx.currentTime + time);
      g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    };

    [65.41, 130.81, 196.00, 261.63].forEach((f, i) => {
      playPulse(f, i * 0.2, 2.5 - i * 0.3);
    });
  } catch (e) { /* silence */ }
};

const QuantumParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles: any[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.3 + 0.1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 122, 255, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();
    const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
};

const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const statuses = [
    "Establishing Encrypted Link",
    "Optimizing Core Ledger",
    "Synchronizing Market Nodes",
    "BIZ PLUS Environment Ready"
  ];

  useEffect(() => {
    playQuantumStartup();
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 1000);
          return 100;
        }
        return prev + Math.random() * 4 + 1;
      });
    }, 150);

    const statusInterval = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % statuses.length);
    }, 2800);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.12, filter: 'blur(40px)' }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[10000] bg-[#000000] flex flex-col items-center justify-center overflow-hidden"
    >
      <QuantumParticles />
      <SparkBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,255,0.06)_0%,transparent_70%)]" />
      
      <Scanlines />
      <GlassShine />

      <div className="relative z-10 flex flex-col items-center gap-20 px-8 max-w-xl w-full">
        
        {/* Deep 3D Emblem Reveal */}
        <div className="relative group">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ rotate: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity } }}
            className="absolute inset-[-50px] rounded-full bg-[#00D4FF]/20 text-[#00D4FF]/10 blur-[40px]"
          />
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-40 h-40 rounded-[3rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-[0_0_120px_rgba(0,122,255,0.2)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-indigo-500/10" />
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-[#00D4FF]/20 text-[#00D4FF]/5 blur-2xl" 
            />
            
            <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white to-gray-400 p-[1px] shadow-2xl">
              <div className="w-full h-full rounded-[2rem] bg-black flex items-center justify-center overflow-hidden">
                <motion.span 
                  animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-white font-black text-5xl tracking-tighter"
                >
                  BP
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cinematic Scramble Text */}
        <div className="space-y-8 w-full text-center">
          <div className="h-8 flex flex-col items-center justify-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={statusIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8 }}
                className="text-[11px] font-black text-white/30 uppercase tracking-[0.8em] ml-[0.8em]"
              >
                <ScrambleText text={statuses[statusIdx]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Minimalist Progress Infrastructure */}
          <div className="space-y-3">
            <div className="relative h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                className="absolute h-full left-0 top-0 bg-[#00D4FF]/20 text-[#00D4FF] shadow-[0_0_20px_rgba(0,122,255,1)]"
              />
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Initialize Core Link</span>
              <span className="text-[9px] font-mono text-[#00D4FF]/60 tabular-nums">{Math.floor(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Peripheral Micro-details */}
      <div className="absolute top-12 left-12 opacity-20 hidden md:block">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] animate-pulse" />
          <span className="text-[8px] font-mono text-white tracking-[0.4em] uppercase">Node: 127.0.0.1</span>
        </div>
      </div>

      <div className="absolute bottom-12 right-12">
        <div className="flex items-center gap-4 bg-white/[0.02] px-6 py-3 rounded-full border border-white/5 backdrop-blur-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Integrity Verified</span>
        </div>
      </div>

    </motion.div>
  );
};

export default LoadingScreen;

