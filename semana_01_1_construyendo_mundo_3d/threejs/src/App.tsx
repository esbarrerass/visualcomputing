import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import Croissant from './Croissant'

export type ViewMode = 'faces' | 'edges' | 'wireframe' | 'vertices'

export default function App() {
  const [mode, setMode] = useState<ViewMode>('faces')
  const [info, setInfo] = useState({ vertices: 0, faces: 0 })

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: 'white',
          zIndex: 10,
          background: 'rgba(0,0,0,0.6)',
          padding: '10px',
          borderRadius: '8px'
        }}
      >
        <h3>Visualization Mode</h3>

        <button onClick={() => setMode('faces')}>Faces</button>
        <button onClick={() => setMode('edges')}>Edges</button>
        <button onClick={() => setMode('wireframe')}>Wireframe</button>
        <button onClick={() => setMode('vertices')}>Vertices</button>

        <hr />

        <p>Vertices: {info.vertices}</p>
        <p>Faces: {info.faces}</p>
      </div>

      <Canvas
        style={{ position: 'absolute', top: 0, left: 0 }}
        camera={{ position: [0, 0, 60], fov: 50 }}
      >
        <color attach="background" args={['black']} />
        <ambientLight intensity={1.5} />

        <Croissant mode={mode} setInfo={setInfo} />

        <OrbitControls />
      </Canvas>
    </>
  )
}

