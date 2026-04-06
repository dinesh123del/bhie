import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';

// ── Financial Clusters ──────────────────────────────────────────
function FinancialNodes() {
  const points = useMemo(() => {
    return Array.from({ length: 60 }).map(() => ({
      position: new THREE.Vector3().setFromSphericalCoords(
        2.02, 
        Math.random() * Math.PI, 
        Math.random() * 2 * Math.PI
      ),
      size: Math.random() * 0.015 + 0.005,
      opacity: Math.random() * 0.5 + 0.5
    }));
  }, []);

  return (
    <group>
      {points.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color="#007AFF" transparent opacity={p.opacity} />
        </mesh>
      ))}
    </group>
  );
}

// ── Data Arcs ───────────────────────────────────────────────────
function DataArcs() {
  const arcCount = 15;
  const arcs = useMemo(() => {
    return Array.from({ length: arcCount }).map(() => {
      const startLat = (Math.random() - 0.5) * Math.PI;
      const startLng = Math.random() * Math.PI * 2;
      const endLat = (Math.random() - 0.5) * Math.PI;
      const endLng = Math.random() * Math.PI * 2;
      
      const start = new THREE.Vector3().setFromSphericalCoords(2.02, startLat, startLng);
      const end = new THREE.Vector3().setFromSphericalCoords(2.02, endLat, endLng);
      
      const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(2.4);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return curve.getPoints(50);
    });
  }, []);

  return (
    <group>
      {arcs.map((points, i) => (
        <Line 
          key={i} 
          points={points} 
          color="#00A2FF" 
          lineWidth={0.6} 
          transparent 
          opacity={0.15} 
        />
      ))}
    </group>
  );
}

const GlobeContent = () => {
  const globeRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0012;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0012;
    }
  });

  return (
    <group ref={globeRef}>
      <Stars radius={300} depth={60} count={15000} factor={6} saturation={0} fade speed={0.8} />
      
      {/* Cinematic Rim Light / Atmosphere */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#007AFF" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#020205"
          metalness={0.95}
          roughness={0.05}
          emissive="#000000"
        />
        
        {/* Core Global Intelligence Viz */}
        <FinancialNodes />
        <DataArcs />
      </mesh>

      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#007AFF" />

      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        makeDefault 
      />
    </group>
  );
};

const InteractiveGlobe = () => {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas dpr={[1, 2]} performance={{ min: 0.5 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        <Suspense fallback={null}>
          <GlobeContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default InteractiveGlobe;
