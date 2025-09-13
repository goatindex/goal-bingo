# Phaser Patterns & Best Practices - Goal Bingo Project

## **🎯 AI CONTEXT MANAGEMENT**

This document provides comprehensive Phaser.js patterns, best practices, and anti-patterns for the Goal Bingo project. It serves as a reference for AI assistants to ensure consistent, correct Phaser implementation.

---

## **🏗️ GAME INITIALIZATION PATTERNS**

### **✅ Correct Game Initialization**
```javascript
// main.js - Proper game initialization
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

// ✅ CORRECT - Wait for READY event before initializing systems
game.events.once(Phaser.Core.Events.READY, async () => {
    console.log('Game ready - initializing systems');
    
    try {
        // Initialize ApplicationStateManager (domain logic utility)
        const appStateManager = new ApplicationStateManager(game);
        await appStateManager.initialize();
        
        // Initialize StorageManager (persistence utility)
        const storageManager = new StorageManager(game, appStateManager);
        await storageManager.initialize();
        
        // Attach to game object for easy access
        game.appStateManager = appStateManager;
        game.storageManager = storageManager;
        
        console.log('All systems initialized successfully');
    } catch (error) {
        console.error('Failed to initialize systems:', error);
    }
});
```

### **❌ Anti-Pattern: Immediate Event Access**
```javascript
// ❌ WRONG - game.events not available immediately
const game = new Phaser.Game(config);
game.events.on('ready', callback); // Will fail!

// ❌ WRONG - Accessing game.events before READY
const game = new Phaser.Game(config);
game.events.emit('customEvent', data); // Will fail!
```

### **✅ Correct Scene Initialization**
```javascript
// Scene files - Proper scene lifecycle
export class BingoGridScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BingoGridScene' });
    }
    
    init(data) {
        // Scene initialization data
        this.gridSize = data.gridSize || 5;
    }
    
    preload() {
        // Load scene-specific assets
        this.load.image('goalCard', 'assets/goal-card.png');
    }
    
    create() {
        // Scene is ready, safe to use this.events
        this.setupEventListeners();
        this.createGrid();
    }
    
    update(time, delta) {
        // Game loop updates
    }
    
    shutdown() {
        // Clean up resources
        this.cleanupEventListeners();
    }
}
```

---

## **🎭 SCENE ACCESS PATTERNS**

### **✅ Correct Scene Access Pattern**
```javascript
// Debug tools - Correct way to access scene instances
export class DebugTools {
    /**
     * Get Scene class instance for a specific scene key
     * 
     * PHASER SCENE ACCESS PATTERN:
     * - game.scene.scenes returns array of Scene Systems objects
     * - Each Scene Systems object has a 'scene' property that references the actual Scene class instance
     * - Scene class instance has methods like create(), init(), preload(), update(), etc.
     * - Scene Systems object has methods like isActive(), isPaused(), isVisible(), etc.
     */
    getSceneInstance(sceneKey) {
        try {
            if (!this.game || !this.game.scene || !this.game.scene.scenes) {
                return null;
            }
            
            const sceneSystems = this.game.scene.scenes.find(scene => 
                scene && scene.scene && scene.scene.key === sceneKey
            );
            
            if (!sceneSystems || !sceneSystems.scene) {
                return null;
            }
            
            // PHASER STANDARD: Return the actual Scene class instance
            // This is the object that has create(), init(), preload(), etc. methods
            return sceneSystems.scene;
        } catch (error) {
            this.logger.error('Error getting scene instance', { error: error.message, sceneKey });
            return null;
        }
    }

    /**
     * Call a method on a Scene class instance
     * 
     * PHASER SCENE ACCESS PATTERN:
     * - This method safely calls methods on the actual Scene class instance
     * - Use this for calling Scene lifecycle methods like create(), init(), etc.
     */
    callSceneMethod(sceneKey, methodName, ...args) {
        try {
            const sceneInstance = this.getSceneInstance(sceneKey);
            
            if (!sceneInstance) {
                return { error: `Scene instance not found for key: ${sceneKey}` };
            }
            
            if (typeof sceneInstance[methodName] !== 'function') {
                return { error: `Method ${methodName} not found on scene ${sceneKey}` };
            }
            
            const result = sceneInstance[methodName](...args);
            return { success: true, result };
        } catch (error) {
            this.logger.error('Error calling scene method', { 
                error: error.message, 
                sceneKey, 
                methodName 
            });
            return { error: error.message };
        }
    }
}
```

### **❌ Anti-Pattern: Incorrect Scene Access**
```javascript
// ❌ WRONG - Don't try to call methods on Scene Systems objects
const activeScenes = game.scene.getScenes(true);
const goalLibraryScene = activeScenes.find(scene => scene.scene.key === 'GoalLibraryScene');
const scene = goalLibraryScene.scene; // This is the Scene Systems object
scene.create(); // ❌ This will fail - Scene Systems object doesn't have create()

// ❌ WRONG - Don't assume scene.scene is the Scene class instance
const scene = game.scene.scenes[0].scene; // This is still the Scene Systems object
scene.init(); // ❌ This will fail - Scene Systems object doesn't have init()
```

### **✅ Correct Scene Systems Access**
```javascript
// ✅ CORRECT - Access Scene Systems object methods
const activeScenes = game.scene.getScenes(true);
const goalLibraryScene = activeScenes.find(scene => scene.scene.key === 'GoalLibraryScene');
const sceneSystems = goalLibraryScene.scene; // This is the Scene Systems object

// Use Scene Systems object methods
const isActive = sceneSystems.isActive();
const isPaused = sceneSystems.isPaused();
const isVisible = sceneSystems.isVisible();
const children = sceneSystems.children.list.length;
```

### **✅ Correct Scene Class Instance Access**
```javascript
// ✅ CORRECT - Access actual Scene class instance
const activeScenes = game.scene.getScenes(true);
const goalLibraryScene = activeScenes.find(scene => scene.scene.key === 'GoalLibraryScene');
const sceneInstance = goalLibraryScene.scene.scene; // This is the actual Scene class instance

// Use Scene class instance methods
sceneInstance.create(); // ✅ This will work
sceneInstance.init();   // ✅ This will work
sceneInstance.update(); // ✅ This will work
```

### **🔍 Understanding Phaser Scene Object Structure**
```javascript
// Phaser Scene Object Hierarchy:
game.scene.scenes = [
    {
        // This is a Scene Systems object
        scene: {
            // This is the actual Scene class instance
            key: 'GoalLibraryScene',
            create: function() { ... },
            init: function() { ... },
            preload: function() { ... },
            update: function() { ... },
            shutdown: function() { ... }
        },
        // Scene Systems object methods
        isActive: function() { ... },
        isPaused: function() { ... },
        isVisible: function() { ... },
        children: { list: [...] }
    }
]
```

### **📝 Key Differences**
| Object Type | Methods Available | Purpose |
|-------------|------------------|---------|
| **Scene Systems Object** | `isActive()`, `isPaused()`, `isVisible()`, `children` | Scene state management |
| **Scene Class Instance** | `create()`, `init()`, `preload()`, `update()`, `shutdown()` | Scene lifecycle methods |

### **⚠️ Common Mistakes**
1. **Calling lifecycle methods on Scene Systems objects** - Use `scene.scene.create()` not `scene.create()`
2. **Assuming scene.scene is the Scene class instance** - It's actually the Scene Systems object
3. **Not checking for null references** - Always validate scene objects before accessing properties
4. **Using wrong object for different purposes** - Use Scene Systems for state, Scene Class Instance for lifecycle

---

## **📊 DATA MANAGEMENT PATTERNS**

### **✅ Correct Data Management (100% Native)**
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
    
    getApplicationState() {
        return this.game.registry.get('appState') || new ApplicationState();
    }
}
```

### **❌ Anti-Pattern: Custom Data Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom data managers
class DataManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.data = new Map();
    }
    
    set(key, value) {
        this.data.set(key, value);
        this.events.emit('dataChanged', key, value);
    }
    
    get(key) {
        return this.data.get(key);
    }
}

// ❌ WRONG - Don't register custom data manager plugins
pluginRegistry.register('DataManagerPlugin', DataManagerPlugin, {
    enabled: true
}, []);
```

### **✅ Correct Data Event Handling**
```javascript
// Scene files - Listen to data changes
export class BingoGridScene extends Phaser.Scene {
    create() {
        // Listen to Phaser's built-in data events
        this.game.registry.events.on(Phaser.Data.Events.SET_DATA, this.onDataChanged, this);
        this.game.registry.events.on(Phaser.Data.Events.CHANGE_DATA, this.onDataChanged, this);
        
        // Listen to application events
        this.game.events.on('goalsUpdated', this.onGoalsUpdated, this);
    }
    
    onDataChanged(key, value) {
        if (key === 'appState.goals') {
            this.updateGrid();
        }
    }
    
    onGoalsUpdated(goals) {
        this.renderGoalCards(goals);
    }
    
    shutdown() {
        // Clean up event listeners
        this.game.registry.events.off(Phaser.Data.Events.SET_DATA, this.onDataChanged, this);
        this.game.registry.events.off(Phaser.Data.Events.CHANGE_DATA, this.onDataChanged, this);
        this.game.events.off('goalsUpdated', this.onGoalsUpdated, this);
    }
}
```

---

## **🎵 EVENT MANAGEMENT PATTERNS**

### **✅ Correct Event Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in event system
export class MainMenuScene extends Phaser.Scene {
    create() {
        // Use Phaser's built-in event system
        this.game.events.on('goalsUpdated', this.updateStats, this);
        this.game.events.on('rewardsUpdated', this.updateRewards, this);
        
        // Scene-specific events
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }
    
    updateStats(goals) {
        const completedGoals = goals.filter(goal => goal.state === 'completed');
        this.updateStatsDisplay(completedGoals.length);
    }
    
    cleanup() {
        // Clean up event listeners
        this.game.events.off('goalsUpdated', this.updateStats, this);
        this.game.events.off('rewardsUpdated', this.updateRewards, this);
    }
}
```

### **❌ Anti-Pattern: Custom Event Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom event managers
class EventManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.listeners = new Map();
    }
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
}
```

### **✅ Correct Event Constants Usage**
```javascript
// ✅ CORRECT - Use documented Phaser constants
game.events.on(Phaser.Core.Events.READY, handler);
game.events.on(Phaser.Core.Events.BOOT, handler);
game.events.on(Phaser.Core.Events.PRE_STEP, handler);

// Scene events
this.events.on(Phaser.Scenes.Events.CREATE, handler);
this.events.on(Phaser.Scenes.Events.START, handler);
this.events.on(Phaser.Scenes.Events.SHUTDOWN, handler);

// Input events
this.input.on(Phaser.Input.Events.POINTER_DOWN, handler);
this.input.keyboard.on(Phaser.Input.Keyboard.Events.KEY_DOWN, handler);

// Data events
this.game.registry.events.on(Phaser.Data.Events.SET_DATA, handler);
this.game.registry.events.on(Phaser.Data.Events.CHANGE_DATA, handler);
this.game.registry.events.on(Phaser.Data.Events.REMOVE_DATA, handler);
```

### **❌ Anti-Pattern: String Literals**
```javascript
// ❌ WRONG - Don't use string literals
game.events.on('ready', handler);
this.events.on('create', handler);
this.input.on('pointerdown', handler);

// ❌ WRONG - Inconsistent event names
game.events.emit('goals_updated', goals);
game.events.emit('goalsUpdated', goals);
game.events.emit('goals-updated', goals);
```

---

## **🎨 AUDIO MANAGEMENT PATTERNS**

### **✅ Correct Audio Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in audio system
export class BingoGridScene extends Phaser.Scene {
    preload() {
        // Load audio assets
        this.load.audio('goalComplete', 'assets/audio/goal-complete.mp3');
        this.load.audio('bingoWin', 'assets/audio/bingo-win.mp3');
        this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
    }
    
    create() {
        // Play background music
        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.3
        });
        this.backgroundMusic.play();
        
        // Set up goal completion sound
        this.goalCompleteSound = this.sound.add('goalComplete', {
            volume: 0.5
        });
    }
    
    onGoalCompleted(goal) {
        // Play completion sound
        this.goalCompleteSound.play();
        
        // Check for bingo
        if (this.checkForBingo()) {
            this.sound.play('bingoWin', { volume: 0.8 });
        }
    }
    
    shutdown() {
        // Stop background music
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
    }
}
```

### **❌ Anti-Pattern: Custom Audio Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom audio managers
class AudioManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.sounds = new Map();
    }
    
    play(soundKey, options = {}) {
        const sound = this.sounds.get(soundKey);
        if (sound) {
            sound.play(options);
        }
    }
    
    stop(soundKey) {
        const sound = this.sounds.get(soundKey);
        if (sound) {
            sound.stop();
        }
    }
}
```

---

## **🎭 ANIMATION MANAGEMENT PATTERNS**

### **✅ Correct Animation Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in tween system
export class BingoGridScene extends Phaser.Scene {
    create() {
        this.setupAnimations();
    }
    
    setupAnimations() {
        // Goal card hover animation
        this.goalCards.forEach(card => {
            card.setInteractive();
            card.on('pointerover', () => {
                this.tweens.add({
                    targets: card,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });
            
            card.on('pointerout', () => {
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });
        });
    }
    
    onGoalCompleted(goalCard) {
        // Completion animation
        this.tweens.add({
            targets: goalCard,
            alpha: 0.5,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                goalCard.setVisible(false);
            }
        });
    }
    
    onBingoWin() {
        // Win celebration animation
        const timeline = this.tweens.timeline({
            tweens: [
                {
                    targets: this.bingoText,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    ease: 'Power2'
                },
                {
                    targets: this.bingoText,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                }
            ],
            repeat: 3
        });
    }
}
```

### **❌ Anti-Pattern: Custom Tween Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom tween managers
class TweenManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.tweens = [];
    }
    
    tween(target, properties, duration) {
        // Custom tween logic
    }
    
    timeline(tweens) {
        // Custom timeline logic
    }
}
```

---

## **🎮 INPUT MANAGEMENT PATTERNS**

### **✅ Correct Input Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in input system
export class BingoGridScene extends Phaser.Scene {
    create() {
        this.setupInput();
    }
    
    setupInput() {
        // Pointer input
        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
        
        // Keyboard input
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.KEY_DOWN, this.onKeyDown, this);
        
        // Gamepad input
        this.input.gamepad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, this.onGamepadButton, this);
    }
    
    onPointerDown(pointer, gameObject) {
        if (gameObject && gameObject.isGoalCard) {
            this.selectGoalCard(gameObject);
        }
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'Space':
                this.toggleGoalSelection();
                break;
            case 'Enter':
                this.completeSelectedGoal();
                break;
            case 'Escape':
                this.cancelSelection();
                break;
        }
    }
    
    onGamepadButton(event) {
        const { button } = event;
        if (button.index === 0) { // A button
            this.toggleGoalSelection();
        }
    }
}
```

### **❌ Anti-Pattern: Custom Input Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom input managers
class InputManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.keyBindings = new Map();
    }
    
    bindKey(key, callback) {
        this.keyBindings.set(key, callback);
    }
    
    handleInput(event) {
        const callback = this.keyBindings.get(event.key);
        if (callback) {
            callback(event);
        }
    }
}
```

---

## **📷 CAMERA MANAGEMENT PATTERNS**

### **✅ Correct Camera Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in camera system
export class BingoGridScene extends Phaser.Scene {
    create() {
        this.setupCamera();
    }
    
    setupCamera() {
        // Camera zoom and pan
        this.cameras.main.setZoom(1.0);
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        
        // Camera effects
        this.cameras.main.fadeIn(1000);
        
        // Camera controls
        this.setupCameraControls();
    }
    
    setupCameraControls() {
        // Zoom controls
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const zoom = this.cameras.main.zoom;
            const newZoom = Phaser.Math.Clamp(zoom + deltaY * 0.001, 0.5, 2.0);
            this.cameras.main.setZoom(newZoom);
        });
        
        // Pan controls
        let isDragging = false;
        this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
            isDragging = true;
        });
        
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
            if (isDragging) {
                this.cameras.main.scrollX -= pointer.movementX;
                this.cameras.main.scrollY -= pointer.movementY;
            }
        });
        
        this.input.on(Phaser.Input.Events.POINTER_UP, () => {
            isDragging = false;
        });
    }
    
    onBingoWin() {
        // Camera shake effect
        this.cameras.main.shake(500, 0.01);
        
        // Camera flash effect
        this.cameras.main.flash(200, 255, 255, 255);
    }
}
```

### **❌ Anti-Pattern: Custom Camera Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom camera managers
class CameraManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.camera = null;
    }
    
    setZoom(zoom) {
        if (this.camera) {
            this.camera.setZoom(zoom);
        }
    }
    
    pan(x, y, duration) {
        if (this.camera) {
            this.camera.pan(x, y, duration);
        }
    }
}
```

---

## **🎆 PARTICLE SYSTEM PATTERNS**

### **✅ Correct Particle Management (100% Native)**
```javascript
// Scene files - Using Phaser's built-in particle system
export class BingoGridScene extends Phaser.Scene {
    preload() {
        // Load particle texture
        this.load.image('sparkle', 'assets/particles/sparkle.png');
    }
    
    create() {
        this.setupParticles();
    }
    
    setupParticles() {
        // Create particle emitter
        this.particles = this.add.particles(0, 0, 'sparkle', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 5
        });
        
        // Start particle system
        this.particles.start();
    }
    
    onGoalCompleted(goalCard) {
        // Emit particles at goal card position
        this.particles.setPosition(goalCard.x, goalCard.y);
        this.particles.explode(10);
    }
    
    onBingoWin() {
        // Big particle explosion
        this.particles.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);
        this.particles.explode(50);
    }
}
```

### **❌ Anti-Pattern: Custom Particle Manager Plugin**
```javascript
// ❌ WRONG - Don't create custom particle managers
class ParticleManagerPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.emitters = new Map();
    }
    
    createEmitter(key, config) {
        const emitter = this.scene.add.particles(0, 0, key, config);
        this.emitters.set(key, emitter);
        return emitter;
    }
    
    emit(key, x, y, quantity) {
        const emitter = this.emitters.get(key);
        if (emitter) {
            emitter.setPosition(x, y);
            emitter.explode(quantity);
        }
    }
}
```

---

## **🔧 PLUGIN DEVELOPMENT PATTERNS**

### **✅ Correct Custom Plugin Development**
```javascript
// DebugPlugin.js - Legitimate custom plugin for edge case functionality
export class DebugPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.scene = null;
        this.graphics = null;
        this.isEnabled = false;
    }
    
    init(data) {
        this.isEnabled = data.enabled || false;
    }
    
    start() {
        this.scene = this.scene || this.game.scene.getScene('BingoGridScene');
        if (this.scene) {
            this.graphics = this.scene.add.graphics();
        }
    }
    
    drawGridOverlay() {
        if (!this.isEnabled || !this.graphics) return;
        
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xff0000);
        
        // Draw grid lines
        const gridSize = 5;
        const cellWidth = 200;
        const cellHeight = 200;
        
        for (let i = 0; i <= gridSize; i++) {
            this.graphics.moveTo(i * cellWidth, 0);
            this.graphics.lineTo(i * cellWidth, gridSize * cellHeight);
            
            this.graphics.moveTo(0, i * cellHeight);
            this.graphics.lineTo(gridSize * cellWidth, i * cellHeight);
        }
        
        this.graphics.strokePath();
    }
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            this.graphics.clear();
        }
    }
}
```

### **❌ Anti-Pattern: Reinventing Core Functionality**
```javascript
// ❌ WRONG - Don't create plugins that reinvent Phaser core
class DataManagerPlugin extends BasePlugin {
    // This reinvents game.registry
}

class EventManagerPlugin extends BasePlugin {
    // This reinvents game.events
}

class AudioManagerPlugin extends BasePlugin {
    // This reinvents this.sound.*
}

class TweenManagerPlugin extends BasePlugin {
    // This reinvents this.tweens.*
}
```

---

## **📊 PERFORMANCE OPTIMIZATION PATTERNS**

### **✅ Memory Management**
```javascript
// Scene files - Proper memory management
export class BingoGridScene extends Phaser.Scene {
    create() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Store references for cleanup
        this.eventHandlers = {
            dataChanged: this.onDataChanged.bind(this),
            goalsUpdated: this.onGoalsUpdated.bind(this)
        };
        
        this.game.registry.events.on(Phaser.Data.Events.SET_DATA, this.eventHandlers.dataChanged);
        this.game.events.on('goalsUpdated', this.eventHandlers.goalsUpdated);
    }
    
    shutdown() {
        // Clean up event listeners
        this.game.registry.events.off(Phaser.Data.Events.SET_DATA, this.eventHandlers.dataChanged);
        this.game.events.off('goalsUpdated', this.eventHandlers.goalsUpdated);
        
        // Clean up graphics
        if (this.graphics) {
            this.graphics.destroy();
        }
        
        // Clean up tweens
        this.tweens.killAll();
    }
}
```

### **✅ Object Pooling**
```javascript
// Scene files - Object pooling for performance
export class BingoGridScene extends Phaser.Scene {
    create() {
        this.setupObjectPools();
    }
    
    setupObjectPools() {
        // Create object pool for goal cards
        this.goalCardPool = this.add.group({
            classType: Phaser.GameObjects.Container,
            maxSize: 50
        });
        
        // Pre-create goal cards
        for (let i = 0; i < 25; i++) {
            const goalCard = this.createGoalCard();
            goalCard.setVisible(false);
            this.goalCardPool.add(goalCard);
        }
    }
    
    getGoalCard() {
        let goalCard = this.goalCardPool.getFirstDead();
        if (!goalCard) {
            goalCard = this.createGoalCard();
        }
        goalCard.setVisible(true);
        return goalCard;
    }
    
    returnGoalCard(goalCard) {
        goalCard.setVisible(false);
        this.goalCardPool.add(goalCard);
    }
}
```

---

## **🧪 TESTING PATTERNS**

### **✅ E2E Testing with Correct Phaser API**
```javascript
// tests/e2e/phaser-compliant-lifecycle.spec.js
test('Game Initialization with Standard Phaser Properties', async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to be ready
    await page.waitForFunction(() => window.game && window.game.isRunning);
    
    // Validate using ONLY standard Phaser properties
    const gameState = await page.evaluate(() => {
        const game = window.game;
        
        // ✅ CORRECT - Use documented Phaser API
        const activeScenes = game.scene.getScenes(true);
        const activeScene = activeScenes.length > 0 ? activeScenes[0].scene.key : null;
        
        return {
            isRunning: game.isRunning,
            activeScene: activeScene,
            rendererType: game.renderer.type,
            canvasWidth: game.canvas.width,
            canvasHeight: game.canvas.height,
            hasRegistry: !!game.registry,
            hasEvents: !!game.events,
            hasSceneManager: !!game.scene,
            hasRenderer: !!game.renderer,
            hasCanvas: !!game.canvas,
            hasLoop: !!game.loop
        };
    });
    
    expect(gameState.isRunning).toBe(true);
    expect(gameState.activeScene).toBe('MainMenuScene');
    expect(gameState.hasRegistry).toBe(true);
    expect(gameState.hasEvents).toBe(true);
});
```

### **✅ Scene Status Testing**
```javascript
// Test scene transitions using Phaser's scene manager
const sceneData = await page.evaluate(() => {
    const game = window.game;
    const sceneManager = game.scene;
    
    // ✅ CORRECT - Get active scenes using correct Phaser API
    const activeScenes = sceneManager.getScenes(true);
    const activeScene = activeScenes.length > 0 ? activeScenes[0].scene.key : null;
    
    return {
        activeScene: activeScene,
        sceneCount: sceneManager.scenes.length,
        sceneKeys: sceneManager.scenes.map(s => s.scene.key),
        isSceneActive: sceneManager.isActive('MainMenuScene'),
        isSceneVisible: sceneManager.isVisible('MainMenuScene'),
        isSceneSleeping: sceneManager.isSleeping('MainMenuScene')
    };
});

expect(sceneData.isSceneActive).toBe(true);
expect(sceneData.isSceneVisible).toBe(true);
```

### **❌ Anti-Pattern: Using Non-Existent Methods**
```javascript
// ❌ WRONG - Don't use non-existent methods
const activeScene = await page.evaluate(() => 
    window.game.scene.getActiveScene()?.scene?.key  // This method doesn't exist!
);

// ❌ WRONG - Don't assume methods exist without checking documentation
const sceneData = await page.evaluate(() => {
    return {
        activeScene: game.scene.getActiveScene(),  // This will fail!
        sceneCount: game.scene.getSceneCount()     // This might not exist!
    };
});
```

### **✅ Unit Testing with Mocks**
```javascript
// tests/BingoGridScene.test.js
import { BingoGridScene } from '../src/scenes/BingoGridScene.js';

describe('BingoGridScene', () => {
    let scene;
    let mockGame;
    
    beforeEach(() => {
        // Mock Phaser game object
        mockGame = {
            registry: {
                events: {
                    on: jest.fn(),
                    off: jest.fn()
                },
                get: jest.fn(),
                set: jest.fn()
            },
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn()
            },
            scene: {
                get: jest.fn()
            }
        };
        
        scene = new BingoGridScene();
        scene.game = mockGame;
    });
    
    test('should setup event listeners on create', () => {
        scene.create();
        
        expect(mockGame.registry.events.on).toHaveBeenCalledWith(
            Phaser.Data.Events.SET_DATA,
            expect.any(Function)
        );
    });
    
    test('should clean up event listeners on shutdown', () => {
        scene.create();
        scene.shutdown();
        
        expect(mockGame.registry.events.off).toHaveBeenCalledWith(
            Phaser.Data.Events.SET_DATA,
            expect.any(Function)
        );
    });
});
```

---

## **📚 REFERENCE QUICK LOOKUP**

### **Core Phaser Systems**
- **`game.registry`** - Data persistence
- **`game.events`** - Event management
- **`this.sound.*`** - Audio management
- **`this.tweens.*`** - Animation management
- **`this.textures.*`** - Texture management
- **`this.input.*`** - Input management
- **`this.cameras.*`** - Camera management
- **`this.add.particles()`** - Particle systems

### **Event Constants**
- **`Phaser.Core.Events.READY`** - Game ready
- **`Phaser.Scenes.Events.CREATE`** - Scene created
- **`Phaser.Data.Events.SET_DATA`** - Data changed
- **`Phaser.Input.Events.POINTER_DOWN`** - Pointer down

### **Common Anti-Patterns**
- ❌ Custom data managers
- ❌ Custom event managers
- ❌ Custom audio managers
- ❌ Custom tween managers
- ❌ String literals for events
- ❌ Accessing `game.events` before READY

---

*This document provides comprehensive Phaser patterns and best practices for consistent, correct implementation in the Goal Bingo project.*
