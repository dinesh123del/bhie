import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';

interface GrowthTree3DProps {
  growth?: number;
  revenue?: number;
  depth?: number;
}

interface Branch {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness: number;
  children: Branch[];
  level: number;
  color: string;
  health: number; // 0-1 representing branch vitality
}

function generateTree(
  start: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  thickness: number,
  level: number,
  maxLevel: number,
  growth: number
): Branch {
  const end = new THREE.Vector3().copy(start).add(
    direction.clone().multiplyScalar(length)
  );
  
  const branch: Branch = {
    start,
    end,
    thickness,
    children: [],
    level,
    color: level === 0 ? '#8B4513' : level < 3 ? '#007AFF' : '#34C759',
    health: Math.min(1, growth / 100 + Math.random() * 0.3),
  };
  
  if (level < maxLevel) {
    const numChildren = level === 0 ? 2 : 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numChildren; i++) {
      const angle = ((i / numChildren) * Math.PI - Math.PI / 2) * 0.8;
      const newDirection = new THREE.Vector3(
        direction.x * Math.cos(angle) - direction.z * Math.sin(angle),
        direction.y + 0.3,
        direction.x * Math.sin(angle) + direction.z * Math.cos(angle)
      ).normalize();
      
      const newLength = length * (0.7 + Math.random() * 0.2);
      const newThickness = thickness * 0.7;
      
      branch.children.push(
        generateTree(
          end,
          newDirection,
          newLength,
          newThickness,
          level + 1,
          maxLevel,
          growth
        )
      );
    }
  }
  
  return branch;
}

function TreeBranch({
  branch,
  index,
  time,
}: {
  branch: Branch;
  index: number;
  time: number;
}) {
  const lineRef = useRef<any>(null);
  const points = useMemo(() => [branch.start, branch.end], [branch]);
  
  // Animated growth
  const growthProgress = Math.min(1, time * 0.5 + branch.level * 0.1);
  const animatedEnd = new THREE.Vector3().lerpVectors(
    branch.start,
    branch.end,
    growthProgress
  );
  const animatedPoints = [branch.start, animatedEnd];
  
  return (
    <>
      <Line
        ref={lineRef}
        points={animatedPoints}
        color={branch.color}
        lineWidth={branch.thickness * 10}
        transparent
        opacity={branch.health * 0.8}
      />
      
      {/* Leaves at end of terminal branches */}
      {branch.children.length === 0 && growthProgress > 0.8 && (
        <group position={branch.end}>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 3) * Math.PI * 2) * 0.1,
                Math.cos((i / 3) * Math.PI * 2) * 0.1,
                0,
              ]}
              scale={[0.08, 0.08, 0.08]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial
                color="#34C759"
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Recursively render children */}
      {branch.children.map((child, i) => (
        <TreeBranch key={i} branch={child} index={i} time={time} />
      ))}
    </>
  );
}

function GrowthTree({
  growth = 50,
  revenue = 1000000,
  depth = 4,
}: {
  growth?: number;
  revenue?: number;
  depth?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  
  // Generate tree structure
  const tree = useMemo(() => {
    const initialLength = 1.5 + (revenue / 1000000) * 0.5;
    const initialThickness = 0.08;
    return generateTree(
      new THREE.Vector3(0, -2, 0),
      new THREE.Vector3(0, 1, 0),
      initialLength,
      initialThickness,
      0,
      depth,
      growth
    );
  }, [growth, revenue, depth]);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle swaying
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.02;
      
      // Growth animation
      timeRef.current += 0.01;
    }
  });
  
  const formattedGrowth = `${growth > 0 ? '+' : ''}${growth}%`;
  
  return (
    <group ref={groupRef}>
      <TreeBranch branch={tree} index={0} time={timeRef.current} />
      
      {/* Growth indicator */}
      <Text
        position={[2, 0, 0]}
        fontSize={0.3}
        color="#34C759"
        anchorX="left"
        anchorY="middle"
      >
        Growth: {formattedGrowth}
      </Text>
      
      {/* Glow at the base */}
      <mesh position={[0, -2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#007AFF"
          transparent
          opacity={0.3}
        />
      </mesh>
      <pointLight position={[0, -2, 0]} color="#007AFF" intensity={0.5} distance={5} />
    </group>
  );
}

export function GrowthTree3D({
  growth = 50,
  revenue = 1000000,
  depth = 4,
}: GrowthTree3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [4, 2, 6], fov: 45 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 3, 0]} color="#34C759" intensity={0.3} />
        
        <GrowthTree growth={growth} revenue={revenue} depth={depth} />
        
        {/* Ground plane */}
        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} />
        </mesh>
      </Canvas>
    </div>
  );
}

export default GrowthTree3D;
