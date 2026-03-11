# Taller Jerarquías y Transformaciones: El Árbol del Movimiento

**Nombre del estudiante:** Esteban Barrera Sanabria

**Fecha de entrega:** 21 de febrero de 2026

---

## Descripción

El objetivo del taller es aplicar estructuras jerárquicas y árboles de transformación para organizar escenas y simular movimiento relativo entre objetos. 
En escencia, se busca comprender cómo las transformaciones afectan a los nodos hijos en una estructura padre-hijo y cómo visualizar estos efectos en tiempo real.

**Entornos utilizados:**
- Three.js (Vite + React)
- Unity (versión LTS)

---

## Implementaciones

### 1) Three.js (Vite + React)

**Herramientas utilizadas:**
- Three.js
- React (`useRef`, `useEffect`)
- dat.GUI
- Vite

Se implementó con Three.js directamente en React via useRef/useEffect, logrando el mismo resultado que React Three Fiber pero con la API imperativa de Three.js.

**Funcionalidades implementadas:**
1. Crear una jerarquía de 3 niveles con `THREE.Group`: `solarSystem` → `earthOrbit` → `moonOrbit`.
2. Aplicar transformaciones (rotación Y y traslación X) al nodo raíz `solarSystem` y observar cómo los hijos heredan el movimiento.
3. Controlar rotación y traslación del padre en tiempo real con sliders de `dat.GUI`.
4. Animación continua de órbitas: la Tierra orbita el Sol y la Luna orbita la Tierra.
5. **BONUS:** tercer nivel de jerarquía (`moonOrbit` dentro de `earthOrbit`) que demuestra transformaciones encadenadas.

---

### 2) Unity (versión LTS)

**Herramientas utilizadas:**
- Unity (LTS)
- C#

**Funcionalidades implementadas:**
1. Escena con al menos 3 objetos anidados jerárquicamente: padre → hijo → nieto.
2. Script `ParentController.cs` que controla posición, rotación y escala del nodo padre mediante sliders de UI, esto quiere deicr que los objetos hijos heredan automáticamente todas las transformaciones del padre.
3. Visualización en tiempo real de posición, rotación y escala actuales en un Text de UI.
4. **BONUS:** animación automática de rotación del padre con botón para pausar/reanudar (`ToggleAnimation`) y botón de reset (`ResetTransform`).

---

## Resultados Visuales

### Three.js

![Three.js captura 1](media/threejs1.gif)

*Vista general del sistema solar con jerarquía padre-hijo-nieto*

![Three.js GIF](media/threejs2.gif)

*Animación mostrando la herencia de transformaciones en tiempo real*

![Three.js GIF](media/threejs1.png)

*Visualización de los controles dinamicos de rotación y traslación*

---

### Unity

![Unity captura 1](media/unity1.png)

*Escena Unity con jerarquía padre → hijo → nieto y panel de UI*

![Unity captura 2](media/unity2.png)

*Jerarquia mostrada efectivamente en 'Hierarchy' de Unity UI*

![Unity GIF](media/unity1.gif)

*GIF mostrando el movimiento heredado y los sliders en acción*

---

## Código Relevante

**Jerarquía de grupos en Three.js:**
```javascript
const solarSystem = new THREE.Group();
const earthOrbit  = new THREE.Group();
const moonOrbit   = new THREE.Group();

earth.position.x    = 12;
moonOrbit.position.x = 12;
moon.position.x      = 4;

solarSystem.add(sun);
earthOrbit.add(earth);
earthOrbit.add(moonOrbit);
moonOrbit.add(moon);
solarSystem.add(earthOrbit);
scene.add(solarSystem);
```

**Control del padre con dat.GUI (Three.js):**
```javascript
const params = { rotationY: 0, positionX: 0 };
gui.add(params, 'rotationY', -Math.PI, Math.PI, 0.01)
   .name('Rotación Y')
   .onChange(v => { solarSystem.rotation.y = v; });
gui.add(params, 'positionX', -10, 10, 0.1)
   .name('Traslación X')
   .onChange(v => { solarSystem.position.x = v; });
```

**Transformaciones con sliders en Unity (C#):**
```csharp
void UpdatePosition(float value) {
    parentObject.position = new Vector3(value, 0, 0);
}
void UpdateRotation(float value) {
    parentObject.rotation = Quaternion.Euler(0, value, 0);
}
void UpdateScale(float value) {
    parentObject.localScale = Vector3.one * value;
}
```

---

## Prompts Utilizados

Durante el desarrollo se utilizaron herramientas de IA generativa para:

- Estructurar la jerarquía de grupos en Three.js y posicionar correctamente los objetos hijos.
- Resolver dudas sobre cómo conectar los sliders de Unity UI a las transformaciones del padre en C#.

Los prompts se enfocaron principalmente en corrección de errores y orientación sobre la API de Three.js y Unity.

---

## Aprendizajes y Dificultades

### Aprendizajes
- Las transformaciones aplicadas a un nodo padre se propagan automáticamente a todos sus hijos, lo que permite organizar escenas complejas de forma modular.
- En Three.js, `THREE.Group` es equivalente a un nodo vacío que solo lleva transformaciones; permite anidar objetos sin necesidad de una geometría propia.
- En Unity, la jerarquía del panel *Hierarchy* refleja directamente el árbol de transformaciones; mover el padre en código o en escena afecta a todos los descendientes.
- El uso de `dat.GUI` / UI Sliders permite iterar rápidamente sobre valores de transformación sin recompilar.

### Dificultades
- En Unity, al animar la rotación del padre en `Update()` y también controlarla con slider, fue necesario separar la lógica de animación del valor del slider para evitar conflictos.
- Asegurarse de que `dat.GUI` se destruya correctamente en el cleanup de `useEffect` para evitar instancias duplicadas al recargar en modo desarrollo.

---
