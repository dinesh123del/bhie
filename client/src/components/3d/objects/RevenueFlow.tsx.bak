import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollProgress3D } from '../hooks';

interface RevenueFlow3DProps {
  revenue?: number;
  growth?: number;
  particleCount?: number;
}

function FlowingParticles({
  count = 50,
  revenue = 100000,
  growth = 10,
}: {
  count?: number;
  revenue?: number;
  growth?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scrollProgress = useScrollProgress3D();

  // Create flowing paths
  const paths = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const y = (i / count) * 4 - 2; // Spread vertically
      const amplitude = 0.5 + Math.random() * 0.5;
      const frequency = 0.5 + Math.random() * 0.5;
      const speed = 0.5 + Math.random() * 0.5;
      
      // Generate curve points
      const points = [];
      for (let t = 0; t <= 1; t += 0.02) {
        const x = (t - 0.5) * 8;
        const z = Math.sin(t * Math.PI * frequency) * amplitude;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      return {
        points,
        color: growth > 0 ? '#34C759' : '#FF3B30',
        speed,
        offset: Math.random() * 100,
      };
    });
  }, [count, growth]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Animate particles along paths
      groupRef.current.children.forEach((child, i) => {
        const path = paths[i];
        const time = clock.getElapsedTime() * path.speed + path.offset;
        const progress = (time % 1);
        
        const pointIndex = Math.floor(progress * path.points.length);
        if (path.points[pointIndex]) {
          child.position.copy(path.points[pointIndex]);
        }
        
        // Scale based on progress (grow as they flow)
        const scale = 0.5 + Math.sin(progress * Math.PI) * 0.5;
        child.scale.setScalar(scale * (0.5 + (revenue / 1000000) * 0.5));
      });
    }
  });

  return (
    <group ref={groupRef}>
      {paths.map((path, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={path.color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function FlowRibbons({
  revenue = 100000,
  growth = 10,
}: {
  revenue?: number;
  growth?: number;
}) {
  const ribbons = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }).map((_, i) => {
      const y = (i / (count - 1)) * 2 - 1;
      const amplitude = 0.3 + i * 0.1;
      
      const points = [];
      for (let t = 0; t <= 1; t += 0.05) {
        const x = (t - 0.5) * 6;
        const z = Math.sin(t * Math.PI * 2) * amplitude;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      return {
        points,
        color: growth > 0 ? '#007AFF' : '#FF3B30',
        width: 0.02 + (revenue / 1000000) * 0.03,
      };
    });
  }, [revenue, growth]);

  return (
    <>
      {ribbons.map((ribbon, i) => (
        <Line
          key={i}
          points={ribbon.points}
          color={ribbon.color}
          lineWidth={ribbon.width}
          transparent
          opacity={0.6}
        />
      ))}
    </>
  );
}

function RevenueDisplay({
  revenue,
  growth,
}: {
  revenue: number;
  growth: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const formattedRevenue = `₹${(revenue / 100000).toFixed(1)}L`;
  const formattedGrowth = `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 2]}>
      {/* Revenue Text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {formattedRevenue}
      </Text>
      
      {/* Growth Text */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.25}
        color={growth > 0 ? '#34C759' : '#FF3B30'}
        anchorX="center"
        anchorY="middle"
      >
        {formattedGrowth} this month
      </Text>
      
      {/* Glow effect */}
      <mesh scale={[2, 1, 0.1]} position={[0, 0, -0.1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#007AFF"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

export function RevenueFlow3D({
  revenue = 500000,
  growth = 15,
  particleCount = 30,
}: RevenueFlow3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        
        <FlowRibbons revenue={revenue} growth={growth} />
        <FlowingParticles count={particleCount} revenue={revenue} growth={growth} />
        <RevenueDisplay revenue={revenue} growth={growth} />
      </Canvas>
    </div>
  );
}

export default RevenueFlow3D;
