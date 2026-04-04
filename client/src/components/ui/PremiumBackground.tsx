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
        this.opacity = Math.random() * 0.6 + 0.1;
        this.twinkle = (Math.random() * 0.008) + 0.002; // Slower, softer twinkle
        this.speedY = (Math.random() * -0.2) - 0.05; // Ultra-slow upward drift
        this.speedX = (Math.random() * 0.1) - 0.05;
      }

      draw() {
        if (!ctx) return;
        
        // Anti-gravity Smooth Twinkle - Fast calculation
        this.opacity += this.twinkle;
        if (this.opacity > 0.8 || this.opacity < 0.1) this.twinkle = -this.twinkle;
        
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.size < 0.8) {
          // Pixel Stars optimization: Use fast rects instead of expensive arcs
          ctx.fillRect(this.x, this.y, this.size, this.size);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // CRITICAL PERFORMANCE FIX: Removed shadowBlur. 
        // It's the #1 cause of Canvas lag.
      }

      update() {
        // Constant ultra-slow drift
        this.x += this.speedX;
        this.y += this.speedY;

        // Efficient wrapping
        const w = (canvas?.width || 1920);
        const h = (canvas?.height || 1080);
        
        if (this.y < -20) this.y = h + 20;
        if (this.y > h + 20) this.y = -20;
        if (this.x < -20) this.x = w + 20;
        if (this.x > w + 20) this.x = -20;

        // Proximity interaction (Hover feel) - Lightweight distance check
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        if (Math.abs(dx) < 150 && Math.abs(dy) < 150) {
           const distance = Math.sqrt(dx * dx + dy * dy);
           const maxDistance = 150;
           
           if (distance < maxDistance) {
             const force = (maxDistance - distance) / maxDistance;
             const push = mouseRef.current.active ? 3 : 0.5;
             this.x += (dx / distance) * force * this.density * push;
             this.y += (dy / distance) * force * this.density * push;
           }
        }
      }
    }

    const init = () => {
      particles = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      
      // Target: 109 + 73 + 2003 = 2185
      
      // 1. Optimized Tiny Stars (1500)
      for (let i = 0; i < 1500; i++) {
        const p = new Particle();
        p.size = Math.random() * 0.6 + 0.05;
        p.twinkle *= 0.5;
        p.speedY *= 0.4;
        particles.push(p);
      }
      // 2. High Quality Glitter (500)
      for (let i = 0; i < 500; i++) {
        const p = new Particle();
        p.size = Math.random() * 1.5 + 0.5;
        particles.push(p);
      }
      // 3. Cinematic Bokeh (185)
      for (let i = 0; i < 185; i++) {
        const p = new Particle();
        p.size = Math.random() * 4 + 1;
        p.opacity = 0.1;
        p.twinkle *= 0.3;
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
