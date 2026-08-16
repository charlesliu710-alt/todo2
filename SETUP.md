# Unity Setup Guide for todo2

Follow these steps to get the game running in Unity.

## Step 1: Import into Unity

1. Open **Unity Hub**
2. Click **"Add"** → Select the `todo2` folder
3. Open with **Unity 2022 LTS** or newer

## Step 2: Initial Scene Setup

1. In Unity Editor, go to **Assets → Scenes**
2. Create a new scene: **Right-click → Create → Scene**
3. Name it `MainScene.unity`
4. Save it in `Assets/Scenes/`

## Step 3: Create Player

1. **Create a new Capsule** (3D Object) as the player
   - Right-click in Hierarchy → 3D Object → Capsule
   - Name: `Player`
   - Scale: X=0.6, Y=1.8, Z=0.6

2. **Add Components to Player**:
   - Add **Rigidbody**: Inspector → Add Component → Rigidbody
     - Mass: 1
     - Drag: 5
     - Freeze Rotation: X, Y, Z (all checked)
   - Add **Capsule Collider** (already present)
   - Add script: Drag `PlayerController.cs` to the Player

3. **Add Camera**:
   - Right-click on Player → 3D Object → Camera
   - Position: Y = 0.6 (eye height)
   - Remove Audio Listener from main camera if duplicate

4. **Tag the Player**:
   - Select Player → Inspector → Tag dropdown → Add new tag "Player"
   - Assign "Player" tag to Player object

## Step 4: Create Sword

1. **Create a Cube** as the sword
   - Right-click in Hierarchy → 3D Object → Cube
   - Parent it to Player: Drag Cube onto Player in Hierarchy
   - Position: X=0.5, Y=-0.5, Z=1 (right hand, forward)
   - Scale: X=0.2, Y=0.2, Z=1.5
   - Name: `Sword`

2. **Add Script**:
   - Drag `SwordController.cs` to Sword object

## Step 5: Create an Enemy

1. **Create a Capsule** as the enemy
   - Right-click in Hierarchy → 3D Object → Capsule
   - Name: `Enemy`
   - Position: X=10, Y=0, Z=10

2. **Add Components**:
   - Add **Rigidbody**: Inspector → Add Component → Rigidbody
     - Mass: 1
     - Drag: 3
     - Freeze Rotation: X, Z (checked)
   - Add **Capsule Collider** (already present)
   - Add script: Drag `EnemyAI.cs` to Enemy

3. **Tag as Enemy**:
   - Inspector → Tag dropdown → Add new tag "Enemy"
   - Assign "Enemy" tag

4. **Create a Prefab**:
   - Drag Enemy from Hierarchy to `Assets/Prefabs/`
   - Name: `Enemy.prefab`

5. **Delete Enemy from Scene** (we'll spawn via GameManager)

## Step 6: Create Ground

1. **Create a Plane**
   - Right-click in Hierarchy → 3D Object → Plane
   - Name: `Ground`
   - Scale: X=50, Y=1, Z=50

2. **Add Collider**: Plane Collider should be present by default

## Step 7: Setup GameManager

1. **Create Empty GameObject**
   - Right-click in Hierarchy → Create Empty
   - Name: `GameManager`
   - Position: 0, 0, 0

2. **Add Script**: Drag `GameManager.cs` to GameManager object

3. **Configure in Inspector**:
   - Enemy Prefab: Drag the `Enemy.prefab` from Assets/Prefabs/
   - Initial Enemy Count: 5
   - Spawn Area Center: 0, 0, 0
   - Spawn Area Size: 50, 1, 50

## Step 8: Setup Combat System

1. **Create Empty GameObject**
   - Name: `CombatSystem`

2. **Add Script**: Drag `CombatSystem.cs` to it

3. **Configure**:
   - Player Max Health: 100
   - Enemy Max Health: 30

## Step 9: Setup UI (Health Bar)

1. **Create Canvas**
   - Right-click in Hierarchy → UI → Canvas

2. **Create Health Bar**:
   - Right-click on Canvas → UI → Image
   - Name: `HealthBarFill`
   - Make it green (Color in Inspector)

3. **Create Health Text**:
   - Right-click on Canvas → UI → Text (TextMeshPro)
   - Name: `HealthText`

4. **Add HealthBar Script**:
   - Create empty object named `HUD` on Canvas
   - Add `HealthBar.cs` script to it
   - Drag `HealthBarFill` image to the Health Bar Fill field
   - Drag `HealthText` to the Health Text field

## Step 10: Setup Physics Layers (Optional but Recommended)

1. Go to **Edit → Project Settings → Tags and Layers**
2. Add Layer: `Player`
3. Add Layer: `Enemy`
4. Set collisions between layers appropriately

## Step 11: Run the Game!

1. Press **Play** in Unity Editor
2. Use **WASD** to move
3. Use **Mouse** to look around
4. **Left Click** to attack with sword
5. Fight the enemies!

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Enemies don't spawn | Ensure Enemy prefab is assigned to GameManager |
| Player can't move | Rigidbody needs mass > 0; Freeze Rotation must be set |
| Attacks don't work | Ensure Sword has SwordController.cs and sword is child of player |
| No UI visible | Check Canvas is in Overlay mode and images are visible |
| Enemy doesn't chase | Player must be tagged "Player" |

## Next Steps

- Add animations for attack and movement
- Create different enemy types
- Add sound effects
- Implement level progression
- Add particle effects for sword hits
