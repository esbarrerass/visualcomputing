import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function SolarSystem({ onUpdateMatrix }) {
  const sunRef = useRef();
  const earthRef = useRef();
  const moonRef = useRef();

  // Variables para la animación
  const time = useRef(0);

  // Instanciar matrices una sola vez para evitar garbage collection excesivo
  const mTranslationSun = new THREE.Matrix4();
  const mRotationSunY = new THREE.Matrix4();
  
  const mTranslationEarth = new THREE.Matrix4();
  const mRotationEarthY = new THREE.Matrix4();
  const mEarthLocal = new THREE.Matrix4();
  
  const mTranslationMoon = new THREE.Matrix4();
  const mRotationMoonY = new THREE.Matrix4();
  const mMoonLocal = new THREE.Matrix4();

  useFrame((state, delta) => {
    time.current += delta;
    const t = time.current;

    /**
     * EL SOL (Centro global)
     */
    if (sunRef.current) {
      // 1. Matriz de rotación (rotación sobre su propio eje)
      mRotationSunY.makeRotationY(t * 0.2); // El sol rota lentamente
      
      // Aplicar al Sol (El sol está en el origen, no hay traslación)
      sunRef.current.matrix.copy(mRotationSunY);
      
      // Enviar la matriz (global) al UI (cada varios frames para no ahogar React)
      if (Math.floor(t * 60) % 10 === 0) {
        onUpdateMatrix('sun', sunRef.current.matrix.clone());
      }
    }

    /**
     * LA TIERRA (Hijo Local del Sol)
     */
    if (earthRef.current) {
      // 1. Matriz de rotación (órbita alrededor de su centro local, que está "atado" al lugar donde lo traslademos)
      // Como es hijo del Sol, si solo aplicamos una traslación X fija, 
      // y rotamos primero Y, la Tierra orbitaría el Sol.
      // 
      // Composición: Traslación * RotaciónOrbitral * RotaciónEje(opcional)
      
      // Para orbitar alrededor de su padre:
      mRotationEarthY.makeRotationY(t * 1.5); // Rotación de órbita
      mTranslationEarth.makeTranslation(8, 0, 0); // Radio de la órbita = 8 unidades

      // Composición: M_local = RotacionY * TraslaciónX
      // En Three.js, multiply() hace A = A * B.
      mEarthLocal.identity();
      mEarthLocal.multiply(mRotationEarthY); // Primero rota alrededor del (0,0,0) del Sol
      mEarthLocal.multiply(mTranslationEarth); // Luego se traslada 8 unidades hacia afuera del nuevo eje X rotado

      // Además, si queremos que la Tierra rote sobre sí misma (spin), concatenamos una rotación más.
      const spinEarth = new THREE.Matrix4().makeRotationY(t * 4);
      mEarthLocal.multiply(spinEarth);

      // Asignar matriz. Al ser hijo (scene graph) del Sol, la matriz global de la Tierra será:
      // M_global_Earth = M_global_Sun * mEarthLocal
      // Pero aquí modificamos la LOCAL directmente porque `matrixAutoUpdate` está apagado.
      earthRef.current.matrix.copy(mEarthLocal);
      
      if (Math.floor(t * 60) % 10 === 0) {
        onUpdateMatrix('earth', earthRef.current.matrix.clone());
      }
    }

    /**
     * LA LUNA (Hijo Local de la Tierra)
     */
    if (moonRef.current) {
      // Similarmente, la luna órbita a la Tierra.
      mRotationMoonY.makeRotationY(t * 5); // La luna orbita más rápido
      mTranslationMoon.makeTranslation(2, 0, 0); // Radio de la órbita = 2 unidades
      
      mMoonLocal.identity();
      mMoonLocal.multiply(mRotationMoonY);
      mMoonLocal.multiply(mTranslationMoon);
      
      moonRef.current.matrix.copy(mMoonLocal);

      if (Math.floor(t * 60) % 10 === 0) {
        onUpdateMatrix('moon', moonRef.current.matrix.clone());
      }
    }
  });

  return (
    <group>
      {/* EL SOL */}
      <mesh ref={sunRef} matrixAutoUpdate={false}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fca311" />
        {/* Ejes para visualizar el sistema de coordenadas local. Rojo=X, Verde=Y, Azul=Z */}
        <axesHelper args={[4]} />

        {/* LA TIERRA (Hijo del Sol) */}
        <mesh ref={earthRef} matrixAutoUpdate={false}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#4ea8de" roughness={0.4} metalness={0.1} />
          <axesHelper args={[2]} />

          {/* LA LUNA (Hijo de la Tierra) */}
          <mesh ref={moonRef} matrixAutoUpdate={false}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#e5e5e5" roughness={0.8} />
            <axesHelper args={[1]} />
          </mesh>
        </mesh>
      </mesh>
    </group>
  );
}
