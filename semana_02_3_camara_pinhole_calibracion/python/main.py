"""
Script principal para ejecutar todas las demostraciones del modelo de cámara pinhole.

Este script permite ejecutar individualmente cada paso del taller:
1. Modelo pinhole básico
2. Parámetros intrínsecos
3. Parámetros extrínsecos
4. Calibración de cámara
5. Corrección de distorsión
6. Validación de calibración
"""

import sys
import os

def print_menu():
    """Menú de opciones."""
    print("\n" + "="*60)
    print("    MODELO DE CÁMARA PINHOLE Y CALIBRACIÓN")
    print("="*60)
    print("\n[1] Modelo de cámara pinhole básico (proyección 3D → 2D)")
    print("[2] Parámetros intrínsecos (matriz K)")
    print("[3] Parámetros extrínsecos (rotación y traslación)")
    print("[4] Calibración de cámara con patrón de ajedrez")
    print("[5] Corrección de distorsión")
    print("[6] Validación de calibración")
    print("\n[7] Ejecutar todos los pasos (1-6)")
    print("[0] Salir")
    print("="*60)

def run_step(step):
    """
    Ejecuta un paso específico del taller.

    Args:
        step: Número del paso a ejecutar (1-6)
    """
    scripts = {
        1: "1_pinhole_model.py",
        2: "2_intrinsic_parameters.py",
        3: "3_extrinsic_parameters.py",
        4: "4_camera_calibration.py",
        5: "5_undistortion.py",
        6: "6_calibration_validation.py"
    }

    if step not in scripts:
        print(f"Error: Paso {step} no válido")
        return

    script_name = scripts[step]

    print(f"\n{'='*60}")
    print(f"Ejecutando: {script_name}")
    print(f"{'='*60}\n")

    # Ejecutar el script
    try:
        with open(script_name, 'r', encoding='utf-8') as f:
            code = f.read()
            exec(code, {'__name__': '__main__'})
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {script_name}")
    except Exception as e:
        print(f"Error al ejecutar {script_name}: {e}")

    print(f"\n{'='*60}")
    print(f"Finalizado: {script_name}")
    print(f"{'='*60}\n")

def run_all():
    """Ejecuta todos los pasos del 1 al 6."""
    print("\nEjecutando todos los pasos...\n")

    for step in range(1, 7):
        run_step(step)
        input("\nPresiona Enter para continuar al siguiente paso...")

def main():
    """Función principal del menú interactivo."""
    while True:
        print_menu()

        try:
            choice = input("\nSelecciona una opción: ").strip()

            if choice == '0':
                print("\n¡Hasta luego!")
                break
            elif choice == '7':
                run_all()
            elif choice in ['1', '2', '3', '4', '5', '6']:
                run_step(int(choice))
                input("\nPresiona Enter para volver al menú...")
            else:
                print("\nOpción no válida. Por favor selecciona un número del 0 al 7.")
                input("Presiona Enter para continuar...")

        except KeyboardInterrupt:
            print("\n\n¡Hasta luego!")
            break
        except Exception as e:
            print(f"\nError: {e}")
            input("Presiona Enter para continuar...")

if __name__ == "__main__":
    main()
