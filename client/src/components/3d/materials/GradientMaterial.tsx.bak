import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    float noise = sin(vPosition.x * 2.0 + uTime) * sin(vPosition.y * 2.0 + uTime) * sin(vPosition.z * 2.0 + uTime);
    
    vec3 color1 = uColor1;
    vec3 color2 = uColor2;
    vec3 color3 = uColor3;
    
    float mixFactor1 = (sin(uTime * 0.5 + vPosition.x) + 1.0) * 0.5;
    float mixFactor2 = (cos(uTime * 0.3 + vPosition.y) + 1.0) * 0.5;
    
    vec3 mixedColor = mix(color1, color2, mixFactor1);
    mixedColor = mix(mixedColor, color3, mixFactor2 * (0.5 + noise * 0.25));
    
    gl_FragColor = vec4(mixedColor, 0.8);
  }
`;

export function useGradientMaterial(
  color1: string = '#007AFF',
  color2: string = '#5856D6',
  color3: string = '#AF52DE'
) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uColor3: { value: new THREE.Color(color3) },
    }),
    [color1, color2, color3]
  );

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [uniforms]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return material;
}

export function GradientOrb({
  color1 = '#007AFF',
  color2 = '#5856D6',
  color3 = '#AF52DE',
  size = 1,
  position = [0, 0, 0],
}: {
  color1?: string;
  color2?: string;
  color3?: string;
  size?: number;
  position?: [number, number, number];
}) {
  const material = useGradientMaterial(color1, color2, color3);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.1;
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={ref} material={material} position={position}>
      <sphereGeometry args={[size, 64, 64]} />
    </mesh>
  );
}

export function GradientBackground({
  color1 = '#007AFF',
  color2 = '#5856D6',
  color3 = '#000000',
}: {
  color1?: string;
  color2?: string;
  color3?: string;
}) {
  const material = useGradientMaterial(color1, color2, color3);

  return (
    <mesh material={material} scale={[20, 20, 20]}>
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  );
}
