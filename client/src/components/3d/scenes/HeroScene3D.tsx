import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleField3D } from '../objects/ParticleField';
import { FloatingBusinessCards } from '../objects/FloatingBusinessCards';
import { GradientBackground } from '../materials';
import { usePerformanceCheck } from '../hooks';

interface HeroScene3DProps {
  showParticles?: boolean;
  showCards?: boolean;
  showStars?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
}

// Star field component
function StarField() {
  return (
    <Stars
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}

// Lighting setup
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#007AFF" />
      <pointLight position={[10, -10, -5]} intensity={0.3} color="#AF52DE" />
    </>
  );
}

// Camera controller
function CameraController() {
  // Camera will follow mouse slightly for parallax effect
  // Implemented in individual components
  return null;
}

export function HeroScene3D({
  showParticles = true,
  showCards = true,
  showStars = true,
  intensity = 'medium',
  children,
}: HeroScene3DProps) {
  const { shouldEnable3D, deviceTier } = usePerformanceCheck();

  // Determine settings based on performance
  const particleCount = deviceTier === 'high' ? 1500 : deviceTier === 'medium' ? 800 : 0;
  const enableCards = deviceTier !== 'low';

  if (!shouldEnable3D) {
    // Fallback to 2D gradient background
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
        {children}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{
            position: [0, 0, 10],
            fov: 60,
            near: 0.1,
            far: 1000,
          }}
          dpr={[1, deviceTier === 'high' ? 2 : 1]}
          performance={{ min: deviceTier === 'high' ? 0.5 : 0.3 }}
          gl={{
            antialias: deviceTier === 'high',
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
          
          <Suspense fallback={null}>
            {/* Gradient background sphere */}
            <GradientBackground
              color1="#007AFF"
              color2="#5856D6"
              color3="#000000"
            />
            
            {/* Star field */}
            {showStars && <StarField />}
            
            {/* Lighting */}
            <SceneLighting />
            
            {/* Particles */}
            {showParticles && particleCount > 0 && (
              <ParticleField3D
                count={particleCount}
                color="#007AFF"
                showIcons={deviceTier === 'high'}
              />
            )}
            
            {/* Business cards */}
            {showCards && enableCards && <FloatingBusinessCards autoGenerate />}
          </Suspense>
          
          {/* Fog for depth perception */}
          <fog
            attach="fog"
            args={['#000000', 10, 30]}
          />
        </Canvas>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

// Simplified version for mobile/lower performance
export function HeroScene3DLight({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-purple-900/30 animate-gradient" />
      
      {/* Floating orbs (CSS-based) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

export default HeroScene3D;
