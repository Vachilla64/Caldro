# Getting Started with Caldro

Welcome to Caldro! This guide will help you set up your first game project using Caldro.

## Prerequisites

- Modern web browser
- Basic knowledge of JavaScript
- HTML5 Canvas experience (recommended)

## Installation

Caldro can be used in two ways:

### 1. CDN (Recommended for quick testing)
```html
<script src="https://cdn.jsdelivr.net/npm/caldro@latest/dist/caldro.min.js"></script>
```

### 2. Local Installation
Download the latest release from the [releases page](https://github.com/yourusername/caldro/releases) and include it in your HTML:
```html
<script src="path/to/caldro.min.js"></script>
```

## Creating Your First Game

Here's a simple example to get you started:

```javascript
// Initialize Caldro
const game = new Caldro.Game({
    canvasId: 'gameCanvas',
    width: 800,
    height: 600,
    backgroundColor: '#000000'
});

// Create a simple scene
class MyScene extends Caldro.Scene {
    constructor() {
        super();
        
        // Add a simple rectangle
        const rect = new Caldro.Rectangle({
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            color: '#FF0000'
        });
        
        this.add(rect);
    }
}

// Set the initial scene
game.setScene(new MyScene());

// Start the game loop
game.start();
```

## Basic Game Structure

A typical Caldro game consists of:

1. **Game Instance**: The main game object that manages everything
2. **Scenes**: Different game states or levels
3. **Entities**: Game objects (sprites, UI elements, etc.)
4. **Systems**: Game logic and mechanics

## Next Steps

1. Explore the [API Reference](./api-reference/README.md) for detailed documentation
2. Check out the [Examples](./examples/) directory for more complex demos
3. Read about [Best Practices](./best-practices.md) for efficient game development

## Troubleshooting

If you encounter any issues:

1. Check the browser's developer console (F12)
2. Make sure you're using the latest version of Caldro
3. Verify your browser supports HTML5 Canvas
4. Check the [FAQ](./faq.md) for common issues
