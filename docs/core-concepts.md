# Core Concepts

This guide explains the fundamental concepts and architecture of Caldro.

## Game Loop

Caldro follows a traditional game loop pattern:

1. **Update Phase**: Handles game logic and physics
2. **Render Phase**: Draws everything to the screen
3. **Input Phase**: Processes user input

The loop runs at 60 FPS by default but can be adjusted.

## Scene System

Scenes are the building blocks of your game:

- Each scene represents a different game state (menu, gameplay, pause, etc.)
- Scenes can inherit from each other
- Transitions between scenes are handled automatically

Example:
```javascript
class MenuScene extends Caldro.Scene {
    update() {
        // Game logic
    }
    
    render() {
        // Drawing code
    }
}
```

## Entity Component System (ECS)

Caldro uses an ECS architecture:

- **Entities**: Game objects (player, enemies, etc.)
- **Components**: Properties and behaviors (position, movement, etc.)
- **Systems**: Logic that operates on entities with specific components

Example:
```javascript
// Create an entity
const player = new Caldro.Entity();

// Add components
player.addComponent(new Caldro.Position(100, 100));
player.addComponent(new Caldro.Sprite('player.png'));
```

## Physics System

Caldro includes two physics systems:

1. **Classic Physics**: Basic 2D physics (gravity, collision)
2. **Modern Physics**: Advanced features (rigid bodies, constraints)

Example:
```javascript
const physicsObject = new Caldro.PhysicsObject({
    mass: 1,
    velocity: new Caldro.Vector2(0, 0),
    gravity: true
});
```

## Rendering Pipeline

The rendering pipeline includes:

1. **Canvas Management**: Handles multiple canvases
2. **Sprite Batching**: Optimizes sprite rendering
3. **Camera System**: Controls view and perspective
4. **Post Processing**: Effects and filters

Example:
```javascript
const camera = new Caldro.Camera({
    position: new Caldro.Vector2(0, 0),
    zoom: 1.0
});
```

## Input Handling

Caldro supports multiple input types:

- Keyboard
- Mouse
- Touch
- Gamepads
- Custom input devices

Example:
```javascript
// Check for key press
game.input.isKeyPressed(Caldro.Keys.SPACE);

// Get mouse position
game.input.getMousePosition();
```

## Asset Management

Caldro provides tools for:

- Image loading and caching
- Audio management
- Font handling
- Asset preloading

Example:
```javascript
// Load assets
const assets = new Caldro.AssetManager();
assets.loadImage('player', 'player.png');
assets.loadAudio('jump', 'jump.wav');
```

## Best Practices

1. Keep scenes focused and modular
2. Use components for object properties
3. Separate game logic from rendering
4. Implement proper error handling
5. Use the built-in physics system when possible
6. Optimize asset loading

## Next Steps

1. Explore the [API Reference](./api-reference/README.md) for detailed documentation
2. Check out the [Examples](./examples/) for practical implementations
3. Read about [Performance Guide](./performance-guide.md) for optimization tips
