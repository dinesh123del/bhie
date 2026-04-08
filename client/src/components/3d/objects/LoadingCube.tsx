import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LoadingCube3DProps {
  size?: number;
  color?: string;
  speed?: number;
}

function DataCube({
  size = 1,
  color = '#007AFF',
  speed = 1,
}: {
  size?: number;
  color?: string;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  
  // Create a cube made of smaller cubes
  const cubes = useMemo(() => {
    const cubeSize = size / 3;
    const offset = cubeSize * 1.1;
    const cubes = [];
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip center for hollow effect
          if (x === 0 && y === 0 && z === 0) continue;
          
          cubes.push({
            position: [x * offset, y * offset, z * offset] as [number, number, number],
            scale: 1,
            delay: (x + y + z + 3) * 0.1,
          });
        }
      }
    }
    
    return cubes;
  }, [size]);

  // Particles flowing to center
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      start: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ),
      speed: 0.02 + Math.random() * 0.03,
      offset: Math.random() * 100,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Rotate entire cube
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.5 * speed;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3 * speed) * 0.2;
    }
    
    // Animate individual cubes
    if (particlesRef.current) {
      particlesRef.current.children.forEach((mesh, i) => {
        const cube = cubes[i];
        if (cube) {
          const pulse = Math.sin(clock.getElapsedTime() * 2 + cube.delay) * 0.2 + 1;
          mesh.scale.setScalar(pulse * 0.9);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main cube structure */}
      <group ref={particlesRef}>
        {cubes.map((cube, i) => (
          <mesh key={i} position={cube.position}>
            <boxGeometry args={[size / 3.5, size / 3.5, size / 3.5]} />
            <meshStandardMaterial
              color={color}
              metalness={0.8}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Center glow */}
      <mesh>
        <sphereGeometry args={[size * 0.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      
      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.8, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[size * 0.9, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      
      {/* Point light */}
      <pointLight color={color} intensity={1} distance={5} />
    </group>
  );
}

function StreamingParticles({
  count = 30,
  color = '#007AFF',
}: {
  count?: number;
  color?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      start: new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      ),
      speed: 0.02 + Math.random() * 0.03,
      offset: Math.random() * 100,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, i) => {
        const particle = particles[i];
        const time = clock.getElapsedTime() + particle.offset;
        
        // Move towards center
        const direction = new THREE.Vector3(0, 0, 0).sub(particle.start).normalize();
        const distance = particle.start.length();
        const progress = (time * particle.speed) % 1;
        
        mesh.position.copy(
          particle.start.clone().lerp(new THREE.Vector3(0, 0, 0), progress)
        );
        
        // Fade out as it approaches center
        const scale = Math.sin(progress * Math.PI) * 0.1;
        mesh.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function LoadingCube3D({
  size = 1.5,
  color = '#007AFF',
  speed = 1,
  showText = true,
}: LoadingCube3DProps & { showText?: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-48 h-48">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[0, 0, 0]} color={color} intensity={1.5} distance={10} />
          
          <DataCube size={size} color={color} speed={speed} />
          <StreamingParticles color={color} />
        </Canvas>
      </div>
      
      {showText && (
        <div className="mt-4 text-center">
          <p className="text-blue-400 text-sm font-medium animate-pulse">
            Loading intelligent insights...
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Processing your business data
          </p>
        </div>
      )}
    </div>
  );
}

export default LoadingCube3D;
