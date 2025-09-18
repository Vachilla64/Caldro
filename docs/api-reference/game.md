# Game Class

The main entry point for any Caldro application.

## Constructor

```javascript
new Caldro.Game(options)
```

### Parameters

- `options` (Object):
  - `canvasId` (string): ID of the canvas element
  - `width` (number): Canvas width
  - `height` (number): Canvas height
  - `backgroundColor` (string): Background color
  - `fps` (number): Target frames per second

## Methods

### start()

Starts the game loop.

```javascript
game.start()
```

### stop()

Stops the game loop.

```javascript
game.stop()
```

### setScene(scene)

Sets the current scene.

```javascript
game.setScene(new MyScene())
```

### getScene()

Gets the current scene.

```javascript
const currentScene = game.getScene()
```

### addSystem(system)

Adds a system to the game.

```javascript
game.addSystem(new PhysicsSystem())
```

### removeSystem(system)

Removes a system from the game.

```javascript
game.removeSystem(PhysicsSystem)
```

### addEntity(entity)

Adds an entity to the game.

```javascript
game.addEntity(new Player())
```

### removeEntity(entity)

Removes an entity from the game.

```javascript
game.removeEntity(player)
```

### update(deltaTime)

Updates the game state.

```javascript
game.update(deltaTime)
```

### render()

Renders the game.

```javascript
game.render()
```

## Properties

- `input` (InputManager): Handles input
- `audio` (AudioManager): Handles audio
- `assets` (AssetManager): Manages assets
- `camera` (Camera): Main camera
- `systems` (Array): List of active systems
- `entities` (Array): List of active entities

## Events

- `gameStart`: Fired when the game starts
- `gameStop`: Fired when the game stops
- `sceneChange`: Fired when the scene changes

## Best Practices

1. Initialize all systems before starting the game
2. Use the `deltaTime` parameter for smooth animations
3. Clean up entities and systems when changing scenes
4. Use the event system for inter-object communication
