using UnityEngine;

public class Llanta : MonoBehaviour
{
    public float velocidadRotacion = 67f; // grados por segundo

    void Update()
    {
        transform.Rotate(Vector3.up * velocidadRotacion * Time.deltaTime, Space.Self);
    }
}