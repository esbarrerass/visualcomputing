import React, { Suspense, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import './App.css'

function GLTFModel({ visible = true, onStats }) {
  const { scene } = useGLTF('/models/convertido.gltf')
  React.useEffect(() => {
    if (scene && onStats) onStats(statsFromObject3D(scene))
  }, [scene, onStats])
  return <primitive object={scene} visible={visible} />
}

function OBJModel({ visible = true, onStats }) {
  const obj = useLoader(OBJLoader, '/models/convertido.obj')
  React.useEffect(() => {
    if (obj && onStats) onStats(statsFromObject3D(obj))
  }, [obj, onStats])
  return <primitive object={obj} visible={visible} />
}

function STLModel({ visible = true, onStats }) {
  const geometry = useLoader(STLLoader, '/models/convertido.stl')
  React.useEffect(() => {
    if (geometry && onStats) onStats(statsFromGeometry(geometry))
  }, [geometry, onStats])
  return (
    <mesh geometry={geometry} visible={visible}>
      <meshStandardMaterial color="gray" metalness={0.2} roughness={0.6} />
    </mesh>
  )
}

function statsFromGeometry(geometry) {
  if (!geometry || !geometry.attributes || !geometry.attributes.position) {
    return { vertices: 0, faces: 0 }
  }
  const posCount = geometry.attributes.position.count 
  const faces = geometry.index ? geometry.index.count / 3 : posCount / 3
  return { vertices: posCount, faces: Math.floor(faces) }
}

function statsFromObject3D(obj) {
  if (!obj) return { vertices: 0, faces: 0 }

  if (obj.isBufferGeometry || obj.attributes) return statsFromGeometry(obj)
    
  if (typeof obj.traverse !== 'function') return { vertices: 0, faces: 0 }
  const totals = { vertices: 0, faces: 0 }
  obj.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const s = statsFromGeometry(child.geometry)
      totals.vertices += s.vertices
      totals.faces += s.faces
    }
  })
  return totals
}

export default function App() {
  const [selected, setSelected] = useState('obj')
  const [objStats, setObjStats] = useState({ vertices: 0, faces: 0 })
  const [stlStats, setStlStats] = useState({ vertices: 0, faces: 0 })
  const [gltfStats, setGltfStats] = useState({ vertices: 0, faces: 0 })

  const btnStyle = {
    margin: '0 6px', padding: '8px 12px', borderRadius: 6,
    border: 'none', cursor: 'pointer'
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 10 }}>
        <button style={{ ...btnStyle, background: selected === 'obj' ? '#4f46e5' : '#ddd', color: selected === 'obj' ? 'white' : 'black' }} onClick={() => setSelected('obj')}>OBJ</button>
        <button style={{ ...btnStyle, background: selected === 'stl' ? '#4f46e5' : '#ddd', color: selected === 'stl' ? 'white' : 'black' }} onClick={() => setSelected('stl')}>STL</button>
        <button style={{ ...btnStyle, background: selected === 'gltf' ? '#4f46e5' : '#ddd', color: selected === 'gltf' ? 'white' : 'black' }} onClick={() => setSelected('gltf')}>GLTF</button>
      </div>

      <div style={{ position: 'absolute', left: 17, top: 65, zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: 6 }}>
        <p style={{ margin: 0, fontSize: 12 }}>Object Format: {selected.toUpperCase()}</p>
        <p style={{ margin: 0, fontSize: 10, color: '#555' }}>Vertices: {selected === 'obj' ? objStats.vertices : selected === 'stl' ? stlStats.vertices : gltfStats.vertices}</p>
        <p style={{ margin: 0, fontSize: 10, color: '#555' }}>Faces: {selected === 'obj' ? objStats.faces : selected === 'stl' ? stlStats.faces : gltfStats.faces}</p>
      </div>

      <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} camera={{ position: [0, 0.5, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <group visible={selected === 'obj'} scale={[0.008, 0.008, 0.008]} position={[0, -1, 0]}>
              <OBJModel onStats={setObjStats} />
            </group>

            <group visible={selected === 'stl'} scale={[30, 30, 30]} position={[0, -1, 0]}>
              <STLModel onStats={setStlStats} />
            </group>

            <group visible={selected === 'gltf'} scale={[0.03, 0.03, 0.03]} position={[0, 0, 0]}>
              <GLTFModel onStats={setGltfStats} />
            </group>
          </group> 
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
