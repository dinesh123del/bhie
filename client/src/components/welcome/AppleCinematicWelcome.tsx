"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicHero3D from './CinematicHero3D';

const AppleCinematicWelcome: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const [phase, setPhase] = useState<'intro' | 'interaction'>('intro');

  useEffect(() => {
    // Sync UI reveal — faster transition for snappier feel
    const timer = setTimeout(() => setPhase('interaction'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-black overflow-hidden font-sans select-none">
      <AnimatePresence mode="wait">
        {/* ADVANCED 3D HERO ENGINE */}
        <motion.div
           key="hero-3d"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 3 }}
           className="absolute inset-0"
        >
          <CinematicHero3D />
        </motion.div>

        {/* PHASE 1: MINIMALIST REVEAL */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20"
          >
            <div className="mb-10 flex items-center justify-center" style={{ willChange: 'transform' }}>
              <motion.img
                src="/logo-mark.png"
                alt="Biz Plus Logo"
                className="select-none"
                style={{ width: 120, height: 120, objectFit: 'contain', filter: 'drop-shadow(0 0 32px rgba(129,140,248,0.6))' }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter mb-4">
              Biz Plus
            </h1>
            <p className="text-white text-xl md:text-2xl font-medium tracking-tight opacity-100">
              Intelligence Refined.
            </p>
          </motion.div>
        )}

        {/* PHASE 2: INTERACTION READY */}
        {phase === 'interaction' && (
          <motion.div
            key="interaction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-between py-24 px-12"
          >
            {/* Top Branding */}
             <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.1, duration: 0.5 }}
               className="flex items-center gap-3"
             >
               <img
                 src="/logo-mark.png"
                 alt="Biz Plus"
                 style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.8))' }}
               />
               <span className="text-white text-xs font-black uppercase tracking-[0.5em]">Biz Plus · Economic Intel</span>
             </motion.div>

            {/* Main Headline */}
            <div className="text-center space-y-8 max-w-5xl">
               <motion.h2 
                 initial={{ y: 40, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                 className="text-white text-7xl md:text-9xl font-black tracking-[-0.06em] leading-[0.85]"
               >
                 Future is <br />
                 <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">In Your Hands.</span>
               </motion.h2>

               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.8 }}
                 className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto"
               >
                 Experience the most advanced business health engine ever built. Fast, powerful, and private.
               </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.button
                onClick={onEnter}
                whileHover={{ scale: 1.02, backgroundColor: '#fff', color: '#000' }}
                whileTap={{ scale: 0.98 }}
                className="px-20 py-6 bg-white/5 border border-white/20 rounded-full text-white text-sm font-black uppercase tracking-[0.4em] backdrop-blur-3xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(255,255,255,0.1)]"
              >
                Get Started
              </motion.button>
              <span className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">Press Enter to Begin</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Letterbox (Apple style subtle) */}
      <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between">
        <div className="w-full h-[8vh] bg-gradient-to-b from-black to-transparent" />
        <div className="w-full h-[8vh] bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default AppleCinematicWelcome;
