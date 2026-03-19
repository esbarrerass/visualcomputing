# Taller transformaciones homogéneas y cambios de base

**Nombre de los estudiantes:** Sebastián Andrade Cedano, Esteban Barrera Sanabria, Gabriel Andres Anzola Tachak, Angel Santiago Avendaño Cañon, Jorge Isaac Alandete Diaz

**Fecha de entrega:** 27 de febrero de  2026

## Descricion breve

El objetivo del taller aplicar transformaciones y coordenadas homogeneas en róbotica y gráficos por computador.

## Implementaciones

### 1) Python

El modelo que se vá a utilizar consiste en un brazo robotico con 3 articulaciones (hombro, codo, muñeca, o shoulder, elbow and wrist en inglés). Y existe una herencia de forma que el codo, y muñeca heredan el movimiento del hombro, la muñeca y la mano el del codo, y la muñeca se encarga únicamente de mover la mano. Cada una de esas partes del brazo tiene su sistema de coordenadas independiente, y el hombro se encuentra anclado al origen por simplicidad.

![sample0](./media/newplot.png)

Cada articulación tiene dos matrices de transformación, una local, representando sus coordenadas con respecto al padre, y otra global, representando las coordenadas con respecto al mundo, la cual se define de la siguiente forma:

$$M_{global hijo} = M_{global padre} * M_{local hijo}$$

Y en nuestro modelo, debido a que el codo rota con respecto al hombro (el cual está en el origen), entonces se tiene que:

$$ M*{global codo} = M*{local codo}$$

Definimos unas coordenadas inciales, y guardamos las matrices "base" para poder hacer las transformaciones en base a estas después.

```python
# Coordinates relative to its father (local)
shoulder = np.array([[0,0,0,1]]).T
elbow = np.array([[4,0,0,1]]).T
wrist = np.array([[2,0,0,1]]).T
hand = np.array([[1,0,0,1]]).T

M_elbow = np.eye(4)
M_elbow[:,3] = elbow[:,0]

Ml_wrist = np.eye(4)
Ml_wrist[:,3] = wrist[:,0]
Mg_wrist = M_elbow @ Ml_wrist

Ml_hand = np.eye(4)
Ml_hand[:,3] = hand[:,0]
Mg_hand = Mg_wrist @ Ml_hand


M_elbow_base = M_elbow.copy()
Ml_wrist_base = Ml_wrist.copy()
Mg_wrist_base = Mg_wrist.copy()
Ml_hand_base = Ml_hand.copy()
Mg_hand_base = Mg_hand.copy()
```

Después de definió una función general para obtener la matriz de rotación de cada eje `x,y,z`.

```python
def rotationMatrix(theta, axis):
    if axis == 'z':
      return np.array([
          [np.cos(theta), -1*np.sin(theta), 0, 0],
          [np.sin(theta), np.cos(theta), 0, 0],
          [0,0,1,0],
          [0,0,0,1]
      ])
    elif axis == 'x':
        return np.array([
            [1, 0, 0, 0],
            [0, np.cos(theta), -1*np.sin(theta), 0],
            [0, np.sin(theta), np.cos(theta), 0],
            [0,0,0,1]

        ])
    elif axis == 'y':
        return np.array([
            [np.cos(theta), 0, np.sin(theta), 0],
            [0,1,0,0],
            [-np.sin(theta),0,np.cos(theta),0],
            [0,0,0,1]
        ])
    else:
      raise Exception("Invalid axis")
```

Despues se definió una función para manejar las rotaciones de cada articulación y que se encarga de propagar estas rotaciones a sus respectivos hijos.

---

#### Función para rotar la articulación del hombro

```python
def rotateShoulder(theta, axis):
    global M_elbow, Ml_wrist, Mg_wrist, Ml_hand, Mg_hand, elbow_t_x, elbow_t_y, elbow_t_z

    if axis == 'z':
      matrix = rotationMatrix(elbow_t_x, 'x') @ rotationMatrix(elbow_t_y, 'y') @ rotationMatrix(theta, 'z')
      elbow_t_z = theta
    elif axis == 'x':
      matrix = rotationMatrix(theta, 'x') @ rotationMatrix(elbow_t_y, 'y') @ rotationMatrix(elbow_t_z, 'z')
      elbow_t_x = theta
    elif axis == 'y':
      matrix = rotationMatrix(elbow_t_x, 'x') @ rotationMatrix(theta, 'y') @ rotationMatrix(elbow_t_z, 'z')
      elbow_t_y = theta
    else:
      raise Exception("Invalid axis")

    # Perform rotation
    M_elbow = matrix @ M_elbow_base

    # Update children
    Mg_wrist = M_elbow @ Ml_wrist
    Mg_hand = Mg_wrist @ Ml_hand
```

#### Función para rotar la articulación del codo

```python
def rotateElbow(theta, axis):
    global M_elbow, Ml_wrist, Mg_wrist, Ml_hand, Mg_hand, wrist_t_x, wrist_t_y, wrist_t_z

    if axis == 'z':
      matrix = rotationMatrix(wrist_t_x, 'x') @ rotationMatrix(wrist_t_y, 'y') @ rotationMatrix(theta, 'z')
      wrist_t_z = theta
    elif axis == 'x':
      matrix = rotationMatrix(theta, 'x') @ rotationMatrix(wrist_t_y, 'y') @ rotationMatrix(wrist_t_z, 'z')
      wrist_t_x = theta
    elif axis == 'y':
      matrix = rotationMatrix(wrist_t_x, 'x') @ rotationMatrix(theta, 'y') @ rotationMatrix(wrist_t_z, 'z')
      wrist_t_y = theta
    else:
      raise Exception("Invalid axis")

    # Perform rotation
    Ml_wrist = matrix @ Ml_wrist_base
    Mg_wrist = M_elbow @ Ml_wrist
    # Update children
    Mg_hand = Mg_wrist @ Ml_hand
```

#### Función para rotar la articulación de la muñeca

```python
def rotateWrist(theta, axis):
    global M_elbow, Ml_wrist, Mg_wrist, Ml_hand, Mg_hand, hand_t_x, hand_t_y, hand_t_z

    if axis == 'z':
      matrix = rotationMatrix(hand_t_x, 'x') @ rotationMatrix(hand_t_y, 'y') @ rotationMatrix(theta, 'z')
      hand_t_z = theta
    elif axis == 'x':
      matrix = rotationMatrix(theta, 'x') @ rotationMatrix(hand_t_y, 'y') @ rotationMatrix(hand_t_z, 'z')
      hand_t_x = theta
    elif axis == 'y':
      matrix = rotationMatrix(hand_t_x, 'x') @ rotationMatrix(theta, 'y') @ rotationMatrix(hand_t_z, 'z')
      hand_t_y = theta
    else:
      raise Exception("Invalid axis")

    # Perform rotation
    Ml_hand = matrix @ Ml_hand_base
    Mg_hand = Mg_wrist @ Ml_hand
```

Despues de esto se generó un gráfico interactivo con Plotly, el cual permite manejar la rotaciones de cada articulación independiente por medio de sliders.

#### Gráfico interactivo

![idk](./media/brazo_robot.gif)

---

### 2) Unity

Aplicar transformaciones homogéneas en coordenadas 2D y 3D, comprender la composición de transformaciones, realizar cambios de base entre sistemas de referencia, y aplicar estos conceptos en robótica y gráficos por computador.

![alt text](./media/Unity_Carro.png)

Sobre las llantas se realizan transformaciones de rotación, haciendo una trasformacion diferente sobre cada una de las llantas.

Sobre la primera llanta se realiza una conversación local mediante Transform.position variando mediante una velocidad de rotacion y un delta de tiempo.

```c#
    public class Llanta : MonoBehaviour
    {
        public float velocidadRotacion = 67f; // grados por segundo

        void Update()
        {
            transform.Rotate(Vector3.up * velocidadRotacion * Time.deltaTime, Space.Self);
        }
    }
```

Sobre la sergunda llanta se realiza una rotación local mediante conversiones entre Quaternion y Matrix4x4 primero se convierte la rotación actual en matriz, se crea otra matriz con el ángulo incremental calculado por la velocidad y deltaTime, luego se multiplican ambas matrices para combinar las rotaciones y finalmente se convierte la matriz resultante de nuevo a Quaternion para aplicarla al transform.localRotation

```c#
public class Llanta_matrix : MonoBehaviour
{
    public float velocidadRotacion = 67f; // grados por segundo
    void Update()
    {
        float angulo = velocidadRotacion * Time.deltaTime;
        Matrix4x4 rotacion = Matrix4x4.Rotate(Quaternion.Euler(0f, angulo, 0f));
        Matrix4x4 actual = Matrix4x4.Rotate(transform.localRotation);   // Convierte la rotación actual del transform en matriz
        Matrix4x4 resultado = actual * rotacion;      // Aplica la rotación multiplicando matrices
        transform.localRotation = resultado.rotation;
    }
}
```

#### Escena interactiva

Se dibujaron los ejes con locales del objeto en la escena usando Gizmos, extendiendo cada linea desde la posición del objeto hasta 1 cordenada.

![alt text](./media/Unity_ejes.png)

Asi ejecutando las rotaciones de las llantas y una traslacion constante sobre el Chasis se genera la siguiente animacion

![alt text](./media/Unity_animacion.gif)

---

### 3) Three.js

Para la implementación en Three.js (empleando la librería React Three Fiber), se desarrolló un sistema solar animado (Sol, Tierra, Luna) para demostrar las transformaciones, anidación de coordenadas locales frente a globales y la aplicación de matemáticas manuales con matrices de transformación equivalentes a la versión de Python, pero en el contexto de animaciones directas.

A diferencia de React puro donde el estado re-renderiza todo constantemente, para animar sin costo de rendimiento se apagó la actualización automática de matrices (`matrixAutoUpdate={false}`) en cada nodo u objeto, y se aplicaron manipulaciones con `THREE.Matrix4` usando el hook `useFrame`.

La Luna orbita alrededor del sistema local de la Tierra, que a su vez orbita en el sistema global del Sol.

```javascript
// Órbita de la Luna (Hijo Local de la Tierra)
if (moonRef.current) {
  mRotationMoonY.makeRotationY(t * 5); // Rotación
  mTranslationMoon.makeTranslation(2, 0, 0); // Radio de la órbita = 2

  mMoonLocal.identity();
  mMoonLocal.multiply(mRotationMoonY);
  mMoonLocal.multiply(mTranslationMoon);

  moonRef.current.matrix.copy(mMoonLocal); // Aplicar matriz manualmente
}
```

Para visualizar que las transformaciones sí están ocurriendo a nivel algorítmico, también se captura y se muestra constantemente en UI la matriz 4x4 completa de cada cuerpo celeste, demostrando que:

1. El Sol, al estar en el origen pero con un Spin (`makeRotationY`), solo varía sus componentes de rotación.
2. La Tierra y la Luna componen rotación y traslación, variando también la cuarta columna (X, Y, Z globales, limitados a su Frame Local).
3. Todas tienen un sistema de ejes `axesHelper` para dar feedback visual a las transformaciones locales.

#### Escena en tiempo real

![idk](./media/threejs_solar_system.gif)

## Aprendizajes y dificultades

- Fué dificil poder generar el gráfico interactivo de la manera correcta para que no generara parpadeos ni auto-escalamientos extraños que afectaran su estética.
- Es necesaria una matriz de rotación por cada eje cuando se trabaja en tercera dimensión, sin embargo se puede calcular el producto entre estas para tener una única matriz de rotación.
- En `React Three Fiber`, hay que tener cuidado con las dependencias desactualizadas (como la discrepancia de compatibilidad entre React 19 y versiones antiguas de `@react-three/drei`), para lo cual la solución más limpia terminó siendo usar controles vanilla directamente extraídos de `three/addons`.
