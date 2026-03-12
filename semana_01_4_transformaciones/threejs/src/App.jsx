import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function TransformBox() {
  const meshRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Traslación
    meshRef.current.position.x = Math.sin(t) * 2
    meshRef.current.position.z = Math.cos(t) * 2

    // Rotación sobre su propio eje
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.02

    // Escala oscilante (senoidal)
    const s = 1 + 0.4 * Math.sin(t * 2)
    meshRef.current.scale.set(s, s, s)
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#DD8452" />
    </mesh>
  )
}


export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4C72B0" />

        <TransformBox />

        <gridHelper args={[10, 10, '#444', '#222']} />

        
        <OrbitControls /> 
      </Canvas>

      <div style={{
        position: 'absolute', top: 16, left: 16,
        color: 'white', fontFamily: 'monospace', fontSize: 13,
        background: 'rgba(0,0,0,0.6)', padding: '10px 14px', borderRadius: 8,
        lineHeight: 1.8
      }}>
        <b>Transformaciones</b><br />
        🟠 Cubo: traslación circular + rotación + escala<br />
        🔵 Esfera: misma trayectoria con desfase<br />
      </div>
    </div>
  )
}