import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const OrbitingPearls = ({ active }: { active: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pearlsCount = 12;
  const radius = 2.8;

  useFrame((state) => {
    if (groupRef.current) {
      // High-end cinematic rotation
      const speed = active ? 0.08 : 0.02;
      groupRef.current.rotation.y += speed;
      // Slight tilt for depth
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.1) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: pearlsCount }).map((_, i) => {
        const angle = (i / pearlsCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // Wavy orbit path
        const y = Math.sin(angle * 3) * 0.8;

        return (
          <mesh key={i} position={[x, y, z]} castShadow>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshStandardMaterial 
              color="#f8f9fa" 
              metalness={1} 
              roughness={0.05}
              envMapIntensity={3} 
            />
          </mesh>
        );
      })}
    </group>
  );
};

const CoreSphere = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulse effect based on active state (listening vs idle)
      const targetScale = active 
        ? 1.15 + Math.sin(state.clock.elapsedTime * 12) * 0.03 
        : 1.0 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
      
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.003;
    }
  });

  return (
    <Float speed={active ? 3 : 1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        {/* Apple-like Glass/Prismatic material */}
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={1.5}
          chromaticAberration={0.8}
          anisotropy={0.2}
          distortion={active ? 0.6 : 0.2}
          distortionScale={0.4}
          temporalDistortion={active ? 0.2 : 0.05}
          color="#ffffff"
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
};

interface VoiceAssistant3DProps {
  isSpeaking?: boolean;
  isListening?: boolean;
}

export const VoiceAssistant3D: React.FC<VoiceAssistant3DProps> = ({ 
  isSpeaking = false, 
  isListening = false 
}) => {
  const active = isSpeaking || isListening;
  
  return (
    <div className="w-full h-full relative pointer-events-none drop-shadow-2xl">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        {/* Subtle premium accent lighting */}
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#4d7cff" />
        <pointLight position={[10, -10, -5]} intensity={1.5} color="#ff3366" />
        
        <Environment preset="city" />
        
        <CoreSphere active={active} />
        <OrbitingPearls active={active} />
      </Canvas>
    </div>
  );
};

export default VoiceAssistant3D;
