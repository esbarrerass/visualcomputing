import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  Text,
  Grid,
  Environment,
} from "@react-three/drei";

function SceneObjects() {
  const meshRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) mesh.rotation.y = t * 0.4 * (i % 2 === 0 ? 1 : -1);
    });
  });

  const objects = [
    {
      pos: [-4, 0, -8],
      geo: "box",
      color: "#FF6B6B",
      label: "Lejos (z = -8)",
      scale: 1.4,
    },
    {
      pos: [0, 0, 0],
      geo: "torus",
      color: "#4ECDC4",
      label: "Medio (z = 0)",
      scale: 1,
    },
    {
      pos: [4, 0, 8],
      geo: "octahedron",
      color: "#FFE66D",
      label: "Cerca (z = +8)",
      scale: 0.8,
    },
  ];

  return (
    <>
      {objects.map((obj, i) => (
        <group key={i} position={obj.pos}>
          <mesh
            ref={(el) => (meshRefs.current[i] = el)}
            scale={obj.scale}
          >
            {obj.geo === "box" && <boxGeometry args={[2, 2, 2]} />}
            {obj.geo === "torus" && <torusGeometry args={[1, 0.4, 16, 60]} />}
            {obj.geo === "octahedron" && <octahedronGeometry args={[1.4]} />}
            <meshStandardMaterial
              color={obj.color}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -2.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
            <meshStandardMaterial color={obj.color} opacity={0.5} transparent />
          </mesh>
          <Text
            position={[0, -4.5, 0]}
            fontSize={0.55}
            color={obj.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#0a0a1a"
          >
            {obj.label}
          </Text>
        </group>
      ))}

      <Grid
        args={[40, 40]}
        position={[0, -3.5, 0]}
        cellColor="#1e1e3a"
        sectionColor="#3a3a6a"
        sectionSize={4}
        cellSize={1}
        fadeDistance={50}
      />
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-8, 6, -10]} intensity={0.8} color="#a78bfa" />
      <pointLight position={[8, 4, 10]} intensity={0.6} color="#38bdf8" />
    </>
  );
}

function ActiveCamera({ mode }) {
  const aspect =
    typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1;
  const frustumSize = 22;

  return mode === "perspective" ? (
    <PerspectiveCamera makeDefault fov={60} near={0.1} far={200} position={[0, 6, 20]} />
  ) : (
    <OrthographicCamera
      makeDefault
      left={(-frustumSize * aspect) / 2}
      right={(frustumSize * aspect) / 2}
      top={frustumSize / 2}
      bottom={-frustumSize / 2}
      near={0.1}
      far={200}
      position={[0, 6, 20]}
    />
  );
}

export default function ProyeccionGeometrica() {
  const [cameraMode, setCameraMode] = useState("perspective");

  const isPerspective = cameraMode === "perspective";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#080818",
        fontFamily: "'Courier New', monospace",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "14px 24px",
          background: "rgba(10,10,30,0.95)",
          borderBottom: "1px solid #2a2a5a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
          flexShrink: 0,
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "12px" }}>CÁMARA:</span>
          <div
            style={{
              display: "flex",
              background: "#0f0f2a",
              border: "1px solid #2a2a5a",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {["perspective", "orthographic"].map((mode) => (
              <button
                key={mode}
                onClick={() => setCameraMode(mode)}
                style={{
                  padding: "8px 18px",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "none",
                  transition: "all 0.2s",
                  background:
                    cameraMode === mode
                      ? mode === "perspective"
                        ? "#4ECDC4"
                        : "#FF6B6B"
                      : "transparent",
                  color: cameraMode === mode ? "#080818" : "#64748b",
                  fontWeight: cameraMode === mode ? "bold" : "normal",
                  fontFamily: "inherit",
                }}
              >
                {mode === "perspective" ? "Perspectiva" : "Ortográfica"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        <Canvas shadows>
          <ActiveCamera mode={cameraMode} />
          <Lights />
          <SceneObjects />
          <OrbitControls enableDamping dampingFactor={0.08} />
          <fog attach="fog" args={["#080818", 30, 80]} />
        </Canvas>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "rgba(8,8,24,0.9)",
            border: `1px solid ${isPerspective ? "#4ECDC4" : "#FF6B6B"}`,
            borderRadius: "8px",
            padding: "16px 20px",
            maxWidth: "340px",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              color: isPerspective ? "#4ECDC4" : "#FF6B6B",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {isPerspective ? " Cámara Perspectiva" : "Cámara Ortográfica"}
          </div>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
            {isPerspective
              ? "SI Aplica división perspectiva (divide x,y por -z), por tanto, los objetos lejanos parecen más pequeños. La matriz es un frustum con FOV 60°."
              : "NO divide por z, es decir, los objetos mantienen su tamaño independientemente de la profundidad. La matriz es una escala uniforme sin perspectiva."}
          </p>
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "4px",
              fontSize: "11px",
              color: "#64748b",
              fontFamily: "monospace",
            }}
          >
            {isPerspective
              ? "P = [1/(a·tan(fov/2))  0  0  0]\n    [0  1/tan(fov/2)  0  0]\n    [0  0  -(f+n)/(f-n)  -1]\n    [0  0  -2fn/(f-n)  0]"
              : "P = [2/(r-l)  0  0  -(r+l)/(r-l)]\n    [0  2/(t-b)  0  -(t+b)/(t-b)]\n    [0  0  -2/(f-n)  -(f+n)/(f-n)]\n    [0  0  0  1]"}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            color: "#334155",
            fontSize: "11px",
            textAlign: "right",
            lineHeight: "1.8",
          }}
        >
        </div>
      </div>
    </div>
  );
}
