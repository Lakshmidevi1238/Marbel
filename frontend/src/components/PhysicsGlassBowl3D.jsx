// src/components/PhysicsGlassBowl3D.jsx
import React, {
  Suspense,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Physics, useSphere, useTrimesh } from "@react-three/cannon";
import * as THREE from "three";

// ------------ SOUND HOOK (one-shot clink) ------------
function useMarbleSound() {
  const lastTimeRef = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/sounds/clink.mp3");
    audio.volume = 0.1;
    audio.loop = false;
    audioRef.current = audio;
  }, []);

  return useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = performance.now();
    // small cooldown
    if (now - lastTimeRef.current < 120) return;
    lastTimeRef.current = now;

    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);
}

// ------------ BOWL VISUAL — TRANSPARENT GLASS ------------
function BowlModel() {
  const { nodes } = useGLTF("/models/bowlcollider.glb");
  const mesh = nodes.Sphere;

  if (!mesh || !mesh.geometry) return null;

  return (
    <mesh
      geometry={mesh.geometry}
      position={mesh.position}
      rotation={mesh.rotation}
      scale={mesh.scale}
      castShadow={false}
      receiveShadow={false}
    >
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.2}
        roughness={0.03}
        metalness={0}
        transmission={0.95}
        ior={1.45}
        thickness={0.6}
        envMapIntensity={1.1}
        clearcoat={1}
        clearcoatRoughness={0.08}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ------------ BOWL COLLIDER — REAL SHAPE FOR PHYSICS ------------
function BowlCollider() {
  const { nodes } = useGLTF("/models/bowlcollider.glb");
  const colliderMesh = nodes.bowlcollider;

  if (!colliderMesh || !colliderMesh.geometry) return null;

  const geometry = colliderMesh.geometry;
  const vertices = geometry.attributes.position.array;
  const indices = geometry.index.array;

  const position = colliderMesh.position.toArray();
  const rotation = [
    colliderMesh.rotation.x,
    colliderMesh.rotation.y,
    colliderMesh.rotation.z,
  ];
  const scale = colliderMesh.scale.toArray();

  useTrimesh(() => ({
    type: "Static",
    args: [vertices, indices],
    position,
    rotation,
    scale,
  }));

  return null;
}

// ------------ SINGLE MARBLE WITH FILTERED SOUND ------------
function MarbleBody({ color }) {
  const radius = 0.19;
  const playClink = useMarbleSound();

  const innerR = 0.15;
  const outerR = 0.55;
  const angle = Math.random() * Math.PI * 2;
  const r = innerR + Math.random() * (outerR - innerR);
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;

  // start above bottom so they fall in
  const y = 0.4 + Math.random() * 0.8;

  const [ref] = useSphere(() => ({
    mass: 1,
    args: [radius],
    position: [x, y, z],
    restitution: 0.35,
    friction: 0.08,
    frictionAir: 0.01,
    linearDamping: 0.04,
    angularDamping: 0.04,
    onCollide: (e) => {
      // Only play when impact is strong enough
      const impact = e.contact?.impactVelocity ?? 0;
      // console.log("impact", impact); // uncomment to debug
      if (impact > 1.3) {
        playClink();
      }
    },
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.12}
        metalness={0}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0.3}
        thickness={0.5}
        envMapIntensity={1.6}
      />
    </mesh>
  );
}

// ------------ MAIN SCENE ------------
export default function PhysicsGlassBowl3D({ marbles = [] }) {
  return (
    <div className="bowl-card">
      <Canvas
        camera={{ position: [0, 1.4, 4.0], fov: 40 }}
        shadows
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[5, 6, 3]}
          intensity={0.9}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={null}>
          <Environment preset="sunset" background={false} />

          <Physics gravity={[0, -9.81, 0]}>
            <BowlModel />
            <BowlCollider />
            {marbles.map((m, i) => {
              let color = "#8ec5fc";
              if (m.type === "GOLD") color = "#f5b300";
              if (m.type === "SPECIAL") color = "#c864ff";
              return <MarbleBody key={m.id ?? i} color={color} />;
            })}
          </Physics>
        </Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
