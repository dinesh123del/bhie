"use client"
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export function useGlowMaterial(
  color: string = '#007AFF',
  intensity: number = 2,
  pulseSpeed: number = 1
) {
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8,
    });
  }, [color]);

  const ref = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.2 + 0.8;
      ref.current.opacity = pulse;
    }
  });

  return { material, ref };
}

export function GlowOrb({
  color = '#007AFF',
  size = 0.5,
  intensity = 2,
  pulseSpeed = 1,
  position = [0, 0, 0],
}: {
  color?: string;
  size?: number;
  intensity?: number;
  pulseSpeed?: number;
  position?: [number, number, number];
}) {
  const { material, ref } = useGlowMaterial(color, intensity, pulseSpeed);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      {/* Core glow */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <primitive object={material} ref={ref} attach="material" />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Point light */}
      <pointLight color={color} intensity={intensity} distance={10} />
    </group>
  );
}

export function GlowRing({
  color = '#007AFF',
  radius = 1,
  tube = 0.02,
  intensity = 1,
  rotationSpeed = 0.5,
  position = [0, 0, 0],
}: {
  color?: string;
  radius?: number;
  tube?: number;
  intensity?: number;
  rotationSpeed?: number;
  position?: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * rotationSpeed;
      ref.current.rotation.y = clock.getElapsedTime() * rotationSpeed * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, tube, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function GlowParticles({
  count = 50,
  color = '#007AFF',
  spread = 5,
}: {
  count?: number;
  color?: string;
  spread?: number;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
      ] as [number, number, number],
      size: Math.random() * 0.1 + 0.02,
      speed: Math.random() * 0.5 + 0.2,
    }));
  }, [count, spread]);

  return (
    <>
      {particles.map((particle, i) => (
        <GlowOrb
          key={i}
          color={color}
          size={particle.size}
          intensity={1}
          pulseSpeed={particle.speed}
          position={particle.position}
        />
      ))}
    </>
  );
}
