import numpy as np
import cv2
import matplotlib.pyplot as plt
import os
import glob

def load_calibration(filename='calibration_params.npz'):
    """
    Carga los parámetros de calibración.

    Args:
        filename: Nombre del archivo con parámetros

    Returns:
        K: Matriz intrínseca
        dist: Coeficientes de distorsión
    """
    if not os.path.exists(filename):
        print(f"Error: No se encontró el archivo {filename}")
        print("Ejecuta primero 4_camera_calibration.py")
        return None, None

    data = np.load(filename)
    return data['K'], data['dist']

def undistort_image(img, K, dist):
    """
    Corrige la distorsión de una imagen usando los parámetros de calibración.

    Args:
        img: Imagen distorsionada
        K: Matriz intrínseca
        dist: Coeficientes de distorsión

    Returns:
        Imagen sin distorsión
    """
    h, w = img.shape[:2]

    # Obtener matriz óptima y región de interés
    new_K, roi = cv2.getOptimalNewCameraMatrix(K, dist, (w, h), 1, (w, h))

    # Corregir distorsión
    undistorted = cv2.undistort(img, K, dist, None, new_K)

    # Recortar usando ROI (opcional)
    x, y, w, h = roi
    if w > 0 and h > 0:
        undistorted = undistorted[y:y+h, x:x+w]

    return undistorted

def compare_distortion(img_path, K, dist):
    """
    Compara imagen original vs corregida lado a lado.

    Args:
        img_path: Ruta a la imagen
        K: Matriz intrínseca
        dist: Coeficientes de distorsión

    Returns:
        original: Imagen original
        undistorted: Imagen corregida
    """
    img = cv2.imread(img_path)
    if img is None:
        print(f"Error al leer imagen: {img_path}")
        return None, None

    undistorted = undistort_image(img, K, dist)

    return img, undistorted

def visualize_undistortion(images_path, K, dist, num_samples=2):
    """
    Visualiza el efecto de la corrección de distorsión en varias imágenes.

    Args:
        images_path: Ruta a las imágenes (con wildcards) o lista de rutas
        K: Matriz intrínseca
        dist: Coeficientes de distorsión
        num_samples: Número de imágenes a visualizar
    """
    # Si es una lista, usarla directamente; si es string, hacer glob
    if isinstance(images_path, list):
        images = images_path
    else:
        images = glob.glob(images_path)

    if len(images) == 0:
        print(f"No se encontraron imágenes")
        return

    # Seleccionar muestras
    sample_images = images[:min(num_samples, len(images))]

    fig, axes = plt.subplots(len(sample_images), 2, figsize=(14, 7*len(sample_images)))

    if len(sample_images) == 1:
        axes = axes.reshape(1, -1)

    for idx, img_path in enumerate(sample_images):
        original, undistorted = compare_distortion(img_path, K, dist)

        if original is not None:
            # Convertir BGR a RGB
            original_rgb = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)

            # Ajustar tamaño si es necesario
            if undistorted.shape != original.shape:
                undistorted = cv2.resize(undistorted, (original.shape[1], original.shape[0]))

            undistorted_rgb = cv2.cvtColor(undistorted, cv2.COLOR_BGR2RGB)

            # Mostrar original
            axes[idx, 0].imshow(original_rgb)
            axes[idx, 0].set_title(f'Original - {os.path.basename(img_path)}')
            axes[idx, 0].axis('off')

            # Mostrar corregida
            axes[idx, 1].imshow(undistorted_rgb)
            axes[idx, 1].set_title('Sin Distorsión')
            axes[idx, 1].axis('off')

    plt.tight_layout()
    plt.savefig('../media/5_undistortion_comparison.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/5_undistortion_comparison.png")
    plt.show()

def analyze_distortion_effect(K, dist):
    """
    Analiza y visualiza el efecto de la distorsión en una cuadrícula.

    Args:
        K: Matriz intrínseca
        dist: Coeficientes de distorsión
    """
    # Crear imagen con cuadrícula
    img_size = (640, 480)
    grid_img = np.ones((img_size[1], img_size[0], 3), dtype=np.uint8) * 255

    # Dibujar líneas horizontales y verticales
    spacing = 40
    for i in range(0, img_size[0], spacing):
        cv2.line(grid_img, (i, 0), (i, img_size[1]), (0, 0, 0), 1)
    for i in range(0, img_size[1], spacing):
        cv2.line(grid_img, (0, i), (img_size[0], i), (0, 0, 0), 1)

    # Aplicar distorsión artificial (si los coeficientes son pequeños, amplificarlos)
    dist_amplified = dist * 3

    # Generar mapa de distorsión
    h, w = img_size[1], img_size[0]
    map1, map2 = cv2.initUndistortRectifyMap(K, -dist_amplified, None, K, (w, h), cv2.CV_32FC1)
    distorted_grid = cv2.remap(grid_img, map1, map2, cv2.INTER_LINEAR)

    # Corregir distorsión
    undistorted_grid = undistort_image(distorted_grid, K, dist_amplified)

    # Visualizar
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))

    axes[0].imshow(grid_img)
    axes[0].set_title('Cuadrícula Ideal (sin distorsión)')
    axes[0].axis('off')

    axes[1].imshow(distorted_grid)
    axes[1].set_title('Con Distorsión Radial')
    axes[1].axis('off')

    # Ajustar tamaño si es necesario
    if undistorted_grid.shape != grid_img.shape:
        undistorted_grid = cv2.resize(undistorted_grid, (grid_img.shape[1], grid_img.shape[0]))

    axes[2].imshow(undistorted_grid)
    axes[2].set_title('Después de Corrección')
    axes[2].axis('off')

    plt.tight_layout()
    plt.savefig('../media/5_distortion_grid.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/5_distortion_grid.png")
    plt.show()

if __name__ == "__main__":
    print("=== Corrección de Distorsión ===")

    # Cargar parámetros de calibración
    print("\n1. Cargando parámetros de calibración...")
    K, dist = load_calibration('../python/calibration_params.npz')

    if K is None:
        print("\nNo se pudieron cargar los parámetros de calibración.")
        print("Asegúrate de haber ejecutado 4_camera_calibration.py primero.")
    else:
        print("Parámetros cargados correctamente")
        print("\nMatriz Intrínseca K:")
        print(K)
        print("\nCoeficientes de Distorsión:")
        print(dist.flatten())

        # Analizar efecto de distorsión con cuadrícula
        print("\n2. Analizando efecto de distorsión en cuadrícula...")
        analyze_distortion_effect(K, dist)

        # Corregir distorsión en imágenes de calibración
        print("\n3. Corrigiendo distorsión en imágenes de calibración...")
        calibration_path_jpg = '../calibration_images/*.jpg'
        calibration_path_jpeg = '../calibration_images/*.jpeg'

        images = glob.glob(calibration_path_jpg) + glob.glob(calibration_path_jpeg)
        if len(images) > 0:
            # Pasar lista de imágenes directamente
            visualize_undistortion(images, K, dist, num_samples=2)
        else:
            print(f"No se encontraron imágenes en: calibration_images/")
            print("Coloca imágenes en calibration_images/ para ver la corrección")

        print("\n¡Corrección de distorsión completada!")
