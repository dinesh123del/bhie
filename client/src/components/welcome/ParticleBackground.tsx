"use client"
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
  type: 'dot' | 'star' | 'ring';
}

interface ParticleBackgroundProps {
  count?: number;
  speed?: number;
  interactive?: boolean;
  className?: string;
}

const ParticleBackground = ({
  count = 80,
  speed = 0.4,
  interactive = true,
  className = '',
}: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const makeParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed * 0.6 - 0.1,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      life: Math.random() * 300,
      maxLife: 300 + Math.random() * 400,
      hue: 220 + Math.random() * 60, // blue → purple
      type: Math.random() < 0.7 ? 'dot' : Math.random() < 0.5 ? 'star' : 'ring',
    });

    const initParticles = () => {
      const w = canvas.width;
      const h = canvas.height;
      particlesRef.current = Array.from({ length: count }, () => makeParticle(w, h));
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      const spikes = 4;
      const step = Math.PI / spikes;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? r : r * 0.4;
        ctx.lineTo(x + Math.cos(i * step) * radius, y + Math.sin(i * step) * radius);
      }
      ctx.closePath();
      ctx.fill();
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Subtle trail effect — semi-transparent clear
      ctx.fillStyle = 'rgba(5, 5, 12, 0.15)';
      ctx.fillRect(0, 0, w, h);

      particlesRef.current.forEach((p, i) => {
        // Mouse repulsion
        if (interactive) {
          const dx = mouse.current.x - p.x;
          const dy = mouse.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.vx -= (dx / dist) * force * 0.6;
            p.vy -= (dy / dist) * force * 0.6;
          }
        }

        // Velocity damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        // Lifecycle opacity
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.1
          ? (lifeRatio / 0.1) * p.opacity
          : lifeRatio > 0.9
          ? ((1 - lifeRatio) / 0.1) * p.opacity
          : p.opacity;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Reset if dead
        if (p.life > p.maxLife) {
          particlesRef.current[i] = makeParticle(w, h);
          particlesRef.current[i].life = 0;
          return;
        }

        const color = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        if (p.type === 'dot') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          grad.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${alpha * 0.4})`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.fillStyle = color;
          drawStar(ctx, p.x, p.y, p.size * 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Draw connection lines
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const q = particlesRef.current[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(${(p.hue + q.hue) / 2}, 70%, 60%, ${(1 - dist / 100) * 0.12 * alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    resize();
    initParticles();
    render();

    const handleResize = () => {
      resize();
      initParticles();
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [count, speed, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
    />
  );
};

export default ParticleBackground;
