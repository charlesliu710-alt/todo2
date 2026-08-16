# AI Agent Guidelines for todo2

## Project Overview

**todo2** is a 3D action game built with **Unity** where players control a character with a sword to fight enemies on a large open map. MVP includes player movement, sword combat system, and a basic arena environment.

## Development Conventions

### Project Structure
```
Assets/
├── Scripts/
│   ├── Player/           (PlayerController, SwordController)
│   ├── Combat/           (CombatSystem, HitDetection)
│   ├── Enemies/          (EnemyAI, EnemyHealth)
│   ├── UI/               (HealthBar, HUD)
│   └── Managers/         (GameManager, InputManager)
├── Scenes/
│   ├── MainScene.unity   (Main gameplay scene)
│   └── MainMenu.unity    (Optional menu)
├── Prefabs/
│   ├── Enemy.prefab
│   ├── SwordVFX.prefab
│   └── UI elements
├── Materials/
├── Animations/
└── Audio/
```

### Tech Stack
- **Engine**: Unity 2022 LTS or newer
- **Language**: C#
- **Platform**: PC (Windows/Mac/Linux)
- **3D Models**: Use free assets from Unity Asset Store initially (or provide custom models)

### Common Tasks

When working on this project:

1. **Adding features**: Write scripts in `Assets/Scripts/` organized by category, create prefabs in `Assets/Prefabs/`, update scenes
2. **Combat mechanics**: Modify `SwordController.cs` (damage, range, cooldown) and `CombatSystem.cs` (hit detection, knockback)
3. **Enemy AI**: Enhance `EnemyAI.cs` (pathfinding, attack behavior, difficulty)
4. **UI**: Update health bars, damage numbers, and HUD elements in `Assets/Scripts/UI/`
5. **Performance**: Profile with Unity Profiler; optimize mesh colliders and enemy counts

### Code Quality Guidelines
- Follow C# naming conventions: `PascalCase` for classes/methods, `camelCase` for variables
- Use `[SerializeField]` and Inspector for tunable gameplay values (damage, speed, ranges)
- Comment complex logic, especially combat calculations and AI state changes
- Keep scripts under 300 lines; split into multiple files if needed
- Use prefabs for any entity that spawns multiple times (enemies, effects)

## Useful Commands

**In terminal (assuming Unity project root)**:
- `Unity -projectPath . -executeMethod YourEditorClass.MethodName` - Run automation
- `.gitignore` should exclude: `Library/`, `Temp/`, `obj/`, `.DS_Store`

**In Unity Editor**:
- Window > TextMesh Pro > Import TMP Essentials (for UI text)
- Window > 2D/3D Importer for asset setup

## Key Files
- [README.md](README.md) - Project overview and setup
- [Assets/Scripts/Player/PlayerController.cs](Assets/Scripts/Player/PlayerController.cs) - Player movement
- [Assets/Scripts/Combat/SwordController.cs](Assets/Scripts/Combat/SwordController.cs) - Sword combat logic
- [Assets/Scripts/Managers/GameManager.cs](Assets/Scripts/Managers/GameManager.cs) - Game state and spawning

## When to Ask for Clarification
- Game mechanic changes (sword range, damage values, enemy behavior)
- Scene design decisions (map size, enemy spawn locations)
- Performance targets or target platform details
- Visual/audio asset requirements

---

**Note**: This file will evolve as the project develops. Use `/init AGENTS.md` to refresh it with new learnings.
