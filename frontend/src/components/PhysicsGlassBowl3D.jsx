import React, { Suspense, useRef, useCallback, useEffect , useState} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Physics, useSphere, useTrimesh } from "@react-three/cannon";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";



/* ===================== SOUND ===================== */
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

    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);
}

/* ===================== VISUAL BOWL ===================== */
function BowlModel() {
  const { nodes } = useGLTF("/models/bowlcollider.glb");
  const mesh = nodes.Sphere;

  if (!mesh?.geometry) return null;

  return (
    <mesh
      geometry={mesh.geometry}
      position={[0, -0.15, 0]}
      scale={[1.08, 1.08, 1.08]} // 🔼 slightly bigger bowl
    >
      <meshPhysicalMaterial color="#ffffff" transparent opacity={0.18} roughness={0.05} transmission={0.9} ior={1.45} thickness={0.55} envMapIntensity={0.6} clearcoat={0.9} clearcoatRoughness={0.12} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ===================== COLLIDER (UNSCALED – STABLE) ===================== */
function BowlCollider() {
  const { nodes } = useGLTF("/models/bowlcollider.glb");
  const colliderMesh = nodes.bowlcollider;

  if (!colliderMesh?.geometry) return null;

  const geometry = colliderMesh.geometry;

  useTrimesh(() => ({
    type: "Static",
    args: [
      geometry.attributes.position.array,
      geometry.index.array,
    ],
    position: [0, -0.18, 0], // slightly lower than visual
    rotation: [0, 0, 0],
    scale: [1, 1, 1], // 🚫 NEVER scale physics
  }));

  return null;
}

/* ===================== MARBLE ===================== */
function MarbleBody({ color, index = 0, total = 1 }) {
  const radius = 0.19;
  const playClink = useMarbleSound();

  // ✅ deterministic spawn (prevents rim hits)
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  const r = 0.22;

  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [radius],
    position: [
      Math.cos(angle) * r,
      1.25 + index * 0.3, // vertical stacking
      Math.sin(angle) * r,
    ],
    restitution: 0.25,
    friction: 0.15,
    linearDamping: 0.2,
    angularDamping: 0.3,
    onCollide: (e) => {
      if ((e.contact?.impactVelocity ?? 0) > 1.2) {
        playClink();
      }
    },
  }));

  // ✅ FAILSAFE: never let marble escape scene
  useFrame(() => {
    if (!ref.current) return;
    if (ref.current.position.y < -2) {
      api.position.set(0, 0.3, 0);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.15}
        clearcoat={1}
        transmission={0.3}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

/* ===================== MAIN ===================== */
export default function PhysicsGlassBowl3D({ marbles = [] }) {
  const [visibleMarbles, setVisibleMarbles] = useState([]);
  const prevCountRef = useRef(0);
    useEffect(() => {
    // 🔁 Page refresh or same count → show all marbles instantly
    if (marbles.length <= prevCountRef.current) {
      setVisibleMarbles(marbles);
      prevCountRef.current = marbles.length;
      return;
    }

    // ➕ New marbles added → animate only the new ones
    const newMarbles = marbles.slice(prevCountRef.current);
    let i = 0;

    setVisibleMarbles(marbles.slice(0, prevCountRef.current));

    const interval = setInterval(() => {
      setVisibleMarbles((prev) => {
        if (i >= newMarbles.length) {
          clearInterval(interval);
          return prev;
        }
        return [...prev, newMarbles[i++]];
      });
    }, 380);

    prevCountRef.current = marbles.length;

    return () => clearInterval(interval);
  }, [marbles]);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.6, 4.6], fov: 38 }}>
        {/* 🔕 No harsh lights */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 5, 2]} intensity={0.55} />

        <Suspense fallback={null}>
          <Environment preset="studio" />

          <Physics gravity={[0, -9.81, 0]}>
            <BowlModel />
            <BowlCollider />

            {visibleMarbles.map((m, i) => (

              <MarbleBody
                key={m.id ?? i}
                color={
                  m.type === "GOLD"
                    ? "#f5b300"
                    : m.type === "SPECIAL"
                    ? "#c864ff"
                    : "#8ec5fc"
                }
              />
            ))}
          </Physics>
        </Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
