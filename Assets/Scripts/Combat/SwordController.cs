using UnityEngine;

/// <summary>
/// Manages sword attacks, cooldown, and damage output.
/// Attached to the sword game object as a child of the player.
/// </summary>
public class SwordController : MonoBehaviour
{
    [SerializeField] private float attackDamage = 25f;
    [SerializeField] private float attackCooldown = 0.5f;
    [SerializeField] private float attackRange = 2f;
    [SerializeField] private float attackRadius = 1f;
    [SerializeField] private float knockbackForce = 10f;
    [SerializeField] private Transform attackOrigin; // Position where attack originates
    
    private float lastAttackTime = -Mathf.Infinity;
    private CombatSystem combatSystem;
    
    private void Start()
    {
        combatSystem = FindObjectOfType<CombatSystem>();
        
        // If no attack origin specified, use sword transform
        if (attackOrigin == null)
            attackOrigin = transform;
    }
    
    private void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            TryAttack();
        }
    }
    
    public void TryAttack()
    {
        if (Time.time - lastAttackTime < attackCooldown)
            return;
        
        lastAttackTime = Time.time;
        PerformAttack();
    }
    
    private void PerformAttack()
    {
        // Find enemies in range
        Collider[] hitEnemies = Physics.OverlapSphere(
            attackOrigin.position,
            attackRange,
            LayerMask.GetMask("Enemy")
        );
        
        foreach (Collider enemy in hitEnemies)
        {
            // Deal damage
            if (combatSystem != null)
                combatSystem.DealDamage(enemy.gameObject, attackDamage);
            
            // Apply knockback
            Rigidbody enemyRb = enemy.GetComponent<Rigidbody>();
            if (enemyRb != null)
            {
                Vector3 knockbackDir = (enemy.transform.position - transform.position).normalized;
                enemyRb.AddForce(knockbackDir * knockbackForce, ForceMode.Impulse);
            }
        }
        
        // TODO: Play attack animation/VFX
        Debug.Log("Sword attack!");
    }
    
    public float GetAttackCooldownPercent()
    {
        float timeSinceAttack = Time.time - lastAttackTime;
        return Mathf.Clamp01(timeSinceAttack / attackCooldown);
    }
    
    // Visualize attack range in editor
    private void OnDrawGizmosSelected()
    {
        if (attackOrigin == null)
            return;
        
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(attackOrigin.position, attackRange);
    }
}
