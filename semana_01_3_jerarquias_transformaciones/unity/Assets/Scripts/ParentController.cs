using UnityEngine;
using UnityEngine.UI;

public class ParentController : MonoBehaviour
{
    [Header("Referencias")]
    public Transform parentObject;

    [Header("Sliders")]
    public Slider positionSlider;
    public Slider rotationSlider;
    public Slider scaleSlider;

    [Header("UI Text")]
    public Text infoText;

    private bool isAnimating = true;
    private float animationSpeed = 20f;

    void Start()
    {
        positionSlider.minValue = -5f;
        positionSlider.maxValue = 5f;

        rotationSlider.minValue = 0f;
        rotationSlider.maxValue = 360f;

        scaleSlider.minValue = 0.5f;
        scaleSlider.maxValue = 2f;

        positionSlider.onValueChanged.AddListener(UpdatePosition);
        rotationSlider.onValueChanged.AddListener(UpdateRotation);
        scaleSlider.onValueChanged.AddListener(UpdateScale);
    }

    void Update()
    {
        //BONUS
        if (isAnimating)
        {
            parentObject.Rotate(Vector3.up * animationSpeed * Time.deltaTime);
        }

        UpdateInfoDisplay();
    }

    void UpdatePosition(float value)
    {
        parentObject.position = new Vector3(value, 0, 0);
    }

    void UpdateRotation(float value)
    {
        parentObject.rotation = Quaternion.Euler(0, value, 0);
    }

    void UpdateScale(float value)
    {
        parentObject.localScale = Vector3.one * value;
    }

    void UpdateInfoDisplay()
    {
        infoText.text =
            "Position: " + parentObject.position.ToString("F2") + "\n" +
            "Rotation: " + parentObject.eulerAngles.ToString("F2") + "\n" +
            "Scale: " + parentObject.localScale.ToString("F2");
    }

    public void ToggleAnimation()
    {
        isAnimating = !isAnimating;
    }

    public void ResetTransform()
    {
        parentObject.position = Vector3.zero;
        parentObject.rotation = Quaternion.identity;
        parentObject.localScale = Vector3.one;

        positionSlider.value = 0;
        rotationSlider.value = 0;
        scaleSlider.value = 1;
    }
}
