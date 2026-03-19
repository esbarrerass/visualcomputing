using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class scr : MonoBehaviour
{
    [SerializeField] private Camera cam;
    public Toggle orthographic;
    public Slider slider;
    public TMP_Text label;
    public TMP_Text matrixText;

    public void SwitchMode()
    {
        if(orthographic.isOn)
        {
            cam.orthographic = true;
            float orthoSize = cam.orthographicSize;
            label.text = $"Size: {orthoSize.ToString("F2")}";
            slider.maxValue = 20;
            slider.value = orthoSize;
        }
        else
        {
            cam.orthographic = false;
            float fov = cam.fieldOfView;
            label.text = $"FOV: {fov.ToString("F2")}";
            slider.maxValue = 169;
            slider.value = fov;
        }

        matrixText.text = cam.projectionMatrix.ToString("F2");
    }

    public void ManageSlider()
    {
        float value = slider.value;

        if(orthographic.isOn)
        {
            cam.orthographicSize = value;
            label.text = $"Size: {value.ToString("F2")}";
        }
        else
        {
            cam.fieldOfView = value;
            label.text = $"FOV: {value.ToString("F2")}";
        }

        matrixText.text = cam.projectionMatrix.ToString("F2");
    }

}
