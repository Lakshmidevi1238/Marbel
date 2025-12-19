// src/components/MarbleToggle.jsx
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";

export default function MarbleToggle({
  size = 56,
  rotating = true,
  onClick,
  modelUrl = "/models/marble1.glb",
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "inline-block",
        border: "4px solid #3a3535",
        cursor: "pointer",
        transition: "box-shadow 0.25s ease",
        boxShadow: isHovered
          ? "0 0 18px 6px rgba(217,199,154,0.55)"
          : "none",
        background: "#f6efe8",
      }}
    >
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <MarbleScene rotating={rotating} modelUrl={modelUrl} />
      </Canvas>
    </div>
  );
}

function MarbleScene({ rotating, modelUrl }) {
  const rotatingRef = useRef();
  const { scene } = useGLTF(modelUrl);

  useFrame((_, delta) => {
    if (rotating && rotatingRef.current) {
      rotatingRef.current.rotation.z += delta * 0.6;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 2, 3]} intensity={1.1} />

      <group rotation={[-Math.PI / 2, 0, 0]} scale={1.15}>
        <group ref={rotatingRef}>
          <primitive object={scene} />
        </group>
      </group>

      <Environment preset="studio" />
    </>
  );
}
