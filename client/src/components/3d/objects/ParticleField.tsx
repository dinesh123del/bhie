"use client"
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition3D } from '../hooks/useMousePosition3D';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
  mouseInfluence?: number;
}

function ParticleCloud({
  count = 1000,
  color = '#007AFF',
  size = 0.02,
  spread = 10,
  mouseInfluence = 0.5,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mousePosition = useMousePosition3D();
  
  // Generate particle positions
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random position in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * spread;
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      // Random velocity
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [positions, velocities];
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const positionAttribute = pointsRef.current.geometry.attributes.position;
      const array = positionAttribute.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Update positions based on velocity
        array[i3] += velocities[i3];
        array[i3 + 1] += velocities[i3 + 1];
        array[i3 + 2] += velocities[i3 + 2];
        
        // Mouse repulsion
        const dx = array[i3] - mousePosition.normalizedX * spread;
        const dy = array[i3 + 1] - mousePosition.normalizedY * spread;
        const dz = array[i3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 2) {
          const force = (2 - dist) * mouseInfluence * 0.01;
          array[i3] += (dx / dist) * force;
          array[i3 + 1] += (dy / dist) * force;
          array[i3 + 2] += (dz / dist) * force;
        }
        
        // Boundary check - wrap around
        if (Math.abs(array[i3]) > spread) {
          array[i3] *= -0.9;
          velocities[i3] *= -1;
        }
        if (Math.abs(array[i3 + 1]) > spread) {
          array[i3 + 1] *= -0.9;
          velocities[i3 + 1] *= -1;
        }
        if (Math.abs(array[i3 + 2]) > spread) {
          array[i3 + 2] *= -0.9;
          velocities[i3 + 2] *= -1;
        }
      }
      
      positionAttribute.needsUpdate = true;
      
      // Gentle rotation
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

function FloatingIcons({
  count = 20,
  spread = 5,
}: {
  count?: number;
  spread?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const mousePosition = useMousePosition3D();

  // Create floating business-themed icons
  const icons = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
      ] as [number, number, number],
      scale: Math.random() * 0.3 + 0.2,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
      },
      floatSpeed: Math.random() * 0.5 + 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      type: ['cube', 'sphere', 'tetrahedron'][Math.floor(Math.random() * 3)],
      color: ['#007AFF', '#34C759', '#FF9500', '#AF52DE'][Math.floor(Math.random() * 4)],
    }));
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const icon = icons[i];
        
        // Floating animation
        child.position.y = icon.position[1] + Math.sin(clock.getElapsedTime() * icon.floatSpeed + icon.floatOffset) * 0.5;
        
        // Rotation
        child.rotation.x += icon.rotationSpeed.x;
        child.rotation.y += icon.rotationSpeed.y;
        
        // Mouse influence
        const targetX = icon.position[0] + mousePosition.normalizedX * 0.5;
        const targetZ = icon.position[2] + mousePosition.normalizedY * 0.5;
        
        child.position.x += (targetX - child.position.x) * 0.02;
        child.position.z += (targetZ - child.position.z) * 0.02;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {icons.map((icon, i) => (
        <mesh key={i} position={icon.position} scale={icon.scale}>
          {icon.type === 'cube' && <boxGeometry args={[1, 1, 1]} />}
          {icon.type === 'sphere' && <sphereGeometry args={[0.5, 16, 16]} />}
          {icon.type === 'tetrahedron' && <tetrahedronGeometry args={[0.6, 0]} />}
          <meshStandardMaterial
            color={icon.color}
            metalness={0.8}
            roughness={0.2}
            emissive={icon.color}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ParticleField3D({
  count = 1000,
  color = '#007AFF',
  showIcons = true,
}: {
  count?: number;
  color?: string;
  showIcons?: boolean;
}) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color={color} intensity={0.5} />
        
        <ParticleCloud count={count} color={color} />
        {showIcons && <FloatingIcons count={15} />}
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#000000', 5, 15]} />
      </Canvas>
    </div>
  );
}

export default ParticleField3D;
