import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function CoreVisualizer({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotate the core
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    
    // Pulse scale based on active state
    const targetScale = isActive ? 1.2 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1}>
      <MeshDistortMaterial
        color="#00f3ff"
        attach="material"
        distort={isActive ? 0.6 : 0.3}
        speed={isActive ? 4 : 2}
        roughness={0.2}
        metalness={0.8}
        emissive="#00f3ff"
        emissiveIntensity={isActive ? 0.8 : 0.2}
      />
    </Sphere>
  );
}
