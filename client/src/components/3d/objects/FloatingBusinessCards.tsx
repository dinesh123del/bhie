"use client"
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition3D, useScrollProgress3D } from '../hooks';
import { GlassCard } from '../materials';

interface BusinessCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  position: [number, number, number];
  color: string;
}

interface FloatingBusinessCardsProps {
  cards?: BusinessCard[];
  autoGenerate?: boolean;
}

function Card3D({
  card,
  index,
}: {
  card: BusinessCard;
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePosition = useMousePosition3D();
  const scrollProgress = useScrollProgress3D();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Float animation
      const floatY = Math.sin(clock.getElapsedTime() * 0.8 + index * 0.5) * 0.2;
      
      // Mouse parallax
      const mouseX = mousePosition.normalizedX * 0.5;
      const mouseY = mousePosition.normalizedY * 0.5;
      
      // Scroll parallax
      const scrollOffset = scrollProgress.progress * 2;
      
      groupRef.current.position.y = card.position[1] + floatY - scrollOffset * 0.3;
      groupRef.current.position.x = card.position[0] + mouseX * (0.1 + index * 0.05);
      groupRef.current.position.z = card.position[2] + mouseY * 0.2;
      
      // Gentle rotation based on mouse
      groupRef.current.rotation.y = mouseX * 0.1;
      groupRef.current.rotation.x = -mouseY * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={card.position}>
      {/* Glass card background */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2.2, 1.2, 0.05]} />
        <meshPhysicalMaterial
          color={card.color}
          metalness={0.9}
          roughness={0.1}
          transmission={0.95}
          thickness={0.5}
          transparent
          opacity={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Glow border */}
      <mesh scale={[2.25, 1.25, 0.06]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={card.color}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Title */}
      <Text
        position={[0, 0.35, 0.03]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {card.title}
      </Text>
      
      {/* Value */}
      <Text
        position={[0, 0.05, 0.03]}
        fontSize={0.35}
        color={card.color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {card.value}
      </Text>
      
      {/* Change indicator */}
      <Text
        position={[0, -0.35, 0.03]}
        fontSize={0.12}
        color={card.isPositive ? '#34C759' : '#FF3B30'}
        anchorX="center"
        anchorY="middle"
      >
        {card.isPositive ? '↑' : '↓'} {card.change}
      </Text>
      
      {/* Point light for glow */}
      <pointLight
        color={card.color}
        intensity={0.5}
        distance={3}
        position={[0, 0, 0.5]}
      />
    </group>
  );
}

function Scene({ cards }: { cards: BusinessCard[] }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      {cards.map((card, index) => (
        <Card3D key={index} card={card} index={index} />
      ))}
    </>
  );
}

export function FloatingBusinessCards({
  cards,
  autoGenerate = true,
}: FloatingBusinessCardsProps) {
  const defaultCards: BusinessCard[] = useMemo(() => {
    if (!autoGenerate) return cards || [];
    
    return [
      {
        title: 'Revenue',
        value: '₹2.4M',
        change: '12.5%',
        isPositive: true,
        position: [-3, 1, 0],
        color: '#007AFF',
      },
      {
        title: 'Growth',
        value: '+34%',
        change: '8.2%',
        isPositive: true,
        position: [0, -0.5, 1],
        color: '#34C759',
      },
      {
        title: 'Profit',
        value: '₹890K',
        change: '5.1%',
        isPositive: true,
        position: [3, 1.5, -1],
        color: '#AF52DE',
      },
      {
        title: 'Customers',
        value: '12.8K',
        change: '15.3%',
        isPositive: true,
        position: [-2, -2, 0.5],
        color: '#FF9500',
      },
    ];
  }, [cards, autoGenerate]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene cards={defaultCards} />
      </Canvas>
    </div>
  );
}

export default FloatingBusinessCards;
