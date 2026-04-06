import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SparkBackground from './ui/SparkBackground';
import InteractiveGlobe from './ui/InteractiveGlobe';
import { Scanlines, GlassShine } from './ui/MicroEngines';

const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const statuses = [
    "Welcome to Finly.",
    "Loading your data.",
    "Setting things up.",
    "Almost ready."
  ];

  useEffect(() => {

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
              
              {/* Premium 8k Level Animated App Logo */}
              <motion.img 
                 src="/icon.png" 
                 alt="Finly Ecosystem" 
                 className="w-16 h-16 object-contain relative z-10"
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 onError={(e) => {
                     // Fallback to logo-mark if icon.png fails
                     (e.target as HTMLImageElement).src = '/logo-mark.png';
                 }}
              />
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
                className="text-indigo-400/80 text-xs font-black uppercase tracking-[0.4em] text-center"
              >
                LOADING FINLY
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
        FINLY
      </div>
    </div>
  );
};

export default LoadingScreen;

