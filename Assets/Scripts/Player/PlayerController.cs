using UnityEngine;

/// <summary>
/// Handles player movement, rotation, and input.
/// Uses WASD for movement and mouse for camera rotation.
/// </summary>
public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float mouseSensitivity = 2f;
    [SerializeField] private float groundDrag = 5f;
    
    private Rigidbody rb;
    private Camera playerCamera;
    private float xRotation = 0f;
    private Vector3 moveDirection;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        playerCamera = GetComponentInChildren<Camera>();
        
        // Lock and hide cursor
        Cursor.lockState = CursorLockMode.Locked;
    }
    
    private void Update()
    {
        // Handle input
        HandleMovementInput();
        HandleCameraRotation();
        
        // Apply drag
        rb.drag = groundDrag;
        SpeedControl();
    }
    
    private void HandleMovementInput()
    {
        float horizontalInput = Input.GetAxis("Horizontal");
        float verticalInput = Input.GetAxis("Vertical");
        
        // Calculate movement direction relative to where player is looking
        moveDirection = transform.forward * verticalInput + transform.right * horizontalInput;
        
        // Apply force
        rb.AddForce(moveDirection.normalized * moveSpeed * 10f, ForceMode.Force);
    }
    
    private void HandleCameraRotation()
    {
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;
        
        // Rotate body left/right
        transform.Rotate(Vector3.up * mouseX);
        
        // Rotate camera up/down
        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f);
        
        playerCamera.transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
    }
    
    private void SpeedControl()
    {
        Vector3 flatVel = new Vector3(rb.velocity.x, 0f, rb.velocity.z);
        
        if (flatVel.magnitude > moveSpeed)
        {
            Vector3 limitedVel = flatVel.normalized * moveSpeed;
            rb.velocity = new Vector3(limitedVel.x, rb.velocity.y, limitedVel.z);
        }
    }
    
    public float GetCurrentHealth()
    {
        // Connect to health system later
        return 100f;
    }
}
