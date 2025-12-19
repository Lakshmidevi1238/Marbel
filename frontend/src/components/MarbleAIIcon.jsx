import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { useRef, useState } from "react";

function Marble({ onHover, onClick }) {
  const ref = useRef();
  const { scene } = useGLTF("/models/aitoggle.glb");

  let t = 0;

  useFrame(() => {
    if (!ref.current) return;
    t += 0.01;

    // hover-drift
    ref.current.position.y = Math.sin(t) * 0.08;
    ref.current.position.x = Math.cos(t * 0.6) * 0.04;

    // slow rotation
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x += 0.001;
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={1.2}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    />
  );
}

export default function MarbleAIIcon({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-full h-full transition-all duration-300"
      style={{
        filter: hovered
          ? "drop-shadow(0 0 18px rgba(218,165,32,0.8)) drop-shadow(0 0 36px rgba(218,165,32,0.6))"
          : "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3] }}
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 4]} intensity={1.2} />
        <Environment preset="studio" />
        <Marble
          onHover={setHovered}
          onClick={onClick}
        />
      </Canvas>
    </div>
  );
}
