import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
    const particleCount = 350;
    const colors = ['#38bdf8', '#818cf8', '#a855f7', '#fb923c', '#f43f5e', '#ffffff'];

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
      speedY: number;
      speedX: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || 1920);
        this.y = Math.random() * (canvas?.height || 1080);
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2.2 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.density = Math.random() * 20 + 1;
        this.opacity = Math.random() * 0.7 + 0.1;
        this.twinkle = (Math.random() * 0.015) + 0.005;
        this.speedY = (Math.random() * -0.4) - 0.1; // Slow upward drift
        this.speedX = (Math.random() * 0.2) - 0.1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        // Anti-gravity Twinkle
        this.opacity += this.twinkle;
        if (this.opacity > 0.9 || this.opacity < 0.1) this.twinkle = -this.twinkle;
        
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        
        if (this.color === '#ffffff') {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ffffff';
        }
      }

      update() {
        // Constant drift
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.y < -10) {
          this.y = (canvas?.height || 1080) + 10;
          this.x = Math.random() * (canvas?.width || 1920);
        }

        // Proximity interaction (Hover feel)
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 180;
        
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const directionX = (dx / distance) * force * this.density * 0.3;
          const directionY = (dy / distance) * force * this.density * 0.3;

          if (mouseRef.current.active) {
             // Push on click/touch
             this.x -= directionX * 5;
             this.y -= directionY * 5;
          } else {
             // Gentle pull on hover
             this.x += directionX;
             this.y += directionY;
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
      
      // Triple layering for depth
      // 1. Pixel Stars (very small, many)
      for (let i = 0; i < 280; i++) {
        const p = new Particle();
        p.size = Math.random() * 0.8 + 0.1;
        p.twinkle *= 1.2;
        particles.push(p);
      }
      // 2. Main Glitter
      for (let i = 0; i < 150; i++) {
        const p = new Particle();
        p.size = Math.random() * 1.5 + 0.8;
        particles.push(p);
      }
      // 3. Bokeh Foreground (large, blurry)
      for (let i = 0; i < 25; i++) {
        const p = new Particle();
        p.size = Math.random() * 4 + 2;
        p.opacity = 0.15;
        p.twinkle *= 0.5;
        particles.push(p);
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
        <motion.div 
          className="absolute -left-[5%] -top-[5%] h-[70%] w-[70%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" 
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            filter: ["blur(120px) hue-rotate(0deg)", "blur(120px) hue-rotate(45deg)", "blur(120px) hue-rotate(0deg)"]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -right-[5%] bottom-[10%] h-[60%] w-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            filter: ["blur(120px) hue-rotate(0deg)", "blur(120px) hue-rotate(-45deg)", "blur(120px) hue-rotate(0deg)"]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
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
