import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMousePosition3D(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
        normalizedX: x,
        normalizedY: y,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
}

export function useMouseInfluence(ref: React.RefObject<THREE.Object3D>, intensity: number = 1) {
  const mousePosition = useMousePosition3D();
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (ref.current) {
      targetRotation.current.x = mousePosition.normalizedY * intensity;
      targetRotation.current.y = mousePosition.normalizedX * intensity;
      
      ref.current.rotation.x += (targetRotation.current.x - ref.current.rotation.x) * 0.05;
      ref.current.rotation.y += (targetRotation.current.y - ref.current.rotation.y) * 0.05;
    }
  });
}

export function useCursorRepulsion(
  ref: React.RefObject<THREE.Object3D>,
  radius: number = 2,
  strength: number = 1
) {
  const mousePosition = useMousePosition3D();

  useFrame(() => {
    if (ref.current) {
      const vector = new THREE.Vector3(
        mousePosition.normalizedX * 5,
        mousePosition.normalizedY * 5,
        0
      );
      
      const distance = ref.current.position.distanceTo(vector);
      
      if (distance < radius) {
        const force = (radius - distance) / radius * strength;
        const direction = new THREE.Vector3()
          .subVectors(ref.current.position, vector)
          .normalize();
        
        ref.current.position.add(direction.multiplyScalar(force * 0.1));
      }
    }
  });
}
