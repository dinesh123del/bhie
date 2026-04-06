import React from 'react';
import { motion } from 'framer-motion';

/**
 * PremiumBackground Component
 * Pure CSS ambient gradient background — no canvas, no flickering, no particles.
 * Smooth, calming, and performant on all devices.
 */
export const PremiumBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans text-white">

      {/* Layer 1: Deep base gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617]" />

      {/* Layer 2: Removed Slow-moving ambient blobs to keep a solid premium background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" />

      {/* Layer 3: Subtle noise texture for depth */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PremiumBackground;
