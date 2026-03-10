import { useGLTF, Edges } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { Mesh } from 'three'
import type { ViewMode } from './App'

interface Props {
  mode: ViewMode
  setInfo: (info: { vertices: number; faces: number }) => void
}

export default function Croissant({ mode, setInfo }: Props) {
  const { scene } = useGLTF('/models/croissant_4k.gltf')

  const meshes = useMemo(() => {
    const temp: Mesh[] = []
    scene.traverse((child) => {
      if (child instanceof Mesh) temp.push(child)
    })
    return temp
  }, [scene])

  // bonus
  useEffect(() => {
    let totalVertices = 0
    let totalFaces = 0

    meshes.forEach((mesh) => {
      const geometry = mesh.geometry
      totalVertices += geometry.attributes.position.count

      if (geometry.index) {
        totalFaces += geometry.index.count / 3
      }
    })

    setInfo({
      vertices: totalVertices,
      faces: totalFaces
    })
  }, [meshes, setInfo])

  return (
  <group scale={100}>
    {meshes.map((mesh, index) => {

      if (mode === 'vertices') {
        return (
          <points key={index} geometry={mesh.geometry}>
            <pointsMaterial
              size={0.5}
              sizeAttenuation
              color="white"
            />
          </points>
        )
      }

      if (mode === 'wireframe') {
        return (
          <mesh key={index} geometry={mesh.geometry}>
            <meshBasicMaterial wireframe color="white" />
          </mesh>
        )
      }

      if (mode === 'edges') {
        return (
          <mesh
            key={index}
            geometry={mesh.geometry}
            material={mesh.material}
          >
            <Edges scale={1.01} threshold={15} color="white" />
          </mesh>
        )
      }

      return (
        <mesh
          key={index}
          geometry={mesh.geometry}
          material={mesh.material}
        />
      )
    })}
  </group>
  )
}
