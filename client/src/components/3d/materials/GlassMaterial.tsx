"use client"
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export function useGlassMaterial(
  color: string = '#ffffff',
  opacity: number = 0.3,
  roughness: number = 0.1,
  metalness: number = 0.9
) {
  return useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness,
      roughness,
      transmission: 0.95,
      thickness: 0.5,
      transparent: true,
      opacity,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
  }, [color, opacity, roughness, metalness]);
}

export function GlassCard({
  children,
  color = '#ffffff',
  width = 2,
  height = 1.2,
  depth = 0.05,
  position = [0, 0, 0],
}: {
  children?: React.ReactNode;
  color?: string;
  width?: number;
  height?: number;
  depth?: number;
  position?: [number, number, number];
}) {
  const material = useGlassMaterial(color, 0.2);
  const ref = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={ref} material={material} position={position}>
      <boxGeometry args={[width, height, depth]} />
      {children}
    </mesh>
  );
}

export function GlassSphere({
  color = '#007AFF',
  radius = 0.5,
  position = [0, 0, 0],
}: {
  color?: string;
  radius?: number;
  position?: [number, number, number];
}) {
  const material = useGlassMaterial(color, 0.4, 0.05, 0.95);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={ref} material={material} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
    </mesh>
  );
}
