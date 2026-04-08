import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  fps: number;
  quality: 'high' | 'medium' | 'low';
  shouldEnable3D: boolean;
  deviceTier: 'high' | 'medium' | 'low';
}

export function usePerformanceCheck(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    quality: 'high',
    shouldEnable3D: true,
    deviceTier: 'high',
  });

  useEffect(() => {
    const checkPerformance = () => {
      // Check device memory
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;
      
      // Check if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const hasWebGL = !!gl;

      // Determine device tier
      let deviceTier: 'high' | 'medium' | 'low' = 'high';
      
      if (!hasWebGL || (isMobile && (!memory || memory < 4))) {
        deviceTier = 'low';
      } else if (isMobile || (memory && memory < 8) || (cores && cores < 4)) {
        deviceTier = 'medium';
      }

      // Set quality and 3D enablement
      const shouldEnable3D = hasWebGL && deviceTier !== 'low';
      const quality = deviceTier === 'high' ? 'high' : deviceTier === 'medium' ? 'medium' : 'low';

      setMetrics({
        fps: deviceTier === 'high' ? 60 : deviceTier === 'medium' ? 30 : 0,
        quality,
        shouldEnable3D,
        deviceTier,
      });
    };

    checkPerformance();
  }, []);

  return metrics;
}

export function useAdaptiveQuality() {
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(Date.now());
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    let animationId: number;
    let frameCounter = 0;
    let lastCheck = Date.now();

    const measureFPS = () => {
      frameCounter++;
      const now = Date.now();
      
      if (now - lastCheck >= 1000) {
        const fps = frameCounter;
        frameCounter = 0;
        lastCheck = now;
        
        setFrameCount(fps);
        
        // Adjust quality based on FPS
        if (fps < 20) {
          setQuality('low');
        } else if (fps < 45) {
          setQuality('medium');
        } else {
          setQuality('high');
        }
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return { frameCount, quality };
}
