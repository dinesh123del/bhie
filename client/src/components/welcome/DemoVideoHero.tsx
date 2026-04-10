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
      // Fluid, visible rotation and wobble
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.3;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.1;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -t * 0.5;
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={3} />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#ffffff" />

      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <group ref={coreRef}>
          {/* Main Cinematic Orb */}
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.8, 64, 64]} />
            <MeshTransmissionMaterial
              backside
              samples={12}
              thickness={1.5}
              anisotropicBlur={0.2}
              chromaticAberration={0.05}
              distortion={0.3}
              temporalDistortion={0.1}
              transmission={1}
              roughness={0.05}
              ior={1.2}
              color="#ffffff"
            />
          </mesh>
          
          {/* Internal Energy Core */}
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              emissive="#ffffff" 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </mesh>
        </group>
      </Float>

      <Sparkles count={40} scale={12} size={2} speed={0.4} opacity={0.3} color="#fff" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />
      
      <Environment preset="studio" />

      <EffectComposer multisampling={0}>
        <Bloom 
          intensity={1.0} 
          luminanceThreshold={0.9} 
          luminanceSmoothing={0.1} 
        />
        <Noise opacity={0.01} />
      </EffectComposer>
    </>
  );
};

const DemoVideoHero = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <VideoScene />
      </Canvas>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>
    </div>
  );
};

export default DemoVideoHero;
