import React from 'react';

interface HeroScene3DProps {
  showParticles?: boolean;
  showCards?: boolean;
  showStars?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
}

// High-performance CSS-only background — No Canvas overhead
export function HeroScene3D({ children }: HeroScene3DProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020203]">
      {/* Cinematic Pulse Glows */}
      <div
        className="absolute pointer-events-none opacity-20"
        style={{
          width: '100vw', height: '100vh',
          background: 'radial-gradient(circle at 20% 30%, rgba(79,70,229,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(124,58,237,0.1) 0%, transparent 50%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Static Star Field (Cheap performance-wise) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 10%, #fff 100%, transparent),
            radial-gradient(1px 1px at 20% 40%, #fff 100%, transparent),
            radial-gradient(1px 1px at 50% 20%, #fff 100%, transparent),
            radial-gradient(1.5px 1.5px at 80% 30%, #fff 100%, transparent),
            radial-gradient(1px 1px at 90% 80%, #fff 100%, transparent),
            radial-gradient(1px 1px at 40% 90%, #fff 100%, transparent),
            radial-gradient(1.5px 1.5px at 70% 60%, #fff 100%, transparent)
          `,
          backgroundSize: '400px 400px',
        }}
      />

      {/* Subtle Grid - Use transform for potential GPU optimization if needed, but here simple background is fine */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10">
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
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00D4FF]/20 text-[#00D4FF]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export default HeroScene3D;
