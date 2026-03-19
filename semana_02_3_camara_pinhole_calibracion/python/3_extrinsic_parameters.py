import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def create_rotation_matrix_x(angle_deg):
    """Crea matriz de rotación alrededor del eje X."""
    angle = np.radians(angle_deg)
    return np.array([
        [1, 0, 0],
        [0, np.cos(angle), -np.sin(angle)],
        [0, np.sin(angle), np.cos(angle)]
    ])

def create_rotation_matrix_y(angle_deg):
    """Crea matriz de rotación alrededor del eje Y."""
    angle = np.radians(angle_deg)
    return np.array([
        [np.cos(angle), 0, np.sin(angle)],
        [0, 1, 0],
        [-np.sin(angle), 0, np.cos(angle)]
    ])

def create_rotation_matrix_z(angle_deg):
    """Crea matriz de rotación alrededor del eje Z."""
    angle = np.radians(angle_deg)
    return np.array([
        [np.cos(angle), -np.sin(angle), 0],
        [np.sin(angle), np.cos(angle), 0],
        [0, 0, 1]
    ])

def world_to_camera(points_world, R, t):
    """
    Transforma puntos del sistema de coordenadas del mundo al de la cámara.

    Args:
        points_world: Puntos en coordenadas del mundo (N, 3)
        R: Matriz de rotación (3x3)
        t: Vector de traslación (3,) o (3, 1)

    Returns:
        Puntos en coordenadas de cámara (N, 3)
    """
    t = t.flatten()
    points_camera = (R @ points_world.T).T + t
    return points_camera

def create_intrinsic_matrix(fx, fy, cx, cy):
    """Crea la matriz intrínseca K."""
    return np.array([
        [fx, 0, cx],
        [0, fy, cy],
        [0, 0, 1]
    ], dtype=np.float64)

def project_with_intrinsics(points_3d, K):
    """Proyecta puntos 3D a 2D usando la matriz intrínseca."""
    points_homogeneous = points_3d.T
    projected_homogeneous = K @ points_homogeneous

    Z = projected_homogeneous[2, :]
    Z = np.where(Z == 0, 1e-10, Z)

    x = projected_homogeneous[0, :] / Z
    y = projected_homogeneous[1, :] / Z

    return np.column_stack([x, y])

def full_projection(points_world, K, R, t):
    """
    Proyección completa: mundo -> cámara -> imagen.

    Args:
        points_world: Puntos en coordenadas del mundo (N, 3)
        K: Matriz intrínseca (3x3)
        R: Matriz de rotación (3x3)
        t: Vector de traslación (3,)

    Returns:
        Puntos proyectados en píxeles (N, 2)
    """
    # 1. Transformar de mundo a cámara (extrínsecos)
    points_camera = world_to_camera(points_world, R, t)

    # 2. Proyectar a imagen (intrínsecos)
    points_image = project_with_intrinsics(points_camera, K)

    return points_image

def create_cube(size=1.0, center=[0, 0, 0]):
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

def visualize_camera_motion():
    """
    Visualiza el efecto de mover la cámara (parámetros extrínsecos).
    """
    # Cubo en el origen del mundo
    cube_vertices = create_cube(size=2.0, center=[0, 0, 0])
    edges = get_cube_edges()

    # Matriz intrínseca fija
    K = create_intrinsic_matrix(fx=500, fy=500, cx=320, cy=240)

    # Diferentes posiciones y orientaciones de cámara
    configs = [
        {
            "R": np.eye(3),
            "t": np.array([0, 0, 5]),
            "title": "Cámara frontal (z=5)"
        },
        {
            "R": create_rotation_matrix_y(30),
            "t": np.array([2, 0, 5]),
            "title": "Rotación 30° en Y + traslación X"
        },
        {
            "R": create_rotation_matrix_x(20),
            "t": np.array([0, 2, 5]),
            "title": "Rotación 20° en X + traslación Y"
        },
        {
            "R": create_rotation_matrix_y(45) @ create_rotation_matrix_x(15),
            "t": np.array([1, 1, 6]),
            "title": "Rotación compuesta + traslación"
        }
    ]

    fig = plt.figure(figsize=(16, 10))

    # Visualización 3D del cubo y cámaras
    ax_3d = fig.add_subplot(2, 3, 1, projection='3d')
    ax_3d.set_title('Vista 3D: Cubo y Posiciones de Cámara')
    ax_3d.set_xlabel('X')
    ax_3d.set_ylabel('Y')
    ax_3d.set_zlabel('Z')

    # Dibujar cubo
    for edge in edges:
        points = cube_vertices[list(edge)]
        ax_3d.plot3D(points[:, 0], points[:, 1], points[:, 2], 'b-', linewidth=2)

    # Dibujar posiciones de cámara
    colors = ['red', 'green', 'orange', 'purple']
    for idx, config in enumerate(configs):
        camera_pos = -config["R"].T @ config["t"]
        ax_3d.scatter(camera_pos[0], camera_pos[1], camera_pos[2],
                     c=colors[idx], s=100, marker='^', label=f'Cámara {idx+1}')

    ax_3d.legend()
    ax_3d.set_box_aspect([1,1,1])

    # Proyecciones desde cada posición de cámara
    for idx, config in enumerate(configs):
        projected = full_projection(cube_vertices, K, config["R"], config["t"])

        ax = fig.add_subplot(2, 3, idx + 2)
        ax.set_title(config["title"])
        ax.set_xlabel('x (píxeles)')
        ax.set_ylabel('y (píxeles)')
        ax.grid(True, alpha=0.3)

        # Dibujar aristas
        for edge in edges:
            points = projected[list(edge)]
            ax.plot(points[:, 0], points[:, 1], 'b-', linewidth=2)

        # Dibujar vértices
        ax.scatter(projected[:, 0], projected[:, 1], c=colors[idx], s=50, marker='o')

        ax.set_xlim(0, 640)
        ax.set_ylim(0, 480)
        ax.invert_yaxis()

        # Información de parámetros extrínsecos
        t_text = f"t = [{config['t'][0]:.1f}, {config['t'][1]:.1f}, {config['t'][2]:.1f}]"
        ax.text(0.02, 0.98, t_text, transform=ax.transAxes,
               fontsize=8, verticalalignment='top',
               bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7))

    plt.tight_layout()
    plt.savefig('../media/3_extrinsic_parameters.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/3_extrinsic_parameters.png")
    plt.show()

if __name__ == "__main__":
    print("=== Parámetros Extrínsecos de la Cámara ===")

    # Ejemplo: cubo en el origen, cámara en (0, 0, 5) mirando hacia -Z
    cube = create_cube(size=2.0, center=[0, 0, 0])

    # Identidad = sin rotación
    R = np.eye(3)
    t = np.array([0, 0, 5])

    print("\nMatriz de Rotación R:")
    print(R)
    print(f"\nVector de Traslación t: {t}")

    # Transformar a coordenadas de cámara
    cube_camera = world_to_camera(cube, R, t)

    print("\nPrimer vértice del cubo:")
    print(f"  Coordenadas mundo: {cube[0]}")
    print(f"  Coordenadas cámara: {cube_camera[0]}")

    # Ejemplo con rotación
    R_rot = create_rotation_matrix_y(30)
    print("\n\nMatriz de Rotación (30° en Y):")
    print(R_rot)

    cube_camera_rot = world_to_camera(cube, R_rot, t)
    print(f"\nPrimer vértice tras rotación:")
    print(f"  Coordenadas mundo: {cube[0]}")
    print(f"  Coordenadas cámara: {cube_camera_rot[0]}")

    # Visualizar movimiento de cámara
    print("\nGenerando visualización de movimiento de cámara...")
    visualize_camera_motion()
