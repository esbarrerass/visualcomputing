import React, { forwardRef, useMemo } from 'react'
import { LensDistortionEffect } from './LensDistortionEffect'

export const LensDistortion = forwardRef(({ k1, k2 }, ref) => {
    // Inicializamos el efecto sólo una vez y proveemos los coeficientes.
    const effect = useMemo(() => new LensDistortionEffect({ k1, k2 }), [])

    // Actualizamos directamente el valor del uniform cuando las props (k1 o k2) cambian desde Leva (GUI)
    // Esto simula cómo calibramos un lente real y probamos parámetros.
    effect.uniforms.get('k1').value = k1
    effect.uniforms.get('k2').value = k2

    return <primitive ref={ref} object={effect} dispose={null} />
})
