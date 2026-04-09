import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshDistortMaterial, 
  MeshTransmissionMaterial, 
  PerspectiveCamera, 
  Text,
  Environment,
  ContactShadows,
  Stars,
  Sparkles
} from '@react-three/drei';
import * as THREE from 'three';


const CrystalCore = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    mesh.current.rotation.y += 0.005;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={1.5}
          anisotropicBlur={0.1}
          iridescence={1}
          iridescenceThicknessRange={[100, 400]}
          toneMapped={false}
        />
      </mesh>
      
      {/* Internal Core Light */}
      <pointLight distance={3} intensity={5} color="#4f46e5" />
      
      {/* Floating Particles around core */}
      <Sparkles count={50} scale={2} size={2} speed={0.4} opacity={0.5} />
    </Float>
  );
};

const DataGrid = () => {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <gridHelper args={[20, 40, '#1e1b4b', '#0f172a']} />
    </group>
  );
};

const CinematicCamera = () => {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Dramatic pan
    camera.position.x = Math.sin(t * 0.1) * 3;
    camera.position.z = 5 + Math.cos(t * 0.1) * 2;
    camera.lookAt(0, 0, 0);
  });

  return <PerspectiveCamera makeDefault fov={75} position={[0, 0, 5]} />;
};

const CinematicHero3D = () => {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#000']} />
        
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <CrystalCore />
        <DataGrid />
        
        <Environment preset="city" />
        
        <CinematicCamera />
        
        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2.4} 
          far={4.5} 
        />
        
        {/* Volumetric Fog Effect */}
        <fog attach="fog" args={['#000', 5, 15]} />
      </Canvas>

      {/* Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
};

export default CinematicHero3D;
