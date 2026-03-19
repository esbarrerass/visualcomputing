import { Effect } from 'postprocessing'
import { Uniform } from 'three'

// Fragment shader para la distorsión de lente radial (modelo polinomial)
// Comentarios detallados para entender el proceso matematico de la distorsion
const fragmentShader = `
uniform float k1; // Coeficiente de distorsión radial 1 (barril o acerico)
uniform float k2; // Coeficiente de distorsión radial 2 (afecta más los bordes)

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // 1. Mapeamos las coordenadas UV [0, 1] al espacio normalizado NDC [-1, 1]
    // El centro de la pantalla será (0,0)
    vec2 p = uv * 2.0 - 1.0;
    
    // 2. Calculamos el radio exacto al cuadrado (r^2) desde el centro óptico
    float r2 = dot(p, p);
    
    // 3. Aplicamos la fórmula de distorsión radial: p' = p * (1 + k1*r^2 + k2*r^4)
    // Si k1 es positivo, las esquinas se encogen (Barrel Distortion / Ojo de pez)
    // Si k1 es negativo, las esquinas se estiran (Pincushion Distortion / Acerico)
    float f = 1.0 + k1 * r2 + k2 * r2 * r2;
    vec2 pDistorted = p * f;
    
    // 4. Mapeamos las coordenadas distorsionadas nuevamente al rango UV [0, 1]
    vec2 uvDistorted = (pDistorted + 1.0) / 2.0;
    
    // 5. Verificamos si las coordenadas mapeadas caen fuera del viewport original (pantalla)
    if (uvDistorted.x < 0.0 || uvDistorted.x > 1.0 || uvDistorted.y < 0.0 || uvDistorted.y > 1.0) {
        outputColor = vec4(0.0, 0.0, 0.0, 1.0); // Borde negro fuera del lente
    } else {
        // 6. Muestreamos el color real de la textura usando nuestras nuevas coordenadas distorsionadas
        // 'inputBuffer' es inyectado automáticamente por la librería 'postprocessing'
        outputColor = texture2D(inputBuffer, uvDistorted);
    }
}
`

/**
 * Efecto customizado para postprocessing que simula la distorsión de lente 
 * basado en los parámetros intrínsecos de una cámara
 */
export class LensDistortionEffect extends Effect {
    constructor({ k1 = 0, k2 = 0 } = {}) {
        super('LensDistortionEffect', fragmentShader, {
            uniforms: new Map([
                ['k1', new Uniform(k1)],
                ['k2', new Uniform(k2)]
            ])
        })
    }
}
