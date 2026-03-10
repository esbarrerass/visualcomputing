import { useRef, useEffect} from 'react'
import './App.css'
import * as THREE from 'three'
import sunImg from './assets/sun.jpeg'
import earthImg from './assets/earth.jpeg'
import moonImg from './assets/moon.jpeg'
import { GUI } from 'dat.gui'


export default function SolarSystem() {

  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 5, 25)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 10, 7.5)
    scene.add(light)

    const solarSystem = new THREE.Group();
    const earthOrbit = new THREE.Group();
    const moonOrbit = new THREE.Group();

    const loader = new THREE.TextureLoader()
    const sunTexture = loader.load(sunImg)
    const earthTexture = loader.load(earthImg)
    const moonTexture = loader.load(moonImg)

    const sun = new THREE.Mesh(new THREE.SphereGeometry(4), new THREE.MeshStandardMaterial({ map: sunTexture }))
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshStandardMaterial({ map: earthTexture }))
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial({ map: moonTexture }))

    earth.position.x = 12;
    moonOrbit.position.x = 12;
    moon.position.x = 4;

    solarSystem.add(sun);
    earthOrbit.add(earth);
    solarSystem.add(earthOrbit);
    moonOrbit.add(moon);
    earthOrbit.add(moonOrbit);
    scene.add(solarSystem);

    const gui = new GUI()
    const params = { rotationY: 0, positionX: 0}
    gui.add(params, 'rotationY', -Math.PI, Math.PI, 0.01).name('Rotación Y').onChange(v => {solarSystem.rotation.y = v})
    gui.add(params, 'positionX', -10, 10, 0.1).name('Traslación X').onChange(v => {solarSystem.position.x = v})


    let frameId

    const animate = () => {
      earthOrbit.rotation.y += 0.005;
      moonOrbit.rotation.y += 0.05;

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      gui.destroy()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', background: '#000' }} />
    </div>
  )
}