import { useState} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
  Text,
  Grid,
} from "@react-three/drei";
import * as THREE from "three";

function SceneObjects() {
  const objects = [
    { pos: [-3, 0, -10], color: "#FF6B6B", label: "z = -10" },
    { pos: [0,  0,  0],  color: "#4ECDC4", label: "z = 0"   },
    { pos: [3,  0,  8],  color: "#FFE66D", label: "z = +8"  },
    { pos: [-3, 2, -5],  color: "#a78bfa", label: "z = -5"  },
    { pos: [3, -1,  4],  color: "#fb923c", label: "z = +4"  },
  ];

  return (
    <>
      {objects.map((obj, i) => (
        <group key={i} position={obj.pos}>
          {i % 2 === 0 ? (
            <mesh>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial color={obj.color} metalness={0.2} roughness={0.5} />
            </mesh>
          ) : (
            <mesh>
              <sphereGeometry args={[0.9, 32, 32]} />
              <meshStandardMaterial color={obj.color} metalness={0.2} roughness={0.5} />
            </mesh>
          )}
          <Text
            position={[0, -1.4, 0]}
            fontSize={0.45}
            color={obj.color}
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#050510"
          >
            {obj.label}
          </Text>
        </group>
      ))}
      <Grid
        args={[40, 40]}
        position={[0, -2, 0]}
        cellColor="#1a1a3a"
        sectionColor="#2a2a5a"
        sectionSize={4}
        cellSize={1}
        fadeDistance={60}
      />
    </>
  );
}

function ProjectionPoint() {
  const { camera, size } = useThree();
  const [setProjected] = useState({ x: 0, y: 0 });
  const worldPos = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    const v = worldPos.clone().project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((-v.y + 1) / 2) * size.height;
    setProjected({ x: Math.round(x), y: Math.round(y) });
  });

  return null;
}

function CameraInfo({ mode, onUpdate }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!camera) return;
    if (mode === "perspective") {
      const c = camera;
      onUpdate({
        type: "Perspectiva",
        fov: c.fov?.toFixed(1),
        aspect: c.aspect?.toFixed(3),
        near: c.near?.toFixed(2),
        far: c.far?.toFixed(1),
      });
    } else {
      const c = camera;
      onUpdate({
        type: "Ortográfica",
        left: c.left?.toFixed(2),
        right: c.right?.toFixed(2),
        top: c.top?.toFixed(2),
        bottom: c.bottom?.toFixed(2),
        near: c.near?.toFixed(2),
        far: c.far?.toFixed(1),
      });
    }
  });

  return null;
}

function ProjectedCoords({ onUpdate }) {
  const { camera, size } = useThree();
  const worldPos = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    const v = worldPos.clone().project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((-v.y + 1) / 2) * size.height;
    onUpdate({ x: Math.round(x), y: Math.round(y), ndc: { x: v.x.toFixed(3), y: v.y.toFixed(3) } });
  });

  return null;
}

function ActiveCamera({ mode }) {
  const aspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1;
  const frustumSize = 20;

  return mode === "perspective" ? (
    <PerspectiveCamera makeDefault fov={60} near={0.1} far={200} position={[0, 5, 18]} />
  ) : (
    <OrthographicCamera
      makeDefault
      left={(-frustumSize * aspect) / 2}
      right={(frustumSize * aspect) / 2}
      top={frustumSize / 2}
      bottom={-frustumSize / 2}
      near={0.1}
      far={200}
      position={[0, 5, 18]}
    />
  );
}

export default function TallerProyecciones() {
  const [mode, setMode] = useState("perspective");
  const [camInfo, setCamInfo] = useState({});
  const [projected, setProjected] = useState({ x: 0, y: 0, ndc: { x: "0", y: "0" } });

  const isPerspective = mode === "perspective";
  const accent = isPerspective ? "#4ECDC4" : "#FF6B6B";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#050510", fontFamily: "monospace", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header style={{ padding: "12px 20px", background: "rgba(5,5,20,0.97)", borderBottom: "1px solid #1a1a3a", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 10 }}>
        <div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["perspective", "orthographic"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "8px 20px",
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                cursor: "pointer",
                border: `1px solid ${mode === m ? accent : "#1a1a3a"}`,
                borderRadius: "4px",
                background: mode === m ? accent : "transparent",
                color: mode === m ? "#050510" : "#64748b",
                fontWeight: mode === m ? "bold" : "normal",
                fontFamily: "monospace",
                transition: "all 0.2s",
              }}
            >
              {m === "perspective" ? "Perspectiva" : "Ortográfica"}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        <Canvas shadows>
          <ActiveCamera mode={mode} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-8, 6, -10]} intensity={0.6} color="#a78bfa" />
          <SceneObjects />
          <OrbitControls enableDamping dampingFactor={0.08} />
          <CameraInfo mode={mode} onUpdate={setCamInfo} />
          <ProjectedCoords onUpdate={setProjected} />
          <fog attach="fog" args={["#050510", 35, 90]} />
        </Canvas>

        <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(5,5,20,0.92)", border: `1px solid ${accent}`, borderRadius: "8px", padding: "14px 18px", minWidth: "220px", backdropFilter: "blur(8px)" }}>
          <div style={{ color: accent, fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>
            {isPerspective ? "Cámara Perspectiva" : "Cámara Ortográfica"}
          </div>

          {isPerspective ? (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              {[ 
                ["fov", camInfo.fov + "°"],
                ["aspect", camInfo.aspect],
                ["near", camInfo.near],
                ["far", camInfo.far],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#64748b", fontSize: "12px", paddingRight: "12px", paddingBottom: "4px" }}>{k}</td>
                  <td style={{ color: "#e2e8f0", fontSize: "12px", paddingBottom: "4px", fontFamily: "monospace" }}>{v}</td>
                </tr>
              ))}
            </table>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              {[
                ["left", camInfo.left],
                ["right", camInfo.right],
                ["top", camInfo.top],
                ["bottom", camInfo.bottom],
                ["near", camInfo.near],
                ["far", camInfo.far],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: "#64748b", fontSize: "12px", paddingRight: "12px", paddingBottom: "4px" }}>{k}</td>
                  <td style={{ color: "#e2e8f0", fontSize: "12px", paddingBottom: "4px", fontFamily: "monospace" }}>{v}</td>
                </tr>
              ))}
            </table>
          )}
        </div>

        <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(5,5,20,0.92)", border: "1px solid #1a1a3a", borderRadius: "8px", padding: "14px 18px", minWidth: "200px", backdropFilter: "blur(8px)" }}>
          <div style={{ color: "#a78bfa", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "10px" }}>Vector3.project()</div>
          <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "6px" }}>Punto mundo: (0, 0, 0)</div>
          <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>NDC:</div>
          <div style={{ color: "#e2e8f0", fontSize: "12px", fontFamily: "monospace", marginBottom: "8px" }}>
            x: {projected.ndc?.x} / y: {projected.ndc?.y}
          </div>
          <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>Pantalla (px):</div>
          <div style={{ color: "#e2e8f0", fontSize: "12px", fontFamily: "monospace" }}>
            x: {projected.x} / y: {projected.y}
          </div>
          <div style={{ marginTop: "10px", padding: "6px 8px", background: "rgba(167,139,250,0.08)", borderRadius: "4px", fontSize: "10px", color: "#64748b", lineHeight: "1.5" }}>
            NDC = coordenadas normalizadas<br />[-1, 1] en x e y
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "16px", right: "16px", color: "#1e2a3a", fontSize: "11px", textAlign: "right", lineHeight: "1.8" }}>
        </div>
      </div>
    </div>
  );
}
