import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def project_pinhole(points_3d, focal_length):
    """
    Proyecta puntos 3D a 2D usando el modelo pinhole básico.
    Ecuaciones: x' = f * X/Z, y' = f * Y/Z

    Args:
        points_3d: Array de puntos 3D (N, 3) donde cada fila es [X, Y, Z]
        focal_length: Distancia focal f

    Returns:
        Array de puntos 2D (N, 2) donde cada fila es [x', y']
    """
    X = points_3d[:, 0]
    Y = points_3d[:, 1]
    Z = points_3d[:, 2]

    # Evitar división por cero
    Z = np.where(Z == 0, 1e-10, Z)

    x_prime = focal_length * X / Z
    y_prime = focal_length * Y / Z

    return np.column_stack([x_prime, y_prime])

def create_cube(size=1.0, center=[0, 0, 5]):
    """
    Crea los vértices de un cubo en 3D.

    Args:
        size: Tamaño del cubo
        center: Centro del cubo [X, Y, Z]

    Returns:
        Array de vértices (8, 3)
    """
    half = size / 2
    vertices = np.array([
        [-half, -half, -half],
        [half, -half, -half],
        [half, half, -half],
        [-half, half, -half],
        [-half, -half, half],
        [half, -half, half],
        [half, half, half],
        [-half, half, half]
    ])

    # Trasladar al centro
    vertices += center

    return vertices

def get_cube_edges():
    """
    Define las aristas del cubo como pares de índices de vértices.

    Returns:
        Lista de tuplas con índices de vértices conectados
    """
    return [
        (0, 1), (1, 2), (2, 3), (3, 0),  # Cara frontal
        (4, 5), (5, 6), (6, 7), (7, 4),  # Cara trasera
        (0, 4), (1, 5), (2, 6), (3, 7)   # Conexiones entre caras
    ]

def visualize_projection(focal_lengths=[1.0, 2.0, 4.0]):
    """
    Visualiza la proyección de un cubo 3D con diferentes distancias focales.

    Args:
        focal_lengths: Lista de distancias focales a probar
    """
    # Crear cubo en 3D
    cube_vertices = create_cube(size=2.0, center=[0, 0, 5])
    edges = get_cube_edges()

    fig = plt.figure(figsize=(15, 5))

    # Visualizar cubo 3D
    ax1 = fig.add_subplot(1, len(focal_lengths) + 1, 1, projection='3d')
    ax1.set_title('Cubo 3D Original')
    ax1.set_xlabel('X')
    ax1.set_ylabel('Y')
    ax1.set_zlabel('Z')

    # Dibujar aristas del cubo 3D
    for edge in edges:
        points = cube_vertices[list(edge)]
        ax1.plot3D(points[:, 0], points[:, 1], points[:, 2], 'b-', linewidth=2)

    # Dibujar vértices
    ax1.scatter(cube_vertices[:, 0], cube_vertices[:, 1], cube_vertices[:, 2],
                c='red', s=50, marker='o')

    # Proyectar con diferentes distancias focales
    for idx, f in enumerate(focal_lengths):
        projected = project_pinhole(cube_vertices, f)

        ax = fig.add_subplot(1, len(focal_lengths) + 1, idx + 2)
        ax.set_title(f'Proyección 2D (f={f})')
        ax.set_xlabel('x\'')
        ax.set_ylabel('y\'')
        ax.set_aspect('equal')
        ax.grid(True)

        # Dibujar aristas proyectadas
        for edge in edges:
            points = projected[list(edge)]
            ax.plot(points[:, 0], points[:, 1], 'b-', linewidth=2)

        # Dibujar vértices proyectados
        ax.scatter(projected[:, 0], projected[:, 1], c='red', s=50, marker='o')

        # Invertir eje Y para que coincida con convención de imagen
        ax.invert_yaxis()

    plt.tight_layout()
    plt.savefig('../media/1_pinhole_projection.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/1_pinhole_projection.png")
    plt.show()

if __name__ == "__main__":
    print("=== Modelo de Cámara Pinhole ===")
    print("Proyectando cubo 3D con diferentes distancias focales...")

    # Ejemplo simple
    points_3d = np.array([
        [0, 0, 5],
        [1, 1, 5],
        [-1, 1, 5]
    ])

    f = 2.0
    projected = project_pinhole(points_3d, f)

    print(f"\nPuntos 3D:\n{points_3d}")
    print(f"\nPuntos proyectados (f={f}):\n{projected}")

    # Visualizar con diferentes focales
    print("\nGenerando visualización...")
    visualize_projection([1.0, 2.0, 4.0])
