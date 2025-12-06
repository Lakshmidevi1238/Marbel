import React, { Suspense, useRef, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Physics, useSphere, useTrimesh } from "@react-three/cannon";
import * as THREE from "three";

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
    if (now - lastTimeRef.current < 120) return;
    lastTimeRef.current = now;

    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  }, []);
}

// ✅ VISUAL BOWL
function BowlModel() {
  const { nodes } = useGLTF("/models/bowlcollider.glb");
  const mesh = nodes.Sphere;

  if (!mesh?.geometry) return null;

  return (
    <mesh geometry={mesh.geometry} position={mesh.position} rotation={mesh.rotation} scale={mesh.scale}>
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.2}
        roughness={0.03}
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

// ✅ COLLIDER
function BowlCollider() {
  const { nodes } = useGLTF("/models/bowlcollider.glb");
  const colliderMesh = nodes.bowlcollider;

  if (!colliderMesh?.geometry) return null;

  const geometry = colliderMesh.geometry;
  const vertices = geometry.attributes.position.array;
  const indices = geometry.index.array;

  useTrimesh(() => ({
    type: "Static",
    args: [vertices, indices],
    position: colliderMesh.position.toArray(),
    rotation: [
      colliderMesh.rotation.x,
      colliderMesh.rotation.y,
      colliderMesh.rotation.z,
    ],
    scale: colliderMesh.scale.toArray(),
  }));

  return null;
}

// ✅ SINGLE MARBLE
function MarbleBody({ color }) {
  const radius = 0.19;
  const playClink = useMarbleSound();

  const angle = Math.random() * Math.PI * 2;
  const r = 0.2 + Math.random() * 0.5;
  const x = Math.cos(angle) * r;
  const z = Math.sin(angle) * r;
  const y = 0.5 + Math.random();

  const [ref] = useSphere(() => ({
    mass: 1,
    args: [radius],
    position: [x, y, z],
    restitution: 0.35,
    friction: 0.08,
    onCollide: (e) => {
      const impact = e.contact?.impactVelocity ?? 0;
      if (impact > 1.3) playClink();
    },
  }));

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.12}
        clearcoat={1}
        transmission={0.3}
        thickness={0.5}
        envMapIntensity={1.6}
      />
    </mesh>
  );
}

// ✅ MAIN SCENE (TAILWIND SAFE)
export default function PhysicsGlassBowl3D({ marbles = [] }) {
  return (
    <div className="w-full h-full">
      <Canvas className="w-full h-full" camera={{ position: [0, 1.4, 4], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 3]} intensity={0.9} />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
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
