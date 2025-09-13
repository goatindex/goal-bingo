# Phaser Architecture & Framework Reference - Goal Bingo

## **🎯 AI CONTEXT MANAGEMENT**

This document serves as the **single source of truth** for Phaser architecture, patterns, and best practices for the Goal Bingo project. It consolidates information from multiple sources to optimize AI assistant context management.

---

## **🏗️ PHASER CORE ARCHITECTURE**

### **Game Instance (`Phaser.Game`)**
- **Central Controller**: Main entry point managing all game systems
- **Official Documentation**: [Phaser.Game](https://newdocs.phaser.io/docs/3.85.1/Phaser.Game)
- **Key Properties**:
  - `game.scene` - Scene Manager instance
  - `game.events` - Global event emitter (available after READY event)
  - `game.registry` - Data Manager for persistence
  - `game.input` - Input Manager
  - `game.renderer` - Renderer (Canvas/WebGL)
  - `game.loop` - Game loop controller

### **Scene System (`Phaser.Scenes.SceneManager`)**
- **Scene Lifecycle**: `init()` → `preload()` → `create()` → `update()` → `shutdown()`
- **Scene Management**: `this.scene.start()`, `this.scene.stop()`, `this.scene.pause()`
- **Scene Communication**: `this.scene.get()`, `this.scene.launch()`
- **Scene Retrieval**: `game.scene.getScenes(isActive?, inReverse?)` - Get all scenes or filter by active status
- **Scene Status**: `game.scene.isActive(key)`, `game.scene.isVisible(key)`, `game.scene.isSleeping(key)`

### **Data Management (`Phaser.Data.DataManager`)**
- **Global Data**: `game.registry.set()`, `game.registry.get()`, `game.registry.list`
- **Data Events**: `Phaser.Data.Events.SET_DATA`, `CHANGE_DATA`, `REMOVE_DATA`
- **Persistence**: Built-in data persistence system

### **Event System (`Phaser.Events.EventEmitter`)**
- **Global Events**: `game.events.on()`, `game.events.emit()`, `game.events.off()`
- **Core Events**: `Phaser.Core.Events.READY`, `DESTROY`
- **Scene Events**: `Phaser.Scenes.Events.CREATE`, `UPDATE`, `SHUTDOWN`

---

## **🎮 GOAL BINGO PHASER IMPLEMENTATION**

### **Current Architecture (100% Phaser Native)**

```
┌─────────────────────────────────────────────────────────┐
│                    Goal Bingo App                       │
├─────────────────────────────────────────────────────────┤
│  Phaser Scenes (Presentation Layer)                     │
│  ├── BootScene (Initialization)                         │
│  ├── PreloadScene (Asset Loading)                       │
│  ├── MainMenuScene (Navigation)                         │
│  ├── GoalLibraryScene (Goal Management)                 │
│  ├── BingoGridScene (Game Play)                         │
│  └── RewardsScene (Reward Management)                   │
├─────────────────────────────────────────────────────────┤
│  Phaser Native Systems (Core Layer)                     │
│  ├── game.registry (Data Persistence)                   │
│  ├── game.events (Event Management)                     │
│  ├── this.sound.* (Audio Management)                    │
│  ├── this.tweens.* (Animation Management)               │
│  ├── this.textures.* (Texture Management)               │
│  ├── this.input.* (Input Management)                    │
│  ├── this.cameras.* (Camera Management)                 │
│  └── this.add.particles() (Particle Systems)            │
├─────────────────────────────────────────────────────────┤
│  Utility Classes (Domain Logic)                         │
│  ├── ApplicationStateManager (State Logic)              │
│  ├── StorageManager (Persistence Logic)                 │
│  └── DebugPlugin (Visual Debugging)                     │
├─────────────────────────────────────────────────────────┤
│  Data Layer (Phaser Data Manager)                       │
│  ├── Application State (Goals, Rewards, Game State)     │
│  ├── User Preferences (Settings, UI State)              │
│  └── Session Data (Temporary State)                     │
└─────────────────────────────────────────────────────────┘
```

### **Key Implementation Patterns**

#### **1. Game Initialization**
```javascript
// main.js - Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    scene: [BootScene, PreloadScene, MainMenuScene, GoalLibraryScene, BingoGridScene, RewardsScene],
    plugins: {
        global: [
            { key: 'DebugPlugin', plugin: DebugPlugin, start: true }
        ]
    }
};

const game = new Phaser.Game(config);

// Wait for READY event before initializing systems
game.events.once(Phaser.Core.Events.READY, async () => {
    // Initialize ApplicationStateManager
    const appStateManager = new ApplicationStateManager(game);
    await appStateManager.initialize();
    
    // Initialize StorageManager
    const storageManager = new StorageManager(game, appStateManager);
    await storageManager.initialize();
    
    // Attach to game object
    game.appStateManager = appStateManager;
    game.storageManager = storageManager;
});
```

#### **2. Data Management (100% Native)**
```javascript
// ApplicationStateManager.js - Domain logic utility
export class ApplicationStateManager {
    constructor(game) {
        this.game = game;
        this.dataKeys = {
            goals: 'appState.goals',
            rewards: 'appState.rewards',
            gameState: 'appState.gameState',
            categories: 'appState.categories'
        };
    }
    
    async initialize(loadedData = null) {
        // Use Phaser's built-in data system
        if (loadedData) {
            this.game.registry.set('appState', loadedData);
        } else {
            this.game.registry.set('appState', new ApplicationState());
        }
        
        // Emit initialization event
        this.game.events.emit('stateInitialized', this.getApplicationState());
    }
    
    getGoals() {
        return this.game.registry.get(this.dataKeys.goals) || [];
    }
    
    updateGoals(goals) {
        this.game.registry.set(this.dataKeys.goals, goals);
        this.game.events.emit('goalsUpdated', goals);
    }
}
```

#### **3. Event Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in event system
export class BingoGridScene extends Phaser.Scene {
    create() {
        // Listen to data changes
        this.game.registry.events.on(Phaser.Data.Events.SET_DATA, this.onDataChanged, this);
        
        // Listen to application events
        this.game.events.on('goalsUpdated', this.onGoalsUpdated, this);
    }
    
    onDataChanged(key, value) {
        if (key === 'appState.goals') {
            this.updateGrid();
        }
    }
    
    shutdown() {
        // Clean up event listeners
        this.game.registry.events.off(Phaser.Data.Events.SET_DATA, this.onDataChanged, this);
        this.game.events.off('goalsUpdated', this.onGoalsUpdated, this);
    }
}
```

---

## **🚨 CRITICAL ANTI-PATTERNS (NEVER CREATE)**

### **❌ Custom Data Management Plugins**
```javascript
// ❌ WRONG - Don't create custom data managers
class DataManagerPlugin extends BasePlugin {
    set(key, value) { /* custom logic */ }
    get(key) { /* custom logic */ }
}

// ✅ CORRECT - Use Phaser's built-in data system
game.registry.set('goals', goals);
const goals = game.registry.get('goals');
```

### **❌ Custom Event Management Plugins**
```javascript
// ❌ WRONG - Don't create custom event managers
class EventManagerPlugin extends BasePlugin {
    on(event, callback) { /* custom logic */ }
    emit(event, data) { /* custom logic */ }
}

// ✅ CORRECT - Use Phaser's built-in event system
game.events.on('goalsUpdated', callback);
game.events.emit('goalsUpdated', goals);
```

### **❌ Custom Audio Management Plugins**
```javascript
// ❌ WRONG - Don't create custom audio managers
class AudioManagerPlugin extends BasePlugin {
    play(sound) { /* custom logic */ }
    stop(sound) { /* custom logic */ }
}

// ✅ CORRECT - Use Phaser's built-in audio system
this.sound.play('goalComplete');
this.sound.stop('backgroundMusic');
```

### **❌ Custom Tween Management Plugins**
```javascript
// ❌ WRONG - Don't create custom tween managers
class TweenManagerPlugin extends BasePlugin {
    tween(target) { /* custom logic */ }
    timeline() { /* custom logic */ }
}

// ✅ CORRECT - Use Phaser's built-in tween system
this.tweens.add({
    targets: goalCard,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 200,
    yoyo: true
});
```

---

## **✅ LEGITIMATE CUSTOM PLUGINS (5% Usage)**

### **DebugPlugin - Visual Debugging Extension**
```javascript
// ✅ CORRECT - Legitimate custom plugin for edge case functionality
export class DebugPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.scene = null;
        this.graphics = null;
    }
    
    start() {
        this.scene = this.scene || this.game.scene.getScene('BingoGridScene');
        this.graphics = this.scene.add.graphics();
    }
    
    drawGridOverlay() {
        // Custom visual debugging functionality
        // that extends Phaser's capabilities
    }
}
```

### **When to Create Custom Plugins**
1. **Visual Debugging**: Custom graphics overlays
2. **Performance Monitoring**: Custom performance metrics
3. **External Integrations**: Third-party API wrappers
4. **Specialized Rendering**: Custom rendering techniques
5. **Edge Case Functionality**: Features Phaser doesn't provide

---

## **📊 PHASER NATIVE CAPABILITIES REFERENCE**

### **Audio Management (`this.sound.*`)**
```javascript
// Audio System
this.sound.play('goalComplete', { volume: 0.5 });
this.sound.stop('backgroundMusic');
this.sound.pause('backgroundMusic');
this.sound.resume('backgroundMusic');
this.sound.setVolume(0.8);
```

### **Animation Management (`this.tweens.*`)**
```javascript
// Tween System
this.tweens.add({
    targets: goalCard,
    x: 100,
    y: 100,
    duration: 500,
    ease: 'Power2'
});

// Timeline System
const timeline = this.tweens.timeline({
    tweens: [
        { targets: card, x: 100, duration: 200 },
        { targets: card, y: 100, duration: 200 }
    ]
});
```

### **Texture Management (`this.textures.*`)**
```javascript
// Texture System
this.textures.addBase64('goalCard', base64Data);
this.textures.get('goalCard');
this.textures.remove('goalCard');
this.textures.list;
```

### **Input Management (`this.input.*`)**
```javascript
// Input System
this.input.on('pointerdown', this.onPointerDown, this);
this.input.keyboard.on('keydown-SPACE', this.onSpaceKey, this);
this.input.gamepad.on('down', this.onGamepadButton, this);
```

### **Camera Management (`this.cameras.*`)**
```javascript
// Camera System
this.cameras.main.setZoom(1.2);
this.cameras.main.pan(100, 100, 500);
this.cameras.main.fadeIn(1000);
this.cameras.main.shake(100, 0.01);
```

### **Particle Systems (`this.add.particles()`)**
```javascript
// Particle System
const particles = this.add.particles(0, 0, 'sparkle', {
    speed: { min: 100, max: 200 },
    scale: { start: 1, end: 0 },
    lifespan: 1000
});
```

---

## **🔧 IMPLEMENTATION BEST PRACTICES**

### **1. System Initialization Pattern**
```javascript
// Always wait for READY event
game.events.once(Phaser.Core.Events.READY, async () => {
    // Initialize systems here
    // game.events is guaranteed to be available
});
```

### **2. Data Management Pattern**
```javascript
// Use game.registry for persistence
game.registry.set('appState', applicationState);
const state = game.registry.get('appState');

// Listen to data changes
game.registry.events.on(Phaser.Data.Events.SET_DATA, (key, value) => {
    if (key === 'appState.goals') {
        // Handle goals update
    }
});
```

### **3. Event Management Pattern**
```javascript
// Use game.events for application events
game.events.on('goalsUpdated', this.onGoalsUpdated, this);
game.events.emit('goalsUpdated', goals);

// Clean up in shutdown
shutdown() {
    game.events.off('goalsUpdated', this.onGoalsUpdated, this);
}
```

### **4. Scene Communication Pattern**
```javascript
// Scene-to-scene communication
this.scene.get('GoalLibraryScene').updateGoals(goals);
this.scene.launch('RewardsScene', { rewardData: reward });
```

### **5. Testing Pattern (Phaser-Compliant)**
```javascript
// ✅ CORRECT - Use documented Phaser API for testing
const activeScenes = game.scene.getScenes(true);
const activeScene = activeScenes.length > 0 ? activeScenes[0].scene.key : null;

// ✅ CORRECT - Check specific scene status
const isMainMenuActive = game.scene.isActive('MainMenuScene');
const isMainMenuVisible = game.scene.isVisible('MainMenuScene');

// ❌ WRONG - Don't use non-existent methods
// const activeScene = game.scene.getActiveScene()?.scene?.key; // This doesn't exist!
```

---

## **📈 PERFORMANCE CONSIDERATIONS**

### **Memory Management**
- **Event Cleanup**: Always remove event listeners in `shutdown()`
- **Object Pooling**: Reuse Phaser objects where possible
- **Texture Management**: Remove unused textures

### **Rendering Optimization**
- **Batch Operations**: Group similar operations
- **Culling**: Only render visible objects
- **LOD**: Use level-of-detail for complex scenes

### **Data Optimization**
- **Incremental Updates**: Only update changed data
- **Compression**: Use efficient data formats
- **Cleanup**: Remove old/unused data

---

## **🧪 TESTING STRATEGY**

### **Unit Testing**
- **Scene Testing**: Test individual scene functionality
- **Utility Testing**: Test ApplicationStateManager and StorageManager
- **Mock Phaser**: Use mocks for Phaser dependencies

### **Integration Testing**
- **Scene Flow**: Test scene transitions
- **Data Persistence**: Test data save/load
- **Event Handling**: Test event propagation

### **E2E Testing (Playwright)**
- **UI Interactions**: Test button clicks and DOM elements
- **Scene Transitions**: Use `game.scene.getScenes(true)` to verify active scenes
- **Game State**: Validate `game.isRunning`, `game.registry`, `game.events`
- **Canvas Properties**: Test `game.canvas.width`, `game.canvas.height`

### **WebGL Testing**
- **Visual Regression**: Use `canvas.toDataURL()` for WebGL content
- **Performance Metrics**: Test `game.loop.actualFps`, `game.renderer.drawCalls`
- **State Validation**: Use `page.evaluate()` to access WebGL context

### **Performance Testing**
- **Memory Leaks**: Monitor memory usage
- **Frame Rate**: Ensure smooth 60fps
- **Load Times**: Optimize asset loading

---

## **📚 REFERENCE LINKS**

### **Official Phaser Documentation**
- [Phaser.Game](https://newdocs.phaser.io/docs/3.85.1/Phaser.Game)
- [Phaser.Scenes.SceneManager](https://newdocs.phaser.io/docs/3.85.1/Phaser.Scenes.SceneManager)
- [Phaser.Data.DataManager](https://newdocs.phaser.io/docs/3.85.1/Phaser.Data.DataManager)
- [Phaser.Events.EventEmitter](https://newdocs.phaser.io/docs/3.85.1/Phaser.Events.EventEmitter)

### **Phaser Plugins**
- [Plugin System](https://newdocs.phaser.io/docs/3.85.1/Phaser.Plugins.PluginManager)
- [BasePlugin](https://newdocs.phaser.io/docs/3.85.1/Phaser.Plugins.BasePlugin)

### **Context7 MCP Integration**
- Use `mcp_Context7_resolve-library-id` for Phaser library lookup
- Use `mcp_Context7_get-library-docs` for up-to-date documentation

---

## **🎯 AI ASSISTANT GUIDELINES**

### **When Working with Phaser**
1. **Always check official documentation first**
2. **Use Context7 MCP for up-to-date information**
3. **Prefer native Phaser systems over custom implementations**
4. **Follow the 95% native, 5% custom rule**
5. **Reference this document for architecture decisions**

### **Common Mistakes to Avoid**
1. **Creating custom data managers** → Use `game.registry`
2. **Creating custom event managers** → Use `game.events`
3. **Accessing `game.events` before READY** → Wait for READY event
4. **Not cleaning up event listeners** → Remove in `shutdown()`
5. **Reinventing Phaser functionality** → Use built-in systems
6. **Using non-existent Scene Manager methods** → Use `game.scene.getScenes(true)` not `getActiveScene()`
7. **Testing with incorrect API assumptions** → Always verify methods exist in documentation

---

*This document consolidates Phaser architecture knowledge for optimal AI assistant context management and consistent framework usage.*
