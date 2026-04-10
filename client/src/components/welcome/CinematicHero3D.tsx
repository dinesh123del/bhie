import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment,
  Stars,
  Sparkles,
  PerformanceMonitor
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// ── AUDIO SYNTHESIS ENGINE ──
// Handling dynamic sound seamlessly without external assets
export const SyntheticAudio = {
  ctx: null as AudioContext | null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playHum() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(45, this.ctx.currentTime); // Deep C
      
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.5, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start();
      lfo.start();
    } catch(e) { console.warn('Audio synthesis failed'); }
  },
  playFracture() {
    if (!this.ctx) return;
    try {
      // Deep Sub Bass drop
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.05); // Punch
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2);
      
      // Glass shatter / Digital Noise
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 4000;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start();
    } catch(e) {}
  }
};

// ── Chrome Core Sphere ──
const ChromeCore = ({ phase, mouse }: { phase: number, mouse: THREE.Vector2 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Phase 2: Birth
    if (phase >= 2 && phase < 4) {
      const scaleTarget = THREE.MathUtils.lerp(0, 1.8, Math.min((t - 2) / 3, 1));
      meshRef.current.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.05);
    } 
    // Phase 4: Fracture
    else if (phase >= 4) {
      meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.2);
    }
    else {
      meshRef.current.scale.set(0, 0, 0);
    }

    // Phase 3: Consciousness (hover interaction)
    if (phase === 3) {
      const targetRotationX = (mouse.y * Math.PI) / 4;
      const targetRotationY = (mouse.x * Math.PI) / 4;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;
    } else {
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef} receiveShadow castShadow>
        <sphereGeometry args={[1, 128, 128]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          resolution={1024}
          distortion={0.25}
          color="#f8fafc"
          transmission={0.95}
          thickness={1.5}
          roughness={0.1}
          metalness={0.8}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.1}
        />
      </mesh>
    </Float>
  );
};

// ── Instanced Micro Spheres ──
const MicroSpheres = ({ phase }: { phase: number }) => {
  const count = 1000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Custom tracking data per instance
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        
        // Initial tight core position (compressed state)
        const ix = Math.cos(theta) * Math.sin(phi) * 1.5;
        const iy = Math.sin(theta) * Math.sin(phi) * 1.5;
        const iz = Math.cos(phi) * 1.5;
        
        // Exploded / Neural net positions
        const tPhi = Math.random() * Math.PI * 2;
        const tTheta = Math.acos(Math.random() * 2 - 1);
        const rad = 6 + Math.random() * 8; 
        
        const tx = rad * Math.sin(tTheta) * Math.cos(tPhi);
        const ty = rad * Math.sin(tTheta) * Math.sin(tPhi);
        const tz = rad * Math.cos(tTheta);

        const speed = 0.5 + Math.random();
        data.push({ ix, iy, iz, tx, ty, tz, speed, current: new THREE.Vector3(ix, iy, iz) });
    }
    return data;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    
    particles.forEach((particle, i) => {
      // Phase 4 & 5: Fracture & Reformation
      if (phase >= 4) {
        if (phase === 4) {
           // Explosive expansion (Chaos)
           const timeSinceFracture = t - 8;
           const explodePower = Math.min(timeSinceFracture * 10, 1.0);
           const target = new THREE.Vector3(particle.tx * 2, particle.ty * 2, particle.tz * 2);
           particle.current.lerp(target, 0.05 * particle.speed * explodePower);
        } else if (phase >= 5) {
           // Neural Reorganization (Forming structured internal web)
           const tX = particle.tx * 0.5 + Math.sin(t * particle.speed + i) * 0.5;
           const tY = particle.ty * 0.5 + Math.cos(t * particle.speed + i) * 0.5;
           const tZ = particle.tz * 0.5;
           particle.current.lerp(new THREE.Vector3(tX, tY, tZ), 0.02 * particle.speed);
        }
      } else {
        // Hidden inside the core
        particle.current.set(particle.ix, particle.iy, Math.random() > 0.5 ? particle.iz : 0.0);
      }
      
      dummy.position.copy(particle.current);
      // Scale up when fractured
      const targetScale = phase >= 4 ? 0.06 + Math.sin(t * particle.speed) * 0.02 : 0;
      dummy.scale.set(targetScale, targetScale, targetScale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    (meshRef.current.material as THREE.Material).needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color="#00D4FF" 
        emissive="#00D4FF"
        emissiveIntensity={0.8}
        metalness={0.9} 
        roughness={0.1}
        toneMapped={false} 
      />
    </instancedMesh>
  );
};

// ── Cinematic Engine Orchestrator ──
const EngineOrchestrator = ({ setPhaseStatus }: { setPhaseStatus: (p: number) => void }) => {
  const { camera } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));
  const phaseRef = useRef(1);
  const audioInitializedRef = useRef(false);
  
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const initAudio = () => {
      if(!audioInitializedRef.current) {
         SyntheticAudio.init();
         audioInitializedRef.current = true;
         window.removeEventListener('click', initAudio);
         window.removeEventListener('keydown', initAudio);
      }
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const oldPhase = phaseRef.current;
    
    // Time-based Orchestration (6 phases over 18s)
    if (t < 2) phaseRef.current = 1;         // Void
    else if (t < 5) phaseRef.current = 2;    // Birth
    else if (t < 8) phaseRef.current = 3;    // Consciousness
    else if (t < 12) phaseRef.current = 4;   // Fracture
    else if (t < 18) phaseRef.current = 5;   // Reformation
    else phaseRef.current = 6;               // Stable loop

    if (oldPhase !== phaseRef.current) {
       setPhaseStatus(phaseRef.current);
       if(audioInitializedRef.current) {
          if (phaseRef.current === 2) SyntheticAudio.playHum();
          if (phaseRef.current === 4) SyntheticAudio.playFracture();
       }
    }

    // Camera Composition tracking
    if (phaseRef.current === 1 || phaseRef.current === 2) {
      // Cinematic Dolly In
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8, 0.01);
      camera.lookAt(0, 0, 0);
    } else if (phaseRef.current === 3) {
      // Hover reactive orbit tracking
      const tX = mouse.current.x * 2;
      const tY = mouse.current.y * 2;
      camera.position.x += (tX - camera.position.x) * 0.02;
      camera.position.y += (tY - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
    } else if (phaseRef.current >= 4) {
      // Final stabilize lock
      camera.position.lerp(new THREE.Vector3(Math.sin(t * 0.1) * 3, Math.sin(t * 0.05), 10 + Math.cos(t * 0.2)), 0.01);
      camera.lookAt(0, 0, 0);
    }
    
    // Dynamic Lighting Control
    if(spotLightRef.current) {
        spotLightRef.current.position.set(mouse.current.x * 10, mouse.current.y * 10, 5);
        spotLightRef.current.intensity = phaseRef.current >= 3 ? 150 : 0;
    }
    if(pointLightRef.current) {
        pointLightRef.current.intensity = phaseRef.current >= 4 ? Math.abs(Math.sin(t * 1.5)) * 100 : 0;
    }
  });

  return (
    <>
      <ChromeCore phase={phaseRef.current} mouse={mouse.current} />
      <MicroSpheres phase={phaseRef.current} />
      
      <spotLight 
        ref={spotLightRef}
        angle={0.4} 
        penumbra={1} 
        color="#7B61FF" 
        castShadow 
      />
      <pointLight 
        ref={pointLightRef}
        position={[0, 0, 0]} 
        color="#00D4FF" 
      />
    </>
  );
};

// ── Main UI Export ──
const CinematicHero3D = () => {
  const [dpr, setDpr] = useState(1.5);
  const [phase, setPhase] = useState(1);

  return (
    <div className="absolute inset-0 z-0 bg-[#020203] overflow-hidden" 
         onClick={() => SyntheticAudio.init()}>
      
      {/* Initialization prompt to bypass Audio Autoplay constraints */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-50 text-[10px] text-white/30 uppercase tracking-[0.4em] transition-opacity duration-1000 ${phase > 1 ? 'opacity-0' : 'opacity-100'}`}>
        Interact to initialize advanced simulation
      </div>

      <Canvas 
        shadows 
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={dpr}
      >
        <PerformanceMonitor 
          onDecline={() => setDpr(1)} 
          onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        >
          <color attach="background" args={['#020203']} />
          <fog attach="fog" args={['#020203', 10, 35]} />
          
          <ambientLight intensity={0.2} color="#ffffff" />
          <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#00D4FF" />
          <directionalLight position={[5, -5, 5]} intensity={1.5} color="#7B61FF" />
          
          <Environment preset="night" blur={0.8} />

          {/* Void Particles (Constantly alive, accelerating on fracture) */}
          <Stars 
            radius={100} 
            depth={50} 
            count={3000} 
            factor={4} 
            saturation={1} 
            fade 
            speed={phase >= 4 ? 3 : 0.5} 
          />
          
          <Sparkles 
            count={200} 
            scale={15} 
            size={1.5} 
            speed={0.4} 
            opacity={phase < 4 ? 0.3 : 0.8} 
            color="#00D4FF" 
          />
          
          <EngineOrchestrator setPhaseStatus={setPhase} />

          {/* 8K Hyper-real Post Processing */}
          <EffectComposer multisampling={0}>
             <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
             <DepthOfField focusDistance={0.02} focalLength={0.06} bokehScale={2.5} />
             <Vignette eskil={false} offset={0.1} darkness={0.9} />
             <Noise opacity={0.04} />
          </EffectComposer>

        </PerformanceMonitor>
      </Canvas>
      
      {/* Fallback Letterbox Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-80" />
    </div>
  );
};

export default CinematicHero3D;
