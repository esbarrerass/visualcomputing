import React, { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, useHelper, Html } from '@react-three/drei'
import { EffectComposer } from '@react-three/postprocessing'
import { useControls } from 'leva'
import * as THREE from 'three'
import { LensDistortion } from './LensDistortion'
import './index.css'

/**
 * Función central del ejercicio: Convierte coordenadas de un espacio 3D real
 * a coordenadas 2D de pantalla (píxeles), simulando el paso por el lente y proyección.
 * @param {THREE.Vector3} position - Posición global 3D del objeto
 * @param {THREE.Camera} camera - La cámara que actúa como modelo Pinhole
 * @param {number} width - Ancho del viewport en píxeles
 * @param {number} height - Alto del viewport en píxeles
 * @returns {object} Coordenadas x, y en pantalla y z para visibilidad.
 */
const project3DTo2D = (position, camera, width, height) => {
  const vec = position.clone()

  // 1. vec.project() aplica la matriz de vista y proyeccion (Perspective Projection)
  // Devuelve Normalised Device Coordinates (NDC) donde X, Y están entre -1 y 1
  vec.project(camera)

  // 2. Mapeamos X de [-1, 1] al rango de píxeles [0, width]
  const x = ((vec.x + 1) / 2) * width

  // 3. Mapeamos Y de [-1, 1] al rango [0, height]. El eje Y 2D está invertido
  // (crece hacia abajo en HTML, pero hacia arriba en gráficos 3D)
  const y = (-(vec.y - 1) / 2) * height

  // vec.z guarda información de profundidad:
  // z < 1.0 significa que el objeto está delante del plano far clipping de la cámara
  return { x, y, z: vec.z }
}

function PinholeCalibrationScene() {
  const { size } = useThree()

  // Referencias a los objetos tridimensionales que queremos seguir
  const boxRef = useRef(null)
  const sphereRef = useRef(null)

  // Referencias a los contenedores HTML de los labels para modificar su estilo nativamente (por rendimiento)
  const boxLabelRef = useRef(null)
  const sphereLabelRef = useRef(null)

  // Referencia a nuestra cámara Pinhole simulada
  const pinholeCamRef = useRef(null)

  // Herramienta interactiva de calibración (Leva GUI)
  const controls = useControls({
    viewMode: { options: ['Observer', 'Pinhole'], value: 'Pinhole', label: 'Modo de Vista' },
    fov: { value: 60, min: 10, max: 120, step: 1, label: 'Campo de Visión (FOV)' },
    near: { value: 0.1, min: 0.1, max: 5, step: 0.1, label: 'Plano Cercano Z' },
    far: { value: 1000, min: 10, max: 2000, step: 10, label: 'Plano Lejano Z' },
    camX: { value: 0, min: -10, max: 10, step: 0.1, label: 'Posición Cam X' },
    camY: { value: 2, min: -10, max: 10, step: 0.1, label: 'Posición Cam Y' },
    camZ: { value: 6, min: -10, max: 20, step: 0.1, label: 'Posición Cam Z' },
    k1: { value: 0, min: -1, max: 1, step: 0.05, label: 'Distorsión Radial (k1)' },
    k2: { value: 0, min: -10, max: 10, step: 0.1, label: 'Distorsión Radial (k2)' },
  })

  // Hook genérico de Drei para visualizar el frustum (Cono de visión) de una cámara elegida.
  // Es la pirámide que corta todo lo que no se renderiza en la pantalla real.
  // SOLO lo activamos en modo observador porque no tiene sentido desde el punto de vista del pinhole mismo.
  useHelper(controls.viewMode === 'Observer' ? pinholeCamRef : null, THREE.CameraHelper)

  useFrame(() => {
    if (pinholeCamRef.current && boxRef.current && sphereRef.current) {

      // Mantenemos la cámara siempre mirando al origen para la calibración
      pinholeCamRef.current.position.set(controls.camX, controls.camY, controls.camZ)
      pinholeCamRef.current.lookAt(0, 0, 0)

      // Es vital actualizar todas las matrices después de mover la cámara
      // De lo contrario la proyección 2D estaría un frame desactualizada o sería incorrecta
      pinholeCamRef.current.updateMatrixWorld()
      pinholeCamRef.current.updateProjectionMatrix()

      // Procedimiento: Extraer pos y proyectar a 2D para la CADA objeto

      // 1. CUBO
      const boxWorldPos = new THREE.Vector3()
      boxRef.current.getWorldPosition(boxWorldPos) // Pasa posición a matriz global de ThreeJS
      const box2D = project3DTo2D(boxWorldPos, pinholeCamRef.current, size.width, size.height)

      // 2. ESFERA
      const sphereWorldPos = new THREE.Vector3()
      sphereRef.current.getWorldPosition(sphereWorldPos)
      const sphere2D = project3DTo2D(sphereWorldPos, pinholeCamRef.current, size.width, size.height)

      // Se actualizan los Div de HTML usando DOM Ref en lugar de React State
      // Modificar el estilo CSS directo en cada `raf` cuesta casi costo 0 comparado con react-reconciler.
      if (boxLabelRef.current) {
        // z < 1 y z > -1 significa que el vector proyectado pertenece al frustum visible de la cámara
        if (box2D.z < 1 && box2D.z > -1 && controls.viewMode === 'Pinhole') {
          boxLabelRef.current.style.display = 'block'
          boxLabelRef.current.style.transform = `translate(calc(${box2D.x}px - 50%), calc(${box2D.y}px - 100%))`
          boxLabelRef.current.innerText = `Cubo: (X:${Math.round(box2D.x)}, Y:${Math.round(box2D.y)})`
        } else {
          boxLabelRef.current.style.display = 'none'
        }
      }

      if (sphereLabelRef.current) {
        if (sphere2D.z < 1 && sphere2D.z > -1 && controls.viewMode === 'Pinhole') {
          sphereLabelRef.current.style.display = 'block'
          sphereLabelRef.current.style.transform = `translate(calc(${sphere2D.x}px - 50%), calc(${sphere2D.y}px - 100%))`
          sphereLabelRef.current.innerText = `Esfera: (X:${Math.round(sphere2D.x)}, Y:${Math.round(sphere2D.y)})`
        } else {
          sphereLabelRef.current.style.display = 'none'
        }
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Escena 3D Conocida: Objetos estáticos */}
      <mesh ref={boxRef} position={[-2, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh ref={sphereRef} position={[2, 0.5, -2]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>

      <gridHelper args={[20, 20]} />
      <axesHelper args={[5]} />

      {/* Cámara Pinhole (Objetivo en estudio) */}
      <PerspectiveCamera
        ref={pinholeCamRef}
        makeDefault={controls.viewMode === 'Pinhole'}
        fov={controls.fov}
        near={controls.near}
        far={controls.far}
      />

      {/* Cámara Observadora Independiente */}
      {/* Esta es libre para recorrer el escenario y notar cómo opera la cámara Pinhole */}
      {controls.viewMode === 'Observer' && (
        <>
          <PerspectiveCamera makeDefault position={[5, 10, 10]} fov={50} />
          <OrbitControls makeDefault />
        </>
      )}

      {/* Pipeline de Efectos: Renderiza la distorsion óptica natural en el postprocesado */}
      {/* Los defectos del cristal de un lente (distancia radial) se emulan calculando el tensor de offset radial k1, k2 */}
      {controls.viewMode === 'Pinhole' && (
        <EffectComposer disableNormalPass>
          <LensDistortion k1={controls.k1} k2={controls.k2} />
        </EffectComposer>
      )}

      {/* Capa plana de UI 2D HTML superpuesta sobre el Canvas WebGL 3D */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div ref={boxLabelRef} className="coord-marker" style={{ display: 'none' }}>Cubo</div>
        <div ref={sphereLabelRef} className="coord-marker" style={{ display: 'none' }}>Esfera</div>
      </Html>
    </>
  )
}

function App() {
  return (
    // flat y linear a menudo ayudan a que las representaciones científicas y matemáticas 
    // sean más puras y eviten el tone mapping innecesario
    <Canvas flat linear camera={{ position: [5, 10, 10] }}>
      <PinholeCalibrationScene />
    </Canvas>
  )
}

export default App
