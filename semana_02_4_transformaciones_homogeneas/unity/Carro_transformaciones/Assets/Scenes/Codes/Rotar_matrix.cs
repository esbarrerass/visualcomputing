using UnityEngine;

public class Llanta_matrix : MonoBehaviour
{
    public float velocidadRotacion = 67f; // grados por segundo

    void Update()
    {
        float angulo = velocidadRotacion * Time.deltaTime;

        Matrix4x4 rotacion = Matrix4x4.Rotate(Quaternion.Euler(0f, angulo, 0f));

        Matrix4x4 actual = Matrix4x4.Rotate(transform.localRotation);

        Matrix4x4 resultado = actual * rotacion;

        transform.localRotation = resultado.rotation;
    }
}
