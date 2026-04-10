"use client"
import React, { Suspense, useRef, lazy } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformanceCheck, useMouseInfluence } from '../hooks';
import { GradientBackground } from '../materials';

// Lazy load 3D components for code splitting
const RevenueFlow3D = lazy(() => import('../objects/RevenueFlow').then(m => ({ default: m.RevenueFlow3D })));
const GrowthTree3D = lazy(() => import('../objects/GrowthTree').then(m => ({ default: m.GrowthTree3D })));

interface DashboardScene3DProps {
  revenue?: number;
  growth?: number;
  showRevenueFlow?: boolean;
  showGrowthTree?: boolean;
  showBackground?: boolean;
  children?: React.ReactNode;
}

// Floating metric cards in 3D space
function FloatingMetricCard({
  position,
  value,
  label,
  color
}: {
  position: [number, number, number];
  value: string;
  label: string;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useMouseInfluence(meshRef, 0.1);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float
      speed={1}
      rotationIntensity={0.2}
      floatIntensity={0.3}
    >
      <group position={position}>
        {/* Card background */}
        <mesh ref={meshRef}>
          <roundedBoxGeometry args={[2, 1.2, 0.1, 4, 0.05]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Glow edge */}
        <mesh scale={[2.05, 1.25, 0.12]}>
          <roundedBoxGeometry args={[2, 1.2, 0.1, 4, 0.05]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      </group>
    </Float>
  );
}

// Ambient particles for dashboard atmosphere
function AmbientParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#007AFF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Scene lighting
function DashboardLighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-5, 5, 0]} intensity={0.4} color="#007AFF" />
      <pointLight position={[5, -5, 0]} intensity={0.3} color="#AF52DE" />
    </>
  );
}

// Main dashboard scene
function DashboardScene({
  revenue,
  growth,
  showRevenueFlow,
  showGrowthTree,
}: DashboardScene3DProps) {
  return (
    <>
      <DashboardLighting />
      <GradientBackground />

      {/* Revenue flow visualization */}
      {showRevenueFlow && (
        <group position={[-3, 0, -2]}>
          <RevenueFlow3D revenue={revenue} growth={growth} particleCount={30} />
        </group>
      )}

      {/* Growth tree */}
      {showGrowthTree && (
        <group position={[3, -1, -2]}>
          <GrowthTree3D growth={growth} />
        </group>
      )}

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Floating metric cards */}
      {revenue && (
        <FloatingMetricCard
          position={[-2, 2, 0]}
          value={`₹${(revenue / 100000).toFixed(1)}L`}
          label="Revenue"
          color="#34C759"
        />
      )}

      {/* Fog for depth */}
      <fog attach="fog" args={['#0A0A0B', 5, 15]} />
    </>
  );
}

// Extend THREE to include roundedBoxGeometry
declare module '@react-three/fiber' {
  interface ThreeElements {
    roundedBoxGeometry: any;
  }
}

export function DashboardScene3D({
  revenue,
  growth = 0,
  showRevenueFlow = true,
  showGrowthTree = true,
  showBackground = true,
  children,
}: DashboardScene3DProps) {
  const { shouldEnable3D, deviceTier } = usePerformanceCheck();

  // Use light version for low-performance devices
  if (!shouldEnable3D || deviceTier === 'low') {
    return (
      <div className="relative">
        {showBackground && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B] via-[#0f0f12] to-[#0A0A0B]">
            <div className="absolute inset-0 bg-[#00D4FF]/20 text-[#00D4FF]/5 blur-[100px]" />
          </div>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px]">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, deviceTier === 'high' ? 2 : 1]}
          gl={{
            antialias: deviceTier === 'high',
            alpha: true,
            powerPreference: 'high-performance'
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
          <Suspense fallback={null}>
            <DashboardScene
              revenue={revenue}
              growth={growth}
              showRevenueFlow={showRevenueFlow}
              showGrowthTree={showGrowthTree}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default DashboardScene3D;
