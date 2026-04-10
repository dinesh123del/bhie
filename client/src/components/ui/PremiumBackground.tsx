import React from 'react';
import { CinematicBackground } from './CinematicBackground';

/**
 * PremiumBackground Component
 * Now acts as the wrapper to enforce the unified Global Cinematic Design System.
 * Injects the hyper-optimized Ambient Particle Background behind all children.
 */
export const PremiumBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A] font-sans text-[#C0C0C0]">
      {/* Layer 1: Unified Global Performance 2D Engine base */}
      <CinematicBackground />

      {/* Layer 2: Subtle noise texture for depth and cinematic hyper-realism */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content Render Context */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default PremiumBackground;
