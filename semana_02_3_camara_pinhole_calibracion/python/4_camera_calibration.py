import numpy as np
import cv2
import glob
import os
import matplotlib.pyplot as plt

def calibrate_camera(images_path, pattern_size=(9, 6), square_size=1.0):
    """
    Calibra la cámara usando imágenes de un patrón de ajedrez.

    Args:
        images_path: Ruta a las imágenes del patrón (ej: 'calibration_images/*.jpg')
        pattern_size: Número de esquinas internas (cols, rows)
        square_size: Tamaño real de cada cuadrado en unidades del mundo

    Returns:
        ret: Error de reproyección RMS
        K: Matriz intrínseca
        dist: Coeficientes de distorsión
        rvecs: Vectores de rotación para cada imagen
        tvecs: Vectores de traslación para cada imagen
    """
    # Preparar puntos 3D del patrón (0,0,0), (1,0,0), (2,0,0) ...
    objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
    objp *= square_size

    # Arrays para almacenar puntos de todas las imágenes
    objpoints = []  # Puntos 3D en el mundo real
    imgpoints = []  # Puntos 2D en el plano de imagen

    # Buscar todas las imágenes (aceptar string o lista)
    if isinstance(images_path, list):
        images = images_path
    else:
        images = glob.glob(images_path)

    if len(images) == 0:
        print(f"Error: No se encontraron imágenes")
        return None, None, None, None, None

    print(f"Encontradas {len(images)} imágenes para calibración")

    successful_images = []
    gray_shape = None

    for idx, fname in enumerate(images):
        img = cv2.imread(fname)
        if img is None:
            print(f"Error al leer imagen: {fname}")
            continue

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray_shape = gray.shape[::-1]

        # Encontrar esquinas del ajedrez
        ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)

        if ret:
            objpoints.append(objp)

            # Refinar esquinas con subpixel precision
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            corners_refined = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
            imgpoints.append(corners_refined)

            successful_images.append(fname)
            print(f"  [{idx+1}/{len(images)}] Patrón detectado: {os.path.basename(fname)}")
        else:
            print(f"  [{idx+1}/{len(images)}] Patrón NO detectado: {os.path.basename(fname)}")

    if len(objpoints) == 0:
        print("Error: No se detectó el patrón en ninguna imagen")
        return None, None, None, None, None

    print(f"\nCalibración exitosa en {len(objpoints)}/{len(images)} imágenes")

    # Calibrar cámara
    ret, K, dist, rvecs, tvecs = cv2.calibrateCamera(
        objpoints, imgpoints, gray_shape, None, None
    )

    print(f"\nError de reproyección RMS: {ret:.4f} píxeles")

    return ret, K, dist, rvecs, tvecs, successful_images

def save_calibration(K, dist, filename='calibration_params.npz'):
    """
    Guarda los parámetros de calibración en un archivo.

    Args:
        K: Matriz intrínseca
        dist: Coeficientes de distorsión
        filename: Nombre del archivo de salida
    """
    np.savez(filename, K=K, dist=dist)
    print(f"\nParámetros de calibración guardados en: {filename}")

def load_calibration(filename='calibration_params.npz'):
    """
    Carga los parámetros de calibración desde un archivo.

    Args:
        filename: Nombre del archivo

    Returns:
        K: Matriz intrínseca
        dist: Coeficientes de distorsión
    """
    data = np.load(filename)
    return data['K'], data['dist']

def visualize_detected_corners(images_path, pattern_size=(9, 6), num_samples=4):
    """
    Visualiza la detección de esquinas en algunas imágenes de muestra.

    Args:
        images_path: Ruta a las imágenes o lista de rutas
        pattern_size: Tamaño del patrón
        num_samples: Número de imágenes a visualizar
    """
    # Si es una lista, usarla directamente; si es string, hacer glob
    if isinstance(images_path, list):
        images = images_path
    else:
        images = glob.glob(images_path)

    if len(images) == 0:
        print("No se encontraron imágenes para visualizar")
        return

    # Seleccionar muestras
    sample_images = images[:min(num_samples, len(images))]

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    axes = axes.flatten()

    for idx, fname in enumerate(sample_images):
        img = cv2.imread(fname)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)

        if ret:
            # Refinar esquinas
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            corners = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)

            # Dibujar esquinas
            img_with_corners = cv2.drawChessboardCorners(img.copy(), pattern_size, corners, ret)
            img_rgb = cv2.cvtColor(img_with_corners, cv2.COLOR_BGR2RGB)

            axes[idx].imshow(img_rgb)
            axes[idx].set_title(f'Detectado: {os.path.basename(fname)}')
        else:
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            axes[idx].imshow(img_rgb)
            axes[idx].set_title(f'NO detectado: {os.path.basename(fname)}')

        axes[idx].axis('off')

    plt.tight_layout()
    plt.savefig('../media/4_corner_detection.png', dpi=150, bbox_inches='tight')
    print("Imagen guardada: media/4_corner_detection.png")
    plt.show()

if __name__ == "__main__":
    print("=== Calibración de Cámara ===")

    # Ruta a las imágenes de calibración
    calibration_path_jpg = '../calibration_images/*.jpg'
    calibration_path_jpeg = '../calibration_images/*.jpeg'

    # Verificar si existen imágenes
    images = glob.glob(calibration_path_jpg) + glob.glob(calibration_path_jpeg)

    if len(images) == 0:
        print(f"\nNo se encontraron imágenes en: calibration_images/")
        print("\nPara usar este script:")
        print("1. Coloca imágenes de un patrón de ajedrez en: calibration_images/")
        print("2. El patrón debe tener 9x6 esquinas internas")
        print("3. Captura 10-20 imágenes desde diferentes ángulos")
    else:
        # Visualizar detección de esquinas
        print("\n1. Visualizando detección de esquinas...")
        visualize_detected_corners(images, pattern_size=(9, 6))

        # Calibrar
        print("\n2. Calibrando cámara...")
        ret, K, dist, rvecs, tvecs, successful = calibrate_camera(
            images,
            pattern_size=(9, 6),
            square_size=1.0
        )

        if K is not None:
            print("\n=== Resultados de Calibración ===")
            print("\nMatriz Intrínseca K:")
            print(K)

            print("\nParámetros de la cámara:")
            print(f"  fx (focal length X): {K[0,0]:.2f} píxeles")
            print(f"  fy (focal length Y): {K[1,1]:.2f} píxeles")
            print(f"  cx (centro X): {K[0,2]:.2f} píxeles")
            print(f"  cy (centro Y): {K[1,2]:.2f} píxeles")

            print("\nCoeficientes de Distorsión:")
            print(dist)
            print(f"  k1 (radial): {dist[0,0]:.6f}")
            print(f"  k2 (radial): {dist[0,1]:.6f}")
            print(f"  p1 (tangencial): {dist[0,2]:.6f}")
            print(f"  p2 (tangencial): {dist[0,3]:.6f}")
            print(f"  k3 (radial): {dist[0,4]:.6f}")

            # Guardar parámetros
            save_calibration(K, dist, '../python/calibration_params.npz')
