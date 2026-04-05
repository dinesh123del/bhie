import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Activity, Shield, Cpu, Zap, Network } from 'lucide-react';

// 1. MAGNETIC WRAPPER: Buttons that pull towards the cursor
export const MagneticWrapper: React.FC<{ children: React.ReactNode; strength?: number; className?: string }> = ({ 
  children, 
  strength = 0.5,
  className = ""
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

// 2. REALITY ENGINE: Animated data throughput visualization
export const RealityEngine: React.FC = () => {
  const [throughput, setThroughput] = useState(42.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setThroughput(prev => {
        const delta = (Math.random() - 0.5) * 5;
        return Math.max(10, Math.min(99, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2 backdrop-blur-xl">
      <div className="relative">
        <Cpu className="h-4 w-4 text-sky-400" />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-sky-400 blur-md"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Reality Engine</span>
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-white/5">
            <motion.div 
              animate={{ width: `${throughput}%` }}
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-sky-300">{throughput.toFixed(1)}GB/s</span>
        </div>
      </div>
    </div>
  );
};

// 3. THERMAL ENGINE: Pulse representing activity
export const ThermalEngine: React.FC = () => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2 backdrop-blur-xl">
      <div className="relative">
        <Zap className="h-4 w-4 text-amber-400" />
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-amber-400 blur-md"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Thermal Load</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [4, 8, 4],
                backgroundColor: i > 3 ? ['rgba(251,191,36,0.3)', 'rgba(251,191,36,0.6)', 'rgba(251,191,36,0.3)'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
              }}
              transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
              className="w-1 rounded-full"
            />
          ))}
          <span className="ml-1 text-[10px] font-mono font-bold text-amber-300">36.4°C</span>
        </div>
      </div>
    </div>
  );
};

// 4. SECURITY ENGINE: Rotating geometric protection
export const SecurityEngine: React.FC = () => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2 backdrop-blur-xl">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-lg border border-emerald-500/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-1 rounded-md border border-emerald-400/20"
        />
        <Shield className="h-3 w-3 text-emerald-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Secure Layer</span>
        <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-tighter">ENCRYPTED_AES256</span>
      </div>
    </div>
  );
};

// 5. NEURAL SYNC ENGINE: Network nodes
export const NeuralSyncEngine: React.FC = () => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2 backdrop-blur-xl">
      <div className="relative">
        <Network className="h-4 w-4 text-purple-400" />
        <motion.div 
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-purple-400 blur-lg opacity-20"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Neural Sync</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.1, 1, 0.1] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              className="h-1 w-1 rounded-full bg-purple-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. SCANLINES: CRT effect
export const Scanlines: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-inherit opacity-[0.03]">
    <div className="h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
  </div>
);

// 7. GLASS MIRROR SHINE
export const GlassShine: React.FC = () => (
  <motion.div
    animate={{ x: ['-100%', '200%'] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
  />
);

// 8. MOUSE FOLLOW GLOW
export const MouseGlow: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0,
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    />
  );
};
