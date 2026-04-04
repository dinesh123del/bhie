import React, { useEffect, useRef } from 'react';

/**
 * PremiumBackground Component
 * High-performance Canvas-based particle system with mouse interaction.
 * Mimics "Antigravity" glittering particles and ambient gradients.
 */
export const PremiumBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 180;
    const colors = ['#38bdf8', '#818cf8', '#a855f7', '#fb923c', '#f43f5e'];

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      color: string;
      density: number;
      opacity: number;
      twinkle: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || 1920);
        this.y = Math.random() * (canvas?.height || 1080);
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.density = Math.random() * 30 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.twinkle = Math.random() * 0.1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Twinkle effect
        this.opacity += this.twinkle;
        if (this.opacity > 0.8 || this.opacity < 0.2) this.twinkle = -this.twinkle;
        
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        
        // Dynamic glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
      }

      update() {
        // Interaction logic
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 150 && mouseRef.current.active) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const maxDistance = 150;
          const force = (maxDistance - distance) / maxDistance;
          
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;

          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            const dxBack = this.x - this.baseX;
            this.x -= dxBack / 20;
          }
          if (this.y !== this.baseY) {
            const dyBack = this.y - this.baseY;
            this.y -= dyBack / 20;
          }
        }
      }
    }

    const init = () => {
      particles = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    
    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] font-sans text-white">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 h-full w-full pointer-events-none"
        style={{ filter: 'blur(0.5px)' }}
      />

      {/* Ambient Gradients - Multi-color Antigravity Feel */}
      <div className="fixed inset-0 z-0">
        <div className="absolute -left-[5%] -top-[5%] h-[70%] w-[70%] rounded-full bg-sky-500/5 blur-[120px] animate-pulse" />
        <div className="absolute -right-[5%] bottom-[10%] h-[60%] w-[60%] rounded-full bg-orange-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute left-[30%] top-[40%] h-[40%] w-[40%] rounded-full bg-purple-500/3 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Extreme Noise Texture Overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PremiumBackground;
