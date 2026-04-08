import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { usePerformanceCheck } from './hooks';

interface PageTransition3DProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

// 3D Transition Scene
function TransitionScene() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create transition particles
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 10;
    positions[i3 + 1] = (Math.random() - 0.5) * 10;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <>
      {/* Central portal/core */}
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <meshStandardMaterial
          color="#007AFF"
          metalness={0.9}
          roughness={0.1}
          emissive="#007AFF"
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#007AFF"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#007AFF"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Outer rings */}
      <group ref={groupRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#007AFF" transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#AF52DE" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} color="#007AFF" intensity={2} />
      <pointLight position={[5, 5, 5]} color="#AF52DE" intensity={0.5} />
    </>
  );
}

// 2D Fallback for low-performance devices
function TransitionFallback({ loadingText }: { loadingText?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
      />
      {loadingText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-blue-400 text-sm"
        >
          {loadingText}
        </motion.p>
      )}
    </div>
  );
}

export function PageTransition3D({
  children,
  isLoading = false,
  loadingText = "Loading your business insights...",
}: PageTransition3DProps) {
  const { shouldEnable3D, deviceTier } = usePerformanceCheck();

  // Use 2D fallback for low-performance devices
  if (!shouldEnable3D || deviceTier === 'low') {
    return (
      <>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <TransitionFallback loadingText={loadingText} />
            </motion.div>
          )}
        </AnimatePresence>
        {children}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#0A0A0B]"
          >
            {/* 3D Canvas */}
            <div className="absolute inset-0">
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                dpr={[1, deviceTier === 'high' ? 2 : 1]}
                gl={{ antialias: deviceTier === 'high', alpha: true }}
              >
                <TransitionScene />
              </Canvas>
            </div>

            {/* Loading Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 mx-auto"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-blue-400/30 border-t-blue-400"
                  />
                </motion.div>
                <p className="text-blue-400 text-lg font-medium">{loadingText}</p>
                <p className="text-gray-500 text-sm mt-2">Preparing your 3D experience</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}

// Hook to use page transitions
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = (duration: number = 1500) => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), duration);
  };

  return { isTransitioning, startTransition };
}

export default PageTransition3D;
