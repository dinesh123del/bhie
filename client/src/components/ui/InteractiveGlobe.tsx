import React from 'react';
import { motion } from 'framer-motion';

const InteractiveGlobe = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#050508] overflow-hidden">
      {/* ── Cinematic Background Asset (Dimmmed) ────────────────────── */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/cinematic-bg.png)', filter: 'blur(20px)' }}
      />

      {/* ── Outer Atmosphere Glow ──────────────────────────────────── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '75%',
          height: '75%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── The Globe Sphere ───────────────────────────────────────── */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: '60%',
          aspectRatio: '1/1',
          background: 'radial-gradient(circle at 30% 30%, #0A0A0F 0%, #050508 100%)',
          boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.8), inset 20px 20px 50px rgba(255,255,255,0.02), 0 0 100px rgba(0,122,255,0.1)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {/* Animated Map/Grid Overlay (CSS Pseudo-3D) */}
        <div 
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at center, transparent 0%, rgba(0,122,255,0.2) 100%),
              repeating-linear-gradient(transparent, transparent 19px, rgba(0,122,255,0.1) 20px),
              repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,122,255,0.1) 20px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            maskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
          }}
        />

        {/* Orbiting Ring 1 */}
        <motion.div
          className="absolute border border-blue-500/30 rounded-full"
          style={{
            inset: '-10%',
            borderWidth: '1px',
            transform: 'rotateX(75deg)',
          }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Orbiting Ring 2 */}
        <motion.div
          className="absolute border border-purple-500/20 rounded-full"
          style={{
            inset: '-20%',
            borderWidth: '1px',
            transform: 'rotateX(60deg) rotateY(45deg)',
          }}
          animate={{ rotateZ: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating Data Nodes (Neural Network feel) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${50 + Math.cos((i * Math.PI * 2) / 12) * 40}%`,
              top: `${50 + Math.sin((i * Math.PI * 2) / 12) * 40}%`,
              boxShadow: '0 0 8px rgba(0,162,255,0.8)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* ── Cinematic Text Overlay ─────────────────────────────────── */}
      <div className="absolute bottom-10 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">
            Global Launch 2026 // Network Live
          </span>
        </motion.div>
      </div>

      {/* Scan Lines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, white 2px)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
};

export default InteractiveGlobe;
