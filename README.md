# Broke A Bone

## Run the browser game

Python 3 is required. From the project folder, run:

```bash
python3 server.py
```

Then open [http://localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`. To choose another port, run `python3 server.py --port 8080`.

# todo2 - 3D Action Game

A fast-paced 3D action game where you control a sword-wielding character to fight enemies on an expansive map.

## MVP Features

- **Player Movement**: WASD movement with smooth camera control
- **Sword Combat System**: Attack with cooldown, range-based hit detection
- **Enemy Encounters**: Basic enemy AI with health and knockback
- **Arena Map**: Large open 3D environment for combat
- **Health UI**: Player and enemy health bars

## Setup Instructions

### Prerequisites
- **Unity 2022 LTS or newer**
- Windows, Mac, or Linux

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/charlesliu710-alt/todo2.git
   cd todo2
   ```

2. **Open in Unity**
   - Open Unity Hub
   - Click "Add" → Select the `todo2` folder
   - Open the project with Unity 2022 LTS or newer

3. **Load the Main Scene**
   - In Project window: `Assets/Scenes/MainScene.unity`
   - Double-click to open

4. **Play**
   - Press Play in the Unity Editor
   - Use **WASD** to move, **Mouse** to look around, **Left Click** to attack

## Project Structure

See [AGENTS.md](AGENTS.md) for detailed folder organization and conventions.

## Key Scripts

| Script | Purpose |
|--------|---------|
| `PlayerController.cs` | Handles player movement and input |
| `SwordController.cs` | Manages sword attacks, range, and cooldown |
| `CombatSystem.cs` | Hit detection and damage application |
| `EnemyAI.cs` | Enemy movement and attack behavior |
| `GameManager.cs` | Game state and enemy spawning |

## Controls

| Input | Action |
|-------|--------|
| **W/A/S/D** | Move forward/left/back/right |
| **Mouse Move** | Look around |
| **Left Click** | Attack with sword |
| **ESC** | Pause (future) |

## Development

For contributing and conventions, see [AGENTS.md](AGENTS.md).

### Common Tasks
- **Add a new enemy type**: Create new script in `Assets/Scripts/Enemies/`, extend `EnemyBase`
- **Adjust sword damage/cooldown**: Edit `SwordController.cs` Inspector values
- **Modify map**: Edit `Assets/Scenes/MainScene.unity` in Unity Editor
- **Change UI**: Update scripts in `Assets/Scripts/UI/`

## Performance Notes

- Enemy limit: ~50-100 depending on system (adjust in `GameManager.cs`)
- Mesh colliders on terrain can impact performance; use compound colliders
- Profile with Unity Profiler (Window > Analysis > Profiler)

## License

[Add license info here]

## Contact

Created by: charlesliu710-alt
