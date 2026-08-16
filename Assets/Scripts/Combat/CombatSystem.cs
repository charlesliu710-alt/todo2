using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Central combat system that handles damage, health, and combat interactions.
/// Singleton that manages all damage dealing and health tracking.
/// </summary>
public class CombatSystem : MonoBehaviour
{
    private Dictionary<GameObject, float> healthMap = new Dictionary<GameObject, float>();
    
    [SerializeField] private float playerMaxHealth = 100f;
    [SerializeField] private float enemyMaxHealth = 30f;
    
    private static CombatSystem instance;
    
    private void Awake()
    {
        if (instance != null && instance != this)
            Destroy(gameObject);
        else
            instance = this;
    }
    
    private void Start()
    {
        // Initialize player health
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
            healthMap[player] = playerMaxHealth;
    }
    
    public void DealDamage(GameObject target, float damage)
    {
        if (!healthMap.ContainsKey(target))
        {
            healthMap[target] = enemyMaxHealth;
        }
        
        healthMap[target] -= damage;
        Debug.Log($"{target.name} took {damage} damage. Health: {healthMap[target]}");
        
        if (healthMap[target] <= 0)
        {
            OnEntityDeath(target);
        }
    }
    
    public float GetHealth(GameObject entity)
    {
        return healthMap.ContainsKey(entity) ? healthMap[entity] : 0f;
    }
    
    public float GetMaxHealth(GameObject entity)
    {
        if (entity.CompareTag("Player"))
            return playerMaxHealth;
        else
            return enemyMaxHealth;
    }
    
    private void OnEntityDeath(GameObject entity)
    {
        Debug.Log($"{entity.name} died!");
        
        if (entity.CompareTag("Player"))
        {
            // Handle player death
            Time.timeScale = 0f; // Pause game
            Debug.Log("Game Over - Player Defeated!");
        }
        else
        {
            // Remove enemy
            Destroy(entity);
        }
    }
    
    public void HealEntity(GameObject entity, float amount)
    {
        if (healthMap.ContainsKey(entity))
        {
            float maxHealth = GetMaxHealth(entity);
            healthMap[entity] = Mathf.Min(healthMap[entity] + amount, maxHealth);
        }
    }
}
