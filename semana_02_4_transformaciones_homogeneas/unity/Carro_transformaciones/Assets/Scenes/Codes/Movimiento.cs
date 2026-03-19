using UnityEngine;

public class VehicleMovement : MonoBehaviour
{
    public float speed = 0.4f;

    // Valor público para que las ruedas sepan cuánto girar
    public float currentSpeed { get; private set; }

    void Update()
    {
        float move = speed * Time.deltaTime;

        transform.Translate(Vector3.forward * move);

        currentSpeed = move; 
    }
}