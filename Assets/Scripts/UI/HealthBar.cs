using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Displays player health bar and game HUD information.
/// </summary>
public class HealthBar : MonoBehaviour
{
    [SerializeField] private Image healthBarFill;
    [SerializeField] private TextMeshProUGUI healthText;
    [SerializeField] private GameObject player;
    
    private CombatSystem combatSystem;
    private float maxHealth;
    
    private void Start()
    {
        if (player == null)
            player = GameObject.FindGameObjectWithTag("Player");
        
        combatSystem = FindObjectOfType<CombatSystem>();
        
        if (combatSystem != null)
            maxHealth = combatSystem.GetMaxHealth(player);
    }
    
    private void Update()
    {
        if (combatSystem == null || player == null)
            return;
        
        float currentHealth = combatSystem.GetHealth(player);
        float healthPercent = currentHealth / maxHealth;
        
        if (healthBarFill != null)
            healthBarFill.fillAmount = healthPercent;
        
        if (healthText != null)
            healthText.text = $"Health: {currentHealth:F0}/{maxHealth:F0}";
    }
}
