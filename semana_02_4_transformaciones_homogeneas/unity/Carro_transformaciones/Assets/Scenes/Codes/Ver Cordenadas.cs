using UnityEngine;

public class MostrarEjes : MonoBehaviour
{
    public float longitudEjes = 1f;

    void OnDrawGizmos()
    {
        // Ejes locales
        Gizmos.color = Color.red;
        Gizmos.DrawLine(transform.position, transform.position + transform.right * longitudEjes);

        Gizmos.color = Color.green;
        Gizmos.DrawLine(transform.position, transform.position + transform.up * longitudEjes);

        Gizmos.color = Color.blue;
        Gizmos.DrawLine(transform.position, transform.position + transform.forward * longitudEjes);

    }
}