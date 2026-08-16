using UnityEngine;

/// <summary>
/// Game manager that handles game state, enemy spawning, and overall game logic.
/// </summary>
public class GameManager : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;
    [SerializeField] private int initialEnemyCount = 5;
    [SerializeField] private Vector3 spawnAreaCenter = Vector3.zero;
    [SerializeField] private Vector3 spawnAreaSize = new Vector3(50f, 1f, 50f);
    
    private int currentEnemyCount = 0;
    private static GameManager instance;
    
    private void Awake()
    {
        if (instance != null && instance != this)
            Destroy(gameObject);
        else
            instance = this;
    }
    
    private void Start()
    {
        // Spawn initial enemies
        for (int i = 0; i < initialEnemyCount; i++)
        {
            SpawnEnemy();
        }
    }
    
    private void SpawnEnemy()
    {
        if (enemyPrefab == null)
        {
            Debug.LogError("Enemy prefab not assigned to GameManager!");
            return;
        }
        
        Vector3 randomPos = GetRandomSpawnPosition();
        GameObject newEnemy = Instantiate(enemyPrefab, randomPos, Quaternion.identity);
        currentEnemyCount++;
    }
    
    private Vector3 GetRandomSpawnPosition()
    {
        float randomX = Random.Range(
            spawnAreaCenter.x - spawnAreaSize.x / 2,
            spawnAreaCenter.x + spawnAreaSize.x / 2
        );
        float randomZ = Random.Range(
            spawnAreaCenter.z - spawnAreaSize.z / 2,
            spawnAreaCenter.z + spawnAreaSize.z / 2
        );
        
        return new Vector3(randomX, spawnAreaCenter.y, randomZ);
    }
    
    public void OnEnemyDeath()
    {
        currentEnemyCount--;
        Debug.Log($"Enemy defeated! Enemies remaining: {currentEnemyCount}");
    }
    
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.green;
        Gizmos.DrawWireCube(spawnAreaCenter, spawnAreaSize);
    }
}
