"use client"
import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

const Logo3D = () => {
  const meshRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const fontUrl = "/helvetiker_bold.typeface.json";

  useFrame((state) => {
    if (meshRef.current) {
      // Slow continuous rotation (Base)
      const baseRotation = state.clock.getElapsedTime() * 0.2;

      // Interactive Parallax
      // On mobile, use a much subtler rotation or auto-animate
      const mouseX = isMobile ? Math.sin(state.clock.elapsedTime * 0.5) * 0.1 : state.mouse.x;
      const mouseY = isMobile ? Math.cos(state.clock.elapsedTime * 0.5) * 0.1 : state.mouse.y;

      const targetRotationX = (mouseY * 0.15);
      const targetRotationY = baseRotation + (mouseX * 0.3);

      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 0.05);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 0.05);
    }
  });

  return (
    <Center>
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <group ref={meshRef}>
          <Text3D
            font={fontUrl}
            size={viewport.width < 768 ? 0.5 : 0.8}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            BIZ PLUS
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.9}
              roughness={0.1}
              emissive="#3B82F6"
              emissiveIntensity={0.6}
            />
          </Text3D>
        </group>
      </Float>
    </Center>
  );
};

export default Logo3D;
