import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  // Parallax setup
  const mouseX = useMotionValue(window.innerWidth / 2);
  const mouseY = useMotionValue(window.innerHeight / 2);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  const x1 = useTransform(smoothX, [0, window.innerWidth], [-20, 20]);
  const y1 = useTransform(smoothY, [0, window.innerHeight], [-20, 20]);
  
  const x2 = useTransform(smoothX, [0, window.innerWidth], [30, -30]);
  const y2 = useTransform(smoothY, [0, window.innerHeight], [30, -30]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simulate progress
  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0D14] flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Ambient Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div 
          className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[80px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating Cards (Parallax) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden max-w-[1400px] mx-auto hidden lg:block">
        <motion.div style={{ x: x1, y: y1 }} className="absolute top-[25%] left-[15%] p-5 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/5 w-56 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex gap-3 mb-4">
            <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">⚛️</div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 w-full bg-white/10 rounded-full" />
              <div className="h-2 w-3/4 bg-white/10 rounded-full" />
            </div>
          </div>
          <div className="h-16 w-full bg-blue-500/10 rounded-xl" />
        </motion.div>
        
        <motion.div style={{ x: x2, y: y2 }} className="absolute bottom-[25%] right-[15%] p-5 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/5 w-56 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="text-white/60 text-xs mb-3 font-medium">Network Latency</div>
          <div className="flex gap-2 items-end h-20 w-full">
            {[40, 70, 45, 90, 60, 85].map((h, i) => (
              <motion.div 
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-500/50 to-purple-400 rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Anti-gravity Core */}
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        <motion.div className="absolute inset-0 rounded-full border border-white/5 border-t-white/10" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute inset-4 rounded-full border border-blue-500/10 border-b-blue-400/50" animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute inset-8 rounded-full border border-purple-500/10 border-l-purple-400/50" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />

        {/* Central glowing orb */}
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-[0_0_50px_rgba(59,130,246,0.6)]"
          animate={{ y: [-10, 10, -10], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute right-1/2 top-1/2 w-1.5 h-1.5 bg-white/70 rounded-full blur-[0.5px]"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ 
              x: Math.cos(i * 30 * Math.PI / 180) * (70 + Math.random() * 60),
              y: Math.sin(i * 30 * Math.PI / 180) * (70 + Math.random() * 60),
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Progress Section */}
      <motion.div 
        className="mt-16 flex flex-col items-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-white/60 font-medium tracking-[0.2em] uppercase text-xs mb-4 flex items-center gap-3">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-blue-400">●</motion.span>
          Synchronizing Ecosystem
        </div>
        
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm relative">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
