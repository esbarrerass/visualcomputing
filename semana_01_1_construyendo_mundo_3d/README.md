# Taller Construyendo Mundo 3D

**Nombre del estudiante:** Esteban Barrera Sanabria

**Fecha de entrega:** 21 de Febrero de 2026

---

# Descripción

El objetivo del taller fue comprender la estructura fundamental de una malla 3D a través de la identificación y visualización de sus componentes principales: vértices, aristas y caras.

Se desarrollaron implementaciones en dos entornos, ThreeJS y Python, cargando modelos 3D en formatos estándar (.GLTF), para visualizar su estructura geométrica y analizar su información interna (número de vértices, aristas y caras).

Se trabajó con:

* Vite + React Three Fiber (Three.js)
* Python (Jupyter / Colab) usando trimesh y vedo

---

# Implementaciones

## 1) Three.js (React Three Fiber)

### Herramientas utilizadas

* Vite
* React
* @react-three/fiber
* @react-three/drei
* Three.js

### Funcionalidades implementadas

1. Carga de modelo 3D en formato `.gltf`
2. Visualización interactiva con `OrbitControls`
3. Modos de visualización:

  * **Faces** (caras con material original)
  * **Edges** (aristas usando `<Edges />`)
  * **Wireframe** (malla estructural)
  * **Vertices** (renderizado con `<points>`)

4. Interfaz para cambiar entre modos
5. Cálculo y visualización de numero total de vertices y numero total de caras

### Conceptos aplicados

* BufferGeometry
* Geometría indexada
* Atributo `position`
* Triángulos (faces)
* Renderizado declarativo en React Three Fiber
* Diferencia entre wireframe y edges

---

## 2) Python (Jupyter / Colab)

### Herramientas utilizadas

* trimesh
* vedo
* numpy
* matplotlib

### Funcionalidades implementadas

1. Carga de modelo `.gltf`
2. Conversión de `Scene` a `Trimesh`
3. Cálculo estructural:

  * Número de vértices
  * Número de aristas únicas
  * Número de caras
4. Visualización diferenciada:

  * 🔵 Caras (lightblue)
  * 🔴 Vértices (Points en rojo)
  * 🟢 Aristas (boundaries en verde)
5. Configuración manual de cámara para mejor perspectiva

### Conceptos aplicados

* Malla triangular
* Aristas únicas (`edges_unique`)
* Representación estructural vs representación gráfica
* Concatenación de múltiples mallas en una escena

---

# Resultados Visuales

Las evidencias se encuentran en la carpeta:

```
media/
```

Aqui unos ejemplos por entorno:

## Three.js

* ![`threejs_edges.png`](media/threejs_edges.png)
* ![`threejs_wireframe.png`](media/threejs_wireframe.png)

## Python

* ![`python_cat.png`](media/python_cat.png)
* ![`python_rat.png`](media/python_rat.png)

Cada captura muestra claramente la diferenciación entre vértices, aristas y caras.

---

# Código Relevante

## Conteo estructural en Python

```python
num_vertices = len(mesh.vertices)
num_faces = len(mesh.faces)
num_edges = len(mesh.edges_unique)
```

## Conteo estructural en Three.js

```tsx
totalVertices += geometry.attributes.position.count

if (geometry.index) {
  totalFaces += geometry.index.count / 3
}
```

## Visualización de vértices en Three.js

```tsx
<points geometry={mesh.geometry}>
  <pointsMaterial size={1} sizeAttenuation color="white" />
</points>
```

---

# Prompts Utilizados

Durante el desarrollo se utilizaron herramientas de IA generativa para:

* Resolver errores de tipado en TypeScript.
* Manejar conversión de `Scene` a `Trimesh`.

Los prompts se enfocaron esencialmente en corrección de errores de versiones específicos.

---

# Aprendizajes y Dificultades

## Aprendizajes

* Comprensión profunda de la estructura interna de una malla 3D.
* Diferencia entre vértices, aristas y caras a nivel geométrico.
* Uso de librerías científicas en Python para análisis estructural.

## Dificultades

* Manejo de escenas GLTF que cargan como `Scene` en lugar de `Mesh`.
* Ajuste de cámara y escala en visualización 3D.

---

# Conclusión

El taller permitió comprender cómo una malla 3D está compuesta estructuralmente por vértices conectados mediante aristas que forman caras triangulares.

La implementación en distintos entornos permitió analizar tanto la representación gráfica como la estructura matemática subyacente del modelo 3D, fortaleciendo la comprensión de los fundamentos de la computación visual.
