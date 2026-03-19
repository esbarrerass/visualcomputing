import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from 'three/addons/controls/OrbitControls.js';
import SolarSystem from "./components/SolarSystem";

const CameraController = () => {
   const { camera, gl } = useThree();
   useEffect(() => {
     const controls = new OrbitControlsImpl(camera, gl.domElement);
     controls.minDistance = 3;
     controls.maxDistance = 100;
     return () => {
       controls.dispose();
     };
   }, [camera, gl]);
   return null;
};

export default function App() {
  const [matrixData, setMatrixData] = useState({
    sun: null,
    earth: null,
    moon: null
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
      {/* Overlay to display transformation matrices */}
      <div 
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          fontFamily: "monospace",
          fontSize: "12px",
          width: "350px",
          maxHeight: "90vh",
          overflowY: "auto",
          backdropFilter: "blur(4px)"
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", color: "#61dafb" }}>Matrices de Transformación</h3>
        
        <MatrixDisplay title="Sol (Global)" matrix={matrixData.sun} color="#fca311" />
        <MatrixDisplay title="Tierra (Local al Sol)" matrix={matrixData.earth} color="#4ea8de" />
        <MatrixDisplay title="Luna (Local a la Tierra)" matrix={matrixData.moon} color="#e5e5e5" />
      </div>

      <Canvas camera={{ position: [0, 10, 20], fov: 45 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={200} distance={50} color="#ffeedd" />
        
        <SolarSystem onUpdateMatrix={(name, matrix) => {
          setMatrixData(prev => ({
            ...prev,
            [name]: matrix
          }));
        }} />
        
        <CameraController />
      </Canvas>
    </div>
  );
}

function MatrixDisplay({ title, matrix, color }) {
  if (!matrix) return null;
  
  return (
    <div style={{ marginBottom: "15px" }}>
      <strong style={{ color }}>{title}</strong>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: "4px",
        marginTop: "5px",
        background: "rgba(255,255,255,0.1)",
        padding: "5px",
        borderRadius: "4px"
      }}>
        {Array.from(matrix.elements).map((val, i) => (
          <div key={i} style={{ textAlign: "right", fontFamily: "monospace" }}>
            {val.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
