"use client"
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment, 
  PerspectiveCamera,
  Stars,
  Sparkles
} from '@react-three/drei';
import { Bloom, EffectComposer, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

const VideoScene = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15; // Slower, smoother
      meshRef.current.rotation.z = Math.sin(t * 0.1) * 0.2;
      meshRef.current.position.y = Math.sin(t * 0.3) * 0.05;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -t * 0.2;
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ffffff" />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={coreRef}>
          {/* Main Cinematic Orb - Reduced segments for performance */}
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.8, 48, 48]} />
            <MeshTransmissionMaterial
              backside
              samples={6} // Reduced samples
              thickness={1.2}
              anisotropicBlur={0.1}
              chromaticAberration={0.03}
              distortion={0.2}
              temporalDistortion={0.05}
              transmission={1}
              roughness={0.1}
              ior={1.1}
              color="#ffffff"
            />
          </mesh>
          
          {/* Internal Energy Core */}
          <mesh>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshStandardMaterial 
              emissive="#ffffff" 
              emissiveIntensity={1.5} 
              toneMapped={false} 
            />
          </mesh>
        </group>
      </Float>

      <Sparkles count={30} scale={10} size={1.5} speed={0.3} opacity={0.2} color="#fff" />
      {/* Stars are heavy, reduced count */}
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
      
      <Environment preset="night" />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom 
          intensity={0.8} 
          luminanceThreshold={0.85} 
          luminanceSmoothing={0.2} 
          mipmapBlur
        />
        <Noise opacity={0.015} />
      </EffectComposer>
    </>
  );
};

const DemoVideoHero = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden ring-0 outline-none">
      <Canvas 
        shadows={false} // Disable shadows for background hero
        dpr={window.devicePixelRatio > 1.5 ? [1, 1.5] : [1, 1]} // Lower DPR limit
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <VideoScene />
      </Canvas>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>
    </div>
  );
};

export default DemoVideoHero;
