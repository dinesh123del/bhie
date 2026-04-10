import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CinematicOrbProps {
  size?: number;
  phase?: 'loading' | 'ready';
}

const CinematicOrb = ({ size = 280, phase = 'loading' }: CinematicOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);
  const stateRef = useRef({ scale: 0.1, opacity: 0, rotationSpeed: 0.003, pulsePhase: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;

    // Animate scale+opacity in
    gsap.to(stateRef.current, {
      scale: 1,
      opacity: 1,
      duration: 1.8,
      ease: 'expo.out',
    });

    const draw = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      const { scale, opacity, pulsePhase } = stateRef.current;
      stateRef.current.pulsePhase += 0.02;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      const pulse = 1 + Math.sin(pulsePhase) * 0.04;
      const effectiveR = r * pulse;

      // ── Outer aurora rings ──────────────────────────────────
      for (let ring = 3; ring >= 1; ring--) {
        const ringR = effectiveR * (1 + ring * 0.28);
        const ringAlpha = (0.06 - ring * 0.015) * (1 + Math.sin(t + ring) * 0.3);
        const hue = 220 + ring * 25 + Math.sin(t * 0.5) * 20;
        const grad = ctx.createRadialGradient(cx, cy, ringR * 0.7, cx, cy, ringR);
        grad.addColorStop(0, `hsla(${hue}, 90%, 65%, 0)`);
        grad.addColorStop(0.6, `hsla(${hue}, 90%, 65%, ${ringAlpha})`);
        grad.addColorStop(1, `hsla(${hue}, 90%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Orb core — deep glass sphere ────────────────────────
      const coreGrad = ctx.createRadialGradient(
        cx - effectiveR * 0.3, cy - effectiveR * 0.3, 0,
        cx, cy, effectiveR
      );
      coreGrad.addColorStop(0, `hsla(220, 60%, 90%, 0.25)`);
      coreGrad.addColorStop(0.3, `hsla(230, 70%, 50%, 0.18)`);
      coreGrad.addColorStop(0.65, `hsla(250, 80%, 30%, 0.4)`);
      coreGrad.addColorStop(1, `hsla(260, 90%, 15%, 0.7)`);
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ── Neon rim light (right side) ──────────────────────────
      const rimGrad = ctx.createLinearGradient(cx - effectiveR, cy, cx + effectiveR, cy);
      rimGrad.addColorStop(0, 'transparent');
      rimGrad.addColorStop(0.7, 'transparent');
      rimGrad.addColorStop(0.85, `hsla(260, 100%, 65%, 0.6)`);
      rimGrad.addColorStop(1, `hsla(280, 100%, 70%, 0.3)`);
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveR, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // ── Blue rim (left side) ────────────────────────────────
      const blueRim = ctx.createLinearGradient(cx + effectiveR, cy, cx - effectiveR, cy);
      blueRim.addColorStop(0, 'transparent');
      blueRim.addColorStop(0.75, 'transparent');
      blueRim.addColorStop(0.9, `hsla(210, 100%, 65%, 0.45)`);
      blueRim.addColorStop(1, `hsla(200, 90%, 70%, 0.2)`);
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveR, 0, Math.PI * 2);
      ctx.fillStyle = blueRim;
      ctx.fill();

      // ── Glass specular highlight ─────────────────────────────
      const specGrad = ctx.createRadialGradient(
        cx - effectiveR * 0.35, cy - effectiveR * 0.4, 0,
        cx - effectiveR * 0.2, cy - effectiveR * 0.25, effectiveR * 0.5
      );
      specGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
      specGrad.addColorStop(0.4, 'rgba(255,255,255,0.12)');
      specGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveR, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();

      // ── Rotating orbit lines ─────────────────────────────────
      for (let orbit = 0; orbit < 3; orbit++) {
        const angle = t * (0.4 + orbit * 0.2) + (orbit * Math.PI * 2) / 3;
        const orbitR = effectiveR * (0.75 + orbit * 0.15);
        const spread = Math.PI * 0.35;
        const orbitHue = 210 + orbit * 40;

        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, angle - spread, angle + spread);
        ctx.strokeStyle = `hsla(${orbitHue}, 90%, 65%, ${0.5 - orbit * 0.1})`;
        ctx.lineWidth = 1 + (1 - orbit * 0.2);
        ctx.stroke();

        // Node dot at orbit tip
        const dotX = cx + Math.cos(angle + spread) * orbitR;
        const dotY = cy + Math.sin(angle + spread) * orbitR;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${orbitHue}, 100%, 80%, 0.9)`;
        ctx.fill();

        // Glow at node
        const nodeGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 12);
        nodeGlow.addColorStop(0, `hsla(${orbitHue}, 100%, 70%, 0.5)`);
        nodeGlow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
        ctx.fillStyle = nodeGlow;
        ctx.fill();
      }

      // ── Inner energy core ────────────────────────────────────
      const coreSize = effectiveR * (0.18 + Math.sin(t * 2) * 0.04);
      const innerCore = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      innerCore.addColorStop(0, 'rgba(255,255,255,0.9)');
      innerCore.addColorStop(0.4, `hsla(220, 100%, 75%, 0.6)`);
      innerCore.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = innerCore;
      ctx.fill();

      // ── Outer sphere stroke ──────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveR, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(230, 80%, 70%, ${0.25 + Math.sin(t) * 0.1})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [size]);

  // Phase change: when ready, speed up then settle
  useEffect(() => {
    if (phase === 'ready') {
      gsap.to(stateRef.current, {
        rotationSpeed: 0.008,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="pointer-events-none"
    />
  );
};

export default CinematicOrb;
