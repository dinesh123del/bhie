import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkBackground from './ui/SparkBackground';
import InteractiveGlobe from './ui/InteractiveGlobe';
import { Scanlines, GlassShine } from './ui/MicroEngines';
import { Sparkles, ArrowRight } from 'lucide-react';

const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const statuses = [
    "Intelligence is here.",
    "Connecting you to the world.",
    "Preparing your insights.",
    "You are ready."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Small delay for cinematic exit
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
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* 1. PREMIUM BACKGROUNDS */}
      <SparkBackground />
      <Scanlines />
      <GlassShine />

      {/* 2. THE FINANCIAL GLOBE */}
      <div className="absolute inset-0 z-10 opacity-70">
         <InteractiveGlobe />
      </div>

      {/* 3. CENTRAL HUB OVERLAY */}
      <div className="relative z-20 flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* Anti-gravity Core Branding */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-10">
           <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[0.5px] border-white/10" 
           />
           <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group"
           >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10" />
              <Sparkles className="w-8 h-8 text-white/80 animate-pulse" />
           </motion.div>
        </div>

        {/* 3. CINEMATIC TEXT ANIMATION */}
        <div className="relative pt-24 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIdx}
              initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(20px)' }}
              transition={{ 
                duration: 2.2, 
                ease: [0.2, 0.8, 0.2, 1] 
              }}
              className="relative flex flex-col items-center gap-4"
            >
              <h1 className="text-4xl md:text-6xl font-black tracking-[-0.05em] text-white text-ai-extreme text-center">
                {statuses[statusIdx]}
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="text-white/30 text-xs font-black uppercase tracking-[0.6em] text-center"
              >
                BHIE / APPLE INTELLIGENCE
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Apple-style minimalist loading bar */}
          <div className="w-[300px] h-[1px] bg-white/5 rounded-full overflow-hidden mx-auto">
            <motion.div 
              className="h-full bg-white/30"
              initial={{ width: '0%', x: '-100%' }}
              animate={{ width: '100%', x: '0%' }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Apple-style Micro-detail */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="mt-16 flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 group-hover:text-white/40 transition-colors">
            Secure financial engine active
          </span>
        </motion.div>

      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[14vw] font-black text-white/[0.01] select-none pointer-events-none tracking-tighter mix-blend-overlay">
        BHIE ECOSYSTEM
      </div>
    </div>
  );
};

export default LoadingScreen;

