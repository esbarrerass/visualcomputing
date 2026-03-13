# Taller Construyendo Mundo 3D

**Nombre del estudiante:** Esteban Barrera Sanabria

**Fecha de entrega:** 21 de Febrero de 2026

---

## Descripción breve

El objetivo del taller fue comprender la estructura fundamental de una malla 3D a través de la identificación y visualización de sus componentes principales: vértices, aristas y caras.

Se desarrollaron implementaciones en dos entornos, ThreeJS y Python, cargando modelos 3D en formatos estándar (.GLTF), para visualizar su estructura geométrica y analizar su información interna (número de vértices, aristas y caras).

Se trabajó con:

1. Three.js (Vite + React Three Fiber)
2. Python (Jupyter Notebook) usando trimesh y vedo

---

## Implementaciones

### 1) Three.js (React Three Fiber)

**Herramientas utilizadas:**

- Three.js
- React Three Fiber (`@react-three/fiber`)
- Drei (`@react-three/drei`)
- Vite

**Funcionalidades implementadas:**

1. Carga de modelo 3D en formato `.gltf`
2. Visualización interactiva con `OrbitControls`
3. Modos de visualización:

- **Faces** (caras con material original)
- **Edges** (aristas usando `<Edges />`)
- **Wireframe** (malla estructural)
- **Vertices** (renderizado con `<points>`)

4. Interfaz para cambiar entre modos
5. Cálculo y visualización de numero total de vertices y numero total de caras

---

### 2) Python (Jupyter Notebook)

**Herramientas utilizadas:**

- trimesh
- vedo
- numpy
- matplotlib

**Funcionalidades implementadas:**

1. Carga de modelo `.gltf`
2. Conversión de `Scene` a `Trimesh`
3. Cálculo estructural de numero de vertices, nunero de aristas unicas y numero de caras.
4. Visualización diferenciada: Caras (🔵), vertices (🔴 ), aristas (🟢)
5. Configuración manual de cámara para mejor perspectiva

---

## Resultados Visuales

### Three.js

![`threejs_edges.png`](media/threejs_edges.png)

![`threejs_wireframe.png`](media/threejs_wireframe.png)

### Python

[`python_cat.png`](media/python_cat.png)

![`python_rat.png`](media/python_rat.png)

Cada captura muestra claramente la diferenciación entre vértices, aristas y caras.

---

## Código Relevante

### Conteo estructural en Python

```python
num_vertices = len(mesh.vertices)
num_faces = len(mesh.faces)
num_edges = len(mesh.edges_unique)
```

### Conteo estructural en Three.js

```tsx
totalVertices += geometry.attributes.position.count

if (geometry.index) {
  totalFaces += geometry.index.count / 3
}
```

### Visualización de vértices en Three.js

```tsx
<points geometry={mesh.geometry}>
  <pointsMaterial size={1} sizeAttenuation color="white" />
</points>
```

---

## Prompts Utilizados

Durante el desarrollo se utilizaron herramientas de IA generativa para:

1. Resolver errores de tipado en TypeScript.
2. Manejar conversión de `Scene` a `Trimesh`.

Los prompts se enfocaron esencialmente en corrección de errores de versiones específicos.

---

## Aprendizajes y Dificultades

### Aprendizajes

- Comprensión profunda de la estructura interna de una malla 3D.
- Diferencia entre vértices, aristas y caras a nivel geométrico.
- Uso de librerías científicas en Python para análisis estructural.

## Dificultades

- Manejo de escenas GLTF que cargan como `Scene` en lugar de `Mesh`.
- Ajuste de cámara y escala en visualización 3D.

---
