using UnityEngine;

/// <summary>
/// Base class for enemy behavior including movement, health, and combat.
/// Can be extended for different enemy types.
/// </summary>
public class EnemyAI : MonoBehaviour
{
    [SerializeField] private float detectionRange = 15f;
    [SerializeField] private float moveSpeed = 3f;
    [SerializeField] private float stoppingDistance = 2f;
    [SerializeField] private float attackCooldown = 1.5f;
    [SerializeField] private float attackDamage = 10f;
    
    private Rigidbody rb;
    private Transform player;
    private float lastAttackTime = -Mathf.Infinity;
    private CombatSystem combatSystem;
    
    private enum State { Idle, Chasing, Attacking }
    private State currentState = State.Idle;
    
    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
        combatSystem = FindObjectOfType<CombatSystem>();
        
        if (player == null)
            Debug.LogWarning("Player not found! Tag the player with 'Player'");
    }
    
    private void Update()
    {
        if (player == null)
            return;
        
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);
        
        if (distanceToPlayer < detectionRange)
        {
            if (distanceToPlayer < stoppingDistance)
            {
                currentState = State.Attacking;
                TryAttack();
            }
            else
            {
                currentState = State.Chasing;
                ChasePlayer();
            }
        }
        else
        {
            currentState = State.Idle;
            rb.velocity = Vector3.zero;
        }
    }
    
    private void ChasePlayer()
    {
        Vector3 direction = (player.position - transform.position).normalized;
        rb.velocity = new Vector3(direction.x * moveSpeed, rb.velocity.y, direction.z * moveSpeed);
        
        // Face player
        transform.LookAt(player.position);
    }
    
    private void TryAttack()
    {
        if (Time.time - lastAttackTime < attackCooldown)
            return;
        
        lastAttackTime = Time.time;
        
        // Deal damage to player
        if (combatSystem != null)
            combatSystem.DealDamage(player.gameObject, attackDamage);
        
        Debug.Log("Enemy attacks!");
    }
    
    public void TakeDamage(float damage)
    {
        if (combatSystem != null)
            combatSystem.DealDamage(gameObject, damage);
    }
    
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, detectionRange);
        
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, stoppingDistance);
    }
}
