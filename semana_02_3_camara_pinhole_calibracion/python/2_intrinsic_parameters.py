import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def create_intrinsic_matrix(fx, fy, cx, cy):
    """
    Crea la matriz intrínseca K de la cámara.

    K = [fx  0  cx]
        [0  fy  cy]
        [0   0   1]

    Args:
        fx: Distancia focal en píxeles (eje X)
        fy: Distancia focal en píxeles (eje Y)
        cx: Coordenada X del punto principal
        cy: Coordenada Y del punto principal

    Returns:
        Matriz K (3x3)
    """
    K = np.array([
        [fx, 0, cx],
        [0, fy, cy],
        [0, 0, 1]
    ], dtype=np.float64)

    return K

def project_with_intrinsics(points_3d, K):
    """
    Proyecta puntos 3D a 2D usando la matriz intrínseca K.

    Args:
        points_3d: Array de puntos 3D (N, 3)
        K: Matriz intrínseca (3x3)

    Returns:
        Array de puntos 2D en píxeles (N, 2)
    """
    # Convertir a coordenadas homogéneas y transponer
    points_homogeneous = points_3d.T  # (3, N)

    # Proyección: p = K * P
    projected_homogeneous = K @ points_homogeneous  # (3, N)

    # Normalizar por la coordenada Z
    Z = projected_homogeneous[2, :]
    Z = np.where(Z == 0, 1e-10, Z)

    x = projected_homogeneous[0, :] / Z
    y = projected_homogeneous[1, :] / Z

    return np.column_stack([x, y])

def create_cube(size=1.0, center=[0, 0, 5]):
    """Crea los vértices de un cubo en 3D."""
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
    vertices += center
    return vertices

def get_cube_edges():
    """Define las aristas del cubo."""
    return [
        (0, 1), (1, 2), (2, 3), (3, 0),
        (4, 5), (5, 6), (6, 7), (7, 4),
        (0, 4), (1, 5), (2, 6), (3, 7)
    ]

def visualize_intrinsic_effects():
    """
    Visualiza el efecto de diferentes parámetros intrínsecos en la proyección.
    """
    cube_vertices = create_cube(size=2.0, center=[0, 0, 5])
    edges = get_cube_edges()

    # Diferentes configuraciones de parámetros intrínsecos
    configs = [
        {"fx": 500, "fy": 500, "cx": 320, "cy": 240, "title": "Estándar (fx=fy=500)"},
        {"fx": 800, "fy": 800, "cx": 320, "cy": 240, "title": "Mayor focal (fx=fy=800)"},
        {"fx": 500, "fy": 800, "cx": 320, "cy": 240, "title": "Distorsión (fx=500, fy=800)"},
        {"fx": 500, "fy": 500, "cx": 400, "cy": 300, "title": "Centro desplazado"}
    ]

    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    axes = axes.flatten()

    for idx, config in enumerate(configs):
        K = create_intrinsic_matrix(config["fx"], config["fy"], config["cx"], config["cy"])
        projected = project_with_intrinsics(cube_vertices, K)

        ax = axes[idx]
        ax.set_title(config["title"])
        ax.set_xlabel('x (píxeles)')
        ax.set_ylabel('y (píxeles)')
        ax.grid(True, alpha=0.3)

        # Dibujar aristas
        for edge in edges:
            points = projected[list(edge)]
            ax.plot(points[:, 0], points[:, 1], 'b-', linewidth=2)

        # Dibujar vértices
        ax.scatter(projected[:, 0], projected[:, 1], c='red', s=50, marker='o')

        # Dibujar punto principal
        ax.scatter(config["cx"], config["cy"], c='green', s=100, marker='x',
                  linewidths=3, label='Punto principal')

        # Establecer límites
        ax.set_xlim(0, 640)
        ax.set_ylim(0, 480)
        ax.invert_yaxis()
        ax.legend()

        # Agregar información de la matriz K
        K_text = f"K =\n[{config['fx']:.0f}  0  {config['cx']:.0f}]\n" \
                 f"[0  {config['fy']:.0f}  {config['cy']:.0f}]\n" \
                 f"[0   0   1]"
        ax.text(0.02, 0.98, K_text, transform=ax.transAxes,
               fontsize=8, verticalalignment='top',
               bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.tight_layout()
    plt.savefig('../media/2_intrinsic_parameters.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/2_intrinsic_parameters.png")
    plt.show()

if __name__ == "__main__":
    print("=== Parámetros Intrínsecos de la Cámara ===")

    # Ejemplo de matriz intrínseca
    fx, fy = 500, 500  # Distancia focal en píxeles
    cx, cy = 320, 240  # Centro de la imagen (resolución 640x480)

    K = create_intrinsic_matrix(fx, fy, cx, cy)

    print("\nMatriz Intrínseca K:")
    print(K)

    # Ejemplo de proyección
    points_3d = np.array([
        [0, 0, 5],
        [1, 1, 5],
        [-1, 1, 5]
    ])

    projected = project_with_intrinsics(points_3d, K)

    print(f"\nPuntos 3D:\n{points_3d}")
    print(f"\nPuntos proyectados en píxeles:\n{projected}")

    # Visualizar efectos
    print("\nGenerando visualización de efectos intrínsecos...")
    visualize_intrinsic_effects()
