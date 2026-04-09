import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment, 
  Text, 
  PerspectiveCamera,
  ScrollControls,
  Scroll,
  useScroll,
  Stars,
  Sparkles
} from '@react-three/drei';
import { Bloom, EffectComposer, Noise, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const VideoScene = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.002;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y -= 0.01;
    }
  });

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={coreRef}>
          {/* Main 8k Cinematic Orb Simulation */}
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.5, 64, 64]} />
            <MeshTransmissionMaterial
              backside
              samples={16}
              thickness={2}
              anisotropicBlur={0.2}
              chromaticAberration={0.1}
              distortion={0.5}
              temporalDistortion={0.1}
              transmission={1}
              roughness={0}
              ior={1.5}
              color="#ffffff"
            />
          </mesh>
          
          {/* Internal Energy Core */}
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              emissive="#4f46e5" 
              emissiveIntensity={10} 
              toneMapped={false} 
            />
          </mesh>
        </group>
      </Float>

      <Sparkles count={100} scale={10} size={1} speed={0.2} opacity={0.2} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Environment preset="city" />

      {/* Post-Processing for 8k Film Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          intensity={1.5} 
          luminanceThreshold={0.9} 
          luminanceSmoothing={0.025} 
        />
        <Noise opacity={0.02} />
        <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
      </EffectComposer>
    </>
  );
};

const DemoVideoHero = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <VideoScene />
      </Canvas>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Scanned Line Effect for "Video" feel */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
    </div>
  );
};

export default DemoVideoHero;
