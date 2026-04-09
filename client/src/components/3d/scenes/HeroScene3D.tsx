import React from 'react';

interface HeroScene3DProps {
  showParticles?: boolean;
  showCards?: boolean;
  showStars?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
}

// CSS-only background — no Three.js, no Canvas, no R3F
export function HeroScene3D({ children }: HeroScene3DProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508]">
      {/* ── Cinematic Background Asset (Dimmmed) ────────────────────── */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40"
        style={{ backgroundImage: 'url(/cinematic-bg.png)', filter: 'blur(2px) saturate(1.2)' }}
      />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-transparent to-transparent opacity-40" />

      {/* Blue glow blob top-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 900, height: 600, left: '-10%', top: '-5%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,122,255,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />

      {/* Purple glow blob bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 700, height: 500, right: '-5%', bottom: '10%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(88,86,214,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 11s ease-in-out infinite 2s',
        }}
      />

      {/* Subtle star dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 8%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 15%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 35%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 65%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 75%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 10% 85%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 45%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 95% 55%, rgba(255,255,255,0.25) 0%, transparent 100%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,122,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,122,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

// Light variant — same but simpler
export function HeroScene3DLight({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export default HeroScene3D;
