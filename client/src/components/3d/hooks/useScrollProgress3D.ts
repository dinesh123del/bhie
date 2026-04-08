import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ScrollProgress {
  progress: number;
  velocity: number;
  direction: 'up' | 'down';
}

export function useScrollProgress3D(): ScrollProgress {
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    progress: 0,
    velocity: 0,
    direction: 'down',
  });

  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(currentScrollY / maxScroll, 1);
      
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTime.current;
      const scrollDelta = currentScrollY - lastScrollY.current;
      const velocity = timeDelta > 0 ? Math.abs(scrollDelta / timeDelta) : 0;
      
      const direction = scrollDelta > 0 ? 'down' : 'up';

      setScrollProgress({
        progress,
        velocity: Math.min(velocity, 5),
        direction,
      });

      lastScrollY.current = currentScrollY;
      lastTime.current = currentTime;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
}

export function useScrollCamera(ref: React.RefObject<THREE.Camera>, range: number = 5) {
  const scrollProgress = useScrollProgress3D();

  useFrame(() => {
    if (ref.current) {
      const z = 10 - scrollProgress.progress * range;
      ref.current.position.z += (z - ref.current.position.z) * 0.05;
    }
  });
}

export function useScrollParallax(ref: React.RefObject<THREE.Object3D>, intensity: number = 1) {
  const scrollProgress = useScrollProgress3D();
  const initialY = useRef<number | null>(null);

  useFrame(() => {
    if (ref.current) {
      if (initialY.current === null) {
        initialY.current = ref.current.position.y;
      }
      
      const parallaxOffset = scrollProgress.progress * intensity;
      ref.current.position.y = initialY.current - parallaxOffset;
    }
  });
}
