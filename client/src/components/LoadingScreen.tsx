import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RealityEngine, 
  SecurityEngine, 
  NeuralSyncEngine, 
  Scanlines, 
  GlassShine,
  ThermalEngine
} from './ui/MicroEngines';
import { ShieldCheck, Cpu, Zap, Network } from 'lucide-react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const statuses = [
    "Initializing Neural Core",
    "Syncing Financial Nodes",
    "Calibrating Reality Engine",
    "Securing Data Pipelines",
    "Optimizing User Insight",
    "Finalizing Ecosystem"
  ];

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = 0.05; // Very subtle Apple feel
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 2;
        return prev + step;
      });
    }, 400);

    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. CINEMATIC VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={false}
          playsInline
          className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-person-writing-on-a-notebook-41974-preview.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black pointer-events-none" />
        <div className="absolute inset-0 backdrop-blur-[20px] bg-black/20" />
      </div>

      {/* 2. GLOBAL OVERLAYS */}
      <Scanlines />
      <GlassShine />

      {/* 3. MICRO ENGINE GRID (Decentralized Nodes) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
         <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-10 left-10 md:top-20 md:left-20"
         >
            <RealityEngine />
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="absolute top-10 right-10 md:top-20 md:right-20"
         >
            <SecurityEngine />
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="absolute bottom-10 left-10 md:bottom-20 md:left-20"
         >
            <NeuralSyncEngine />
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="absolute bottom-10 right-10 md:bottom-20 md:right-20"
         >
            <ThermalEngine />
         </motion.div>
      </div>

      {/* 4. CENTRAL LOADING HUB */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Anti-gravity Core Animation */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-12">
           <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/5 border-t-sky-500/20 shadow-[0_0_50px_rgba(14,165,233,0.05)]" 
           />
           <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-white/5 border-b-purple-500/20" 
           />
           
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl"
           >
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-transparent to-purple-500/10" />
              <Zap className="w-10 h-10 text-white animate-pulse" fill="white" />
              
              {/* Internal spinning ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-2xl border border-dashed border-white/10"
              />
           </motion.div>
        </div>

        {/* Status Text & Progress */}
        <div className="flex flex-col items-center gap-6">
           <div className="flex flex-col items-center gap-1">
              <AnimatePresence mode="wait">
                 <motion.p 
                    key={statusIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40"
                 >
                    {statuses[statusIndex]}
                 </motion.p>
              </AnimatePresence>
              <p className="text-[10px] font-bold text-sky-400/60 tracking-widest">{progress}% COMPLETED</p>
           </div>

           {/* Sleek Apple Progress Bar */}
           <div className="w-64 h-0.5 bg-white/5 rounded-full overflow-hidden relative backdrop-blur-xl border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 via-white to-purple-500 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              />
           </div>
        </div>

        {/* Detail Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">System Operational</span>
        </motion.div>

      </div>

      {/* Background Decorative Text */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[12vw] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter">
        BHIE CLOUD
      </div>
    </div>
  );
};

export default LoadingScreen;
