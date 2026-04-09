import * as THREE from 'three';
import React, { useMemo } from 'react';

/**
 * Custom shader for a liquid metal / chrome effect inspired by Apple's aesthetic.
 * Uses fresnel reflection and smooth noise for surface perturbation.
 */
export const LiquidMetalShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#4f46e5') },
    uBrightness: { value: 1.2 },
    uSpeed: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // Subtle organic pulsing
      vec3 pos = position;
      pos.x += sin(pos.y * 2.0 + uTime * 0.5) * 0.05;
      pos.y += cos(pos.x * 2.0 + uTime * 0.8) * 0.05;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uBrightness;

    void main() {
      // Fresnel effect
      vec3 viewDirection = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(vNormal, viewDirection), 3.0);
      
      // Liquid chrome reflection simulation
      float reflection = sin(vNormal.x * 10.0 + uTime * 2.0) * 0.5 + 0.5;
      reflection *= cos(vNormal.y * 5.0 - uTime * 1.5) * 0.5 + 0.5;
      
      vec3 finalColor = mix(vec3(0.02), uColor, fresnel * uBrightness);
      finalColor += reflection * 0.1 * uColor;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const LiquidMetalMaterial: React.FC<{ color?: string }> = ({ color = '#ffffff' }) => {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uBrightness: { value: 1.5 },
    uSpeed: { value: 0.5 },
  }), [color]);

  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={LiquidMetalShader.vertexShader}
      fragmentShader={LiquidMetalShader.fragmentShader}
      transparent={true}
    />
  );
};
