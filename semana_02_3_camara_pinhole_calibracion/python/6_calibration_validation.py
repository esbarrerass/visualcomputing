import numpy as np
import cv2
import matplotlib.pyplot as plt
import glob
import os

def load_calibration(filename='calibration_params.npz'):
    """Carga los parámetros de calibración."""
    if not os.path.exists(filename):
        print(f"Error: No se encontró {filename}")
        return None, None

    data = np.load(filename)
    return data['K'], data['dist']

def compute_reprojection_error(objpoints, imgpoints, rvecs, tvecs, K, dist):
    """
    Calcula el error de reproyección para cada imagen.

    Args:
        objpoints: Lista de puntos 3D del mundo
        imgpoints: Lista de puntos 2D detectados
        rvecs: Vectores de rotación
        tvecs: Vectores de traslación
        K: Matriz intrínseca
        dist: Coeficientes de distorsión

    Returns:
        mean_error: Error medio de reproyección
        errors_per_image: Lista de errores por imagen
    """
    total_error = 0
    errors_per_image = []

    for i in range(len(objpoints)):
        # Reproyectar puntos 3D a 2D
        imgpoints_reproj, _ = cv2.projectPoints(objpoints[i], rvecs[i], tvecs[i], K, dist)

        # Calcular error euclidiano
        error = cv2.norm(imgpoints[i], imgpoints_reproj, cv2.NORM_L2) / len(imgpoints_reproj)
        errors_per_image.append(error)
        total_error += error

    mean_error = total_error / len(objpoints)

    return mean_error, errors_per_image

def recalibrate_and_validate(images_path, pattern_size=(9, 6), square_size=1.0):
    """
    Recalibra y valida la calibración de la cámara.

    Args:
        images_path: Ruta a las imágenes
        pattern_size: Tamaño del patrón de ajedrez
        square_size: Tamaño de cada cuadrado

    Returns:
        Todos los datos de calibración y validación
    """
    # Preparar puntos 3D
    objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
    objp *= square_size

    objpoints = []
    imgpoints = []

    # Si es una lista, usarla directamente; si es string, hacer glob
    if isinstance(images_path, list):
        images = images_path
    else:
        images = glob.glob(images_path)

    if len(images) == 0:
        print(f"No se encontraron imágenes")
        return None

    print(f"Procesando {len(images)} imágenes...")

    successful_images = []
    gray_shape = None

    for fname in images:
        img = cv2.imread(fname)
        if img is None:
            continue

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray_shape = gray.shape[::-1]

        ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)

        if ret:
            objpoints.append(objp)
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            corners_refined = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
            imgpoints.append(corners_refined)
            successful_images.append((fname, img, corners_refined))

    if len(objpoints) == 0:
        print("Error: No se detectó el patrón en ninguna imagen")
        return None

    # Calibrar
    ret, K, dist, rvecs, tvecs = cv2.calibrateCamera(
        objpoints, imgpoints, gray_shape, None, None
    )

    # Calcular errores
    mean_error, errors = compute_reprojection_error(objpoints, imgpoints, rvecs, tvecs, K, dist)

    return {
        'ret': ret,
        'K': K,
        'dist': dist,
        'rvecs': rvecs,
        'tvecs': tvecs,
        'objpoints': objpoints,
        'imgpoints': imgpoints,
        'mean_error': mean_error,
        'errors_per_image': errors,
        'successful_images': successful_images
    }

def visualize_reprojection(cal_data, num_samples=2):
    """
    Visualiza la reproyección de puntos comparando puntos detectados vs reproyectados.

    Args:
        cal_data: Diccionario con datos de calibración
        num_samples: Número de imágenes a visualizar
    """
    if cal_data is None:
        return

    K = cal_data['K']
    dist = cal_data['dist']
    objpoints = cal_data['objpoints']
    imgpoints = cal_data['imgpoints']
    rvecs = cal_data['rvecs']
    tvecs = cal_data['tvecs']
    successful_images = cal_data['successful_images']

    num_samples = min(num_samples, len(successful_images))

    fig, axes = plt.subplots(num_samples, 2, figsize=(14, 7*num_samples))

    if num_samples == 1:
        axes = axes.reshape(1, -1)

    for idx in range(num_samples):
        fname, img, corners = successful_images[idx]

        # Reproyectar puntos
        imgpoints_reproj, _ = cv2.projectPoints(objpoints[idx], rvecs[idx], tvecs[idx], K, dist)

        # Error para esta imagen
        error = cal_data['errors_per_image'][idx]

        # Imagen con puntos detectados
        img_detected = img.copy()
        for corner in corners:
            cv2.circle(img_detected, tuple(corner.ravel().astype(int)), 5, (0, 255, 0), -1)

        # Imagen con puntos reproyectados
        img_reproj = img.copy()
        for point in imgpoints_reproj:
            cv2.circle(img_reproj, tuple(point.ravel().astype(int)), 5, (255, 0, 0), -1)

        # Imagen combinada
        img_combined = img.copy()
        for corner, reproj in zip(corners, imgpoints_reproj):
            # Punto detectado en verde
            cv2.circle(img_combined, tuple(corner.ravel().astype(int)), 5, (0, 255, 0), -1)
            # Punto reproyectado en rojo
            cv2.circle(img_combined, tuple(reproj.ravel().astype(int)), 5, (255, 0, 0), 2)
            # Línea conectando ambos
            cv2.line(img_combined,
                    tuple(corner.ravel().astype(int)),
                    tuple(reproj.ravel().astype(int)),
                    (255, 255, 0), 1)

        # Mostrar
        axes[idx, 0].imshow(cv2.cvtColor(img_detected, cv2.COLOR_BGR2RGB))
        axes[idx, 0].set_title(f'Detectados (verde) - {os.path.basename(fname)}')
        axes[idx, 0].axis('off')

        axes[idx, 1].imshow(cv2.cvtColor(img_combined, cv2.COLOR_BGR2RGB))
        axes[idx, 1].set_title(f'Reproyectados (rojo) - Error: {error:.3f} px')
        axes[idx, 1].axis('off')

    plt.tight_layout()
    plt.savefig('../media/6_reprojection_error.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/6_reprojection_error.png")
    plt.show()

def plot_error_distribution(cal_data):
    """
    Grafica la distribución de errores de reproyección.

    Args:
        cal_data: Diccionario con datos de calibración
    """
    if cal_data is None:
        return

    errors = cal_data['errors_per_image']

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Gráfico de barras
    axes[0].bar(range(len(errors)), errors, color='steelblue')
    axes[0].axhline(y=cal_data['mean_error'], color='r', linestyle='--',
                   label=f'Error medio: {cal_data["mean_error"]:.3f} px')
    axes[0].set_xlabel('Imagen')
    axes[0].set_ylabel('Error de reproyección (píxeles)')
    axes[0].set_title('Error por Imagen')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Histograma
    axes[1].hist(errors, bins=15, color='steelblue', edgecolor='black', alpha=0.7)
    axes[1].axvline(x=cal_data['mean_error'], color='r', linestyle='--',
                   label=f'Error medio: {cal_data["mean_error"]:.3f} px')
    axes[1].set_xlabel('Error de reproyección (píxeles)')
    axes[1].set_ylabel('Frecuencia')
    axes[1].set_title('Distribución de Errores')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig('../media/6_error_distribution.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/6_error_distribution.png")
    plt.show()

if __name__ == "__main__":
    print("=== Validación de Calibración ===")

    # Ruta a imágenes de calibración
    calibration_path_jpg = '../calibration_images/*.jpg'
    calibration_path_jpeg = '../calibration_images/*.jpeg'

    images = glob.glob(calibration_path_jpg) + glob.glob(calibration_path_jpeg)

    if len(images) == 0:
        print(f"\nNo se encontraron imágenes en: calibration_images/")
        print("Coloca imágenes de calibración en calibration_images/")
    else:
        print("\n1. Recalibrando cámara para validación...")
        # Pasar lista de imágenes directamente
        cal_data = recalibrate_and_validate(
            images,
            pattern_size=(9, 6),
            square_size=1.0
        )

        if cal_data is not None:
            print("\n=== Resultados de Validación ===")
            print(f"\nError RMS de calibración: {cal_data['ret']:.4f} píxeles")
            print(f"Error medio de reproyección: {cal_data['mean_error']:.4f} píxeles")
            print(f"Número de imágenes utilizadas: {len(cal_data['objpoints'])}")

            print("\nMatriz Intrínseca K:")
            print(cal_data['K'])

            print("\nCoeficientes de Distorsión:")
            print(cal_data['dist'].flatten())

            # Evaluar calidad
            print("\n=== Evaluación de Calidad ===")
            if cal_data['mean_error'] < 0.5:
                print("✓ Excelente calibración (error < 0.5 px)")
            elif cal_data['mean_error'] < 1.0:
                print("✓ Buena calibración (error < 1.0 px)")
            elif cal_data['mean_error'] < 2.0:
                print("⚠ Calibración aceptable (error < 2.0 px)")
            else:
                print("✗ Calibración pobre (error >= 2.0 px)")
                print("  Recomendaciones:")
                print("  - Captura más imágenes desde diferentes ángulos")
                print("  - Asegúrate de que el patrón esté bien enfocado")
                print("  - Cubre todo el campo de visión de la cámara")

            # Visualizaciones
            print("\n2. Generando visualizaciones...")
            visualize_reprojection(cal_data, num_samples=2)
            plot_error_distribution(cal_data)

            print("\n¡Validación completada!")
