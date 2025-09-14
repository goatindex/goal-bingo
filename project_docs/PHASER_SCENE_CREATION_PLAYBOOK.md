# Phaser Scene Creation Playbook

## Overview

This playbook provides step-by-step guidance for creating new Phaser scenes that are fully compliant with Phaser 3 best practices and follow the established architectural patterns in this project.

## 📚 Related Documentation

This playbook works in conjunction with our comprehensive Phaser documentation:

- **`PHASER_ARCHITECTURE.md`** - Complete Phaser architecture reference with container patterns and scene complexity levels
- **`PHASER_PATTERNS.md`** - Detailed Phaser patterns, best practices, and anti-patterns with code examples
- **`INITIALIZATION_TIMING.md`** - Phaser initialization timing patterns and event handling
- **`double-rendering-fix.md`** - Specific fixes applied to resolve 47 Phaser compliance issues
- **`MASTER_DOCUMENTATION_INDEX.md`** - Complete documentation index and AI context management

**🎯 AI Context Management**: These documents are designed to work together to provide comprehensive Phaser guidance for AI assistants.

## Scene Complexity Levels

> **📖 Reference**: See `PHASER_ARCHITECTURE.md` for detailed scene complexity architecture and current project status.

### Level 1: Simple UI Scenes
**Examples:** MainMenuScene, RewardsScene, PreloadScene, TestScene
**Characteristics:**
- Basic UI elements (text, buttons, backgrounds)
- No complex interactions or animations
- Direct element addition to scene
- Minimal state management
**Status:** ✅ **COMPLIANT** - No containers needed

### Level 2: Complex UI Scenes
**Examples:** GoalLibraryScene, BingoGridScene
**Characteristics:**
- Multiple UI sections with different depths
- Complex interactions and animations
- Container-based architecture with proper registration
- Advanced state management
**Status:** ✅ **FIXED** - All containers properly registered

### Level 3: Utility Scenes
**Examples:** BootScene
**Characteristics:**
- Minimal or no UI elements
- Primarily for initialization or transitions
- No user interaction
**Status:** ✅ **COMPLIANT** - Appropriate for utility purpose

## Scene Creation Checklist

### ✅ Pre-Creation Planning

1. **Determine Scene Complexity Level**
   - [ ] Level 1: Simple UI → Use direct scene addition
   - [ ] Level 2: Complex UI → Use container architecture
   - [ ] Level 3: Utility → Minimal UI approach

2. **Define Scene Purpose**
   - [ ] What is the scene's primary function?
   - [ ] What UI elements are needed?
   - [ ] What interactions are required?
   - [ ] What data does it need to manage?

3. **Plan Container Structure (Level 2 only)**
   - [ ] Background container (depth: -1)
   - [ ] Main content container (depth: 0-10)
   - [ ] UI overlay container (depth: 10-100)
   - [ ] Modal container (depth: 1000+)

4. **Plan Initial Asset Loading**
   - [ ] What assets need to be preloaded?
   - [ ] Are there any initial data requirements?
   - [ ] What plugins are needed for this scene?

## Scene Template by Complexity Level

### Level 1: Simple UI Scene Template

```javascript
/**
 * [SceneName] - [Brief description of scene purpose]
 * 
 * ARCHITECTURE NOTES:
 * - Uses direct element addition (appropriate for simple UI)
 * - No containers needed for this complexity level
 * - Follows Phaser 3 best practices for simple scenes
 */
export default class [SceneName] extends Phaser.Scene {
    constructor() {
        super({ 
            key: '[SceneName]',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: '[scene-type]',
                hasAnimations: true,
                hasInput: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('[SceneName]: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    preload() {
        // ============================================================================
        // PHASER ASSET LOADING: Initial scene asset setup
        // ============================================================================
        // PHASER PATTERN: Load assets needed for this scene
        // - this.load.image() loads image assets
        // - this.load.audio() loads audio assets
        // - this.load.json() loads JSON data
        // - Assets are cached and available in create()
        
        // Load initial assets for this scene
        // this.load.image('background', 'assets/background.png');
        // this.load.audio('theme', 'assets/theme.mp3');
    }

    create() {
        console.log('[SceneName]: create() called');
        const { width, height } = this.cameras.main;
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        this.cameras.main.setViewport(0, 0, 1200, 800);
        
        // ============================================================================
        // PHASER SIMPLE UI PATTERN: Direct element addition to scene
        // ============================================================================
        // PHASER PATTERN: For simple scenes, add elements directly to scene
        // - this.add.rectangle() adds element to scene display list
        // - this.add.text() adds text to scene display list
        // - this.add.dom() adds DOM element to scene display list
        // - No containers needed for simple UI
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);

        // Title
        this.add.text(width / 2, 100, '[Scene Title]', {
            fontSize: '32px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create UI elements
        this.createUIElements(width, height);
        
        // Set up interactions
        this.setupInteractions();
    }

    createUIElements(width, height) {
        // Create all UI elements here
        // Use this.add.* methods for direct scene addition
    }

    setupInteractions() {
        // Set up event listeners and interactions
    }

    shutdown() {
        // Clean up event listeners
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
```

### Level 2: Complex UI Scene Template

```javascript
/**
 * [SceneName] - [Brief description of scene purpose]
 * 
 * ARCHITECTURE NOTES:
 * - Uses container-based architecture for complex UI
 * - Proper container registration with scene display list
 * - Depth management for layered UI elements
 * - Follows Phaser 3 best practices for complex scenes
 */
export default class [SceneName] extends Phaser.Scene {
    constructor() {
        super({ 
            key: '[SceneName]',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: '[scene-type]',
                hasAnimations: true,
                hasInput: true
            }
        });
        
        // Container references
        this.backgroundContainer = null;
        this.mainContainer = null;
        this.uiContainer = null;
        this.modalContainer = null;
    }

    init(data) {
        // Initialize scene with data
        console.log('[SceneName]: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    preload() {
        // ============================================================================
        // PHASER ASSET LOADING: Initial scene asset setup
        // ============================================================================
        // PHASER PATTERN: Load assets needed for this scene
        // - this.load.image() loads image assets
        // - this.load.audio() loads audio assets
        // - this.load.json() loads JSON data
        // - Assets are cached and available in create()
        
        // Load initial assets for this scene
        // this.load.image('background', 'assets/background.png');
        // this.load.image('ui-button', 'assets/ui/button.png');
        // this.load.audio('theme', 'assets/theme.mp3');
    }

    create() {
        console.log('[SceneName]: create() called');
        const { width, height } = this.cameras.main;
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        this.cameras.main.setViewport(0, 0, 1200, 800);
        
        // ============================================================================
        // PHASER CONTAINER ARCHITECTURE: Complex UI with proper container management
        // ============================================================================
        // PHASER PATTERN: Create containers with proper registration and depth management
        // - this.add.container() creates container but doesn't add to scene
        // - this.add.existing(container) adds container to scene display list
        // - setDepth() ensures proper layering order
        // - Without this.add.existing(), containers are invisible
        
        // 1. Create containers with proper depths
        this.createContainers(width, height);
        
        // 2. Create UI elements in appropriate containers
        this.createBackground(width, height);
        this.createMainContent(width, height);
        this.createUIOverlay(width, height);
        
        // 3. Set up interactions
        this.setupInteractions();
    }

    createContainers(width, height) {
        // ============================================================================
        // PHASER CONTAINER CREATION: Proper container setup
        // ============================================================================
        // PHASER PATTERN: Containers must be registered with scene display list to render
        // - this.add.container() creates the container but doesn't add it to scene
        // - this.add.existing(container) adds container to scene's display list
        // - Without this.add.existing(), containers are invisible (not rendered)
        // - setDepth() ensures proper layering order
        
        // Background container (behind everything)
        this.backgroundContainer = this.add.container(0, 0);
        this.backgroundContainer.setDepth(-1);
        this.add.existing(this.backgroundContainer);

        // Main content container
        this.mainContainer = this.add.container(0, 0);
        this.mainContainer.setDepth(0);
        this.add.existing(this.mainContainer);

        // UI overlay container
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setDepth(10);
        this.add.existing(this.uiContainer);

        // Modal container (above everything)
        this.modalContainer = this.add.container(0, 0);
        this.modalContainer.setDepth(1000);
        this.add.existing(this.modalContainer);
    }

    createBackground(width, height) {
        // ============================================================================
        // PHASER ELEMENT ADDITION: Adding elements to containers
        // ============================================================================
        // PHASER PATTERN: Elements created with this.add.* are automatically added to scene
        // - this.add.rectangle() adds element to scene display list
        // - container.add(element) moves element from scene to container
        // - This is the correct pattern for adding elements to containers
        
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);
        this.backgroundContainer.add(background);
    }

    createMainContent(width, height) {
        // Create main content elements in mainContainer
        // Use this.add.* methods, then container.add() to move to container
    }

    createUIOverlay(width, height) {
        // Create UI overlay elements in uiContainer
        // Use this.add.* methods, then container.add() to move to container
    }

    setupInteractions() {
        // Set up event listeners and interactions
    }

    shutdown() {
        // ============================================================================
        // PHASER CONTAINER CLEANUP: Proper container destruction
        // ============================================================================
        // PHASER PATTERN: Containers must be properly destroyed to prevent memory leaks
        // - container.destroy() removes container and all its children from display list
        // - This prevents memory leaks and ensures proper cleanup
        // - Always check if container exists before destroying
        
        if (this.backgroundContainer) {
            this.backgroundContainer.destroy();
        }
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        if (this.modalContainer) {
            this.modalContainer.destroy();
        }
        
        // Clean up event listeners
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
```

### Level 3: Utility Scene Template

```javascript
/**
 * [SceneName] - [Brief description of scene purpose]
 * 
 * ARCHITECTURE NOTES:
 * - Utility scene with minimal or no UI
 * - Primarily for initialization or transitions
 * - No user interaction required
 * - Follows Phaser 3 best practices for utility scenes
 */
export default class [SceneName] extends Phaser.Scene {
    constructor() {
        super({ 
            key: '[SceneName]',
            plugins: ['TweenManager', 'Clock'],
            data: {
                defaultData: 'value',
                sceneType: '[scene-type]',
                hasAnimations: false,
                isUtilityScene: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('[SceneName]: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    preload() {
        // ============================================================================
        // PHASER ASSET LOADING: Initial scene asset setup
        // ============================================================================
        // PHASER PATTERN: Load assets needed for this scene
        // - Utility scenes typically load minimal assets
        // - Focus on data loading rather than visual assets
        // - this.load.json() for configuration data
        // - this.load.text() for text-based assets
        
        // Load initial assets for this scene
        // this.load.json('config', 'assets/config.json');
        // this.load.text('data', 'assets/data.txt');
    }

    create() {
        console.log('[SceneName]: create() called');
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#f8f9fa');
        
        // ============================================================================
        // PHASER UTILITY SCENE PATTERN: Minimal UI, focus on functionality
        // ============================================================================
        // PHASER PATTERN: Utility scenes focus on functionality, not UI
        // - Minimal or no UI elements
        // - Primarily for initialization or transitions
        // - No user interaction required
        
        // Perform utility functions
        this.performUtilityFunctions();
        
        // Transition to next scene
        this.scene.start('[NextSceneName]');
    }

    performUtilityFunctions() {
        // Perform the scene's utility functions
        // Initialize systems, load data, etc.
    }

    shutdown() {
        // Clean up timers
        this.time.removeAllEvents();
        
        // Clean up scene events
        this.events.removeAllListeners();
    }
}
```

## Scene States Reference

> **📖 Reference**: Understanding scene states is crucial for initial scene setup and debugging.

### Scene State Constants

```javascript
const SCENE_STATES = {
    PENDING: 0,      // Scene is waiting to be started
    INIT: 1,         // Scene is initializing
    START: 2,        // Scene is starting
    LOADING: 3,      // Scene is loading assets
    CREATING: 4,     // Scene is creating objects
    RUNNING: 5,      // Scene is active and running
    PAUSED: 6,       // Scene is paused
    SLEEPING: 7,     // Scene is sleeping (inactive but not destroyed)
    SHUTDOWN: 8,     // Scene is shutting down
    DESTROYED: 9     // Scene is completely destroyed
};
```

### Scene State Debugging

```javascript
// Check current scene state
console.log('Scene state:', this.sys.settings.status);

// Debug scene lifecycle
console.log('Scene active:', this.sys.isActive());
console.log('Scene visible:', this.sys.isVisible());
console.log('Scene sleeping:', this.sys.isSleeping());
```

## Phaser Best Practices Reference

> **📖 Reference**: See `PHASER_PATTERNS.md` for comprehensive container management patterns, double-rendering prevention, and anti-patterns.

### ✅ Container Management

**Creating Containers:**
```javascript
// ============================================================================
// PHASER CONTAINER REGISTRATION: Proper container setup
// ============================================================================
// PHASER PATTERN: Containers must be registered with scene display list to render
// - this.add.container() creates the container but doesn't add it to scene
// - this.add.existing(container) adds container to scene's display list
// - Without this.add.existing(), containers are invisible (not rendered)
// - setDepth() ensures proper layering order

// Create container
const container = this.add.container(x, y);
container.setDepth(depth);

// REQUIRED: Add to scene display list
this.add.existing(container);
```

**Adding Elements to Containers:**
```javascript
// ============================================================================
// PHASER ELEMENT ADDITION: Adding elements to containers
// ============================================================================
// PHASER PATTERN: Elements created with this.add.* are automatically added to scene
// - this.add.rectangle() adds element to scene display list
// - container.add(element) moves element from scene to container
// - This is the correct pattern for adding elements to containers

// Create element (automatically added to scene)
const element = this.add.rectangle(x, y, w, h, color);

// Move element from scene to container
container.add(element);
```

**Container Cleanup:**
```javascript
// ============================================================================
// PHASER CONTAINER CLEANUP: Proper container destruction
// ============================================================================
// PHASER PATTERN: Containers must be properly destroyed to prevent memory leaks
// - container.destroy() removes container and all its children from display list
// - This prevents memory leaks and ensures proper cleanup
// - Always check if container exists before destroying

// Properly destroy containers
if (container) {
    container.destroy();
}
```

**Container Lifecycle Events:**
```javascript
// ============================================================================
// PHASER CONTAINER LIFECYCLE: Container scene events
// ============================================================================
// PHASER PATTERN: Containers have lifecycle events for scene management
// - addedToScene() called when container is added to scene
// - removedFromScene() called when container is removed from scene
// - These events are useful for initial setup and cleanup

// Listen for container lifecycle events
container.on('addedToScene', this.onContainerAdded, this);
container.on('removedFromScene', this.onContainerRemoved, this);

onContainerAdded() {
    console.log('Container added to scene');
    // Perform initial setup when container is added
}

onContainerRemoved() {
    console.log('Container removed from scene');
    // Perform cleanup when container is removed
}
```

### ✅ Element Addition Patterns

> **📖 Reference**: See `PHASER_PATTERNS.md` for detailed element addition patterns and double-rendering prevention.

**Direct Scene Addition (Level 1):**
```javascript
// For simple scenes, add directly to scene
this.add.rectangle(x, y, w, h, color);
this.add.text(x, y, text, style);
this.add.dom(x, y, element, style, content);
```

**Container-Based Addition (Level 2):**
```javascript
// For complex scenes, add to containers
const element = this.add.rectangle(x, y, w, h, color);
container.add(element);
```

**Display List Debugging:**
```javascript
// ============================================================================
// PHASER DISPLAY LIST DEBUGGING: Debug container and element visibility
// ============================================================================
// PHASER PATTERN: Use these methods to debug display list issues
// - getDisplayList() returns the display list array containing the object
// - getIndexList() returns display list indices for the object and its parents
// - These methods help debug invisible containers and elements

// Debug container display list
console.log('Container display list:', container.getDisplayList());
console.log('Container index list:', container.getIndexList());
console.log('Container depth:', container.depth);

// Debug element display list
console.log('Element display list:', element.getDisplayList());
console.log('Element index list:', element.getIndexList());
console.log('Element depth:', element.depth);
```

### ✅ Custom Component Integration

> **📖 Reference**: See `PHASER_PATTERNS.md` for comprehensive custom component patterns and double-rendering prevention in custom containers.

**Creating Custom Components:**
```javascript
// Custom components should extend Phaser.GameObjects.Container
export class CustomComponent extends Phaser.GameObjects.Container {
    constructor(scene, x, y, data, options = {}) {
        super(scene, x, y);
        
        // ============================================================================
        // PHASER CUSTOM COMPONENT PATTERN: Prevent double-rendering
        // ============================================================================
        // PHASER PATTERN: Use constructors, not scene.add.* methods in custom components
        // - new Phaser.GameObjects.Rectangle() creates object without adding to scene
        // - this.add() adds object to container's display list
        // - This prevents double-rendering (invisible objects)
        
        // Create internal elements using constructors (not scene.add.*)
        this.element = new Phaser.GameObjects.Rectangle(scene, 0, 0, w, h, color);
        this.add(this.element);
    }
}
```

**Adding Custom Components to Scenes:**
```javascript
// Create custom component
const component = new CustomComponent(this, x, y, data, options);

// Add to container (for complex scenes)
container.add(component);

// Or add to group (for collection management)
group.add(component);
```

### ✅ Scene Lifecycle Management

> **📖 Reference**: See `INITIALIZATION_TIMING.md` for detailed Phaser initialization timing patterns and event handling.

**Scene State Validation:**
```javascript
// Use Phaser's scene system API
if (!this.sys.isActive()) return false;
if (this.sys.isShuttingDown()) return false;
if (!this.sys.isVisible()) return false;
```

**Scene Transitions:**
```javascript
// Start new scene (stops current scene)
this.scene.start('NextScene');

// Transition with options
this.scene.transition({
    target: 'NextScene',
    duration: 1000,
    sleep: false,
    remove: false,
    allowInput: false
});
```

### ✅ Event Management

> **📖 Reference**: See `PHASER_PATTERNS.md` for comprehensive event management patterns and proper event cleanup.

**Setting Up Events:**
```javascript
// Scene events
this.events.on('eventName', this.handleEvent, this);

// Input events
this.input.on('pointerdown', this.handleClick, this);

// Game events
this.game.events.on('gameEvent', this.handleGameEvent, this);
```

**Cleaning Up Events:**
```javascript
// Remove specific event listeners
this.events.off('eventName', this.handleEvent, this);

// Remove all event listeners
this.events.removeAllListeners();
this.input.keyboard.removeAllListeners();
```

## Common Anti-Patterns to Avoid

> **📖 Reference**: See `PHASER_PATTERNS.md` for comprehensive anti-patterns and detailed explanations of why these patterns are problematic.

### ❌ Double-Rendering Anti-Pattern

**WRONG:**
```javascript
// This creates double-rendering (invisible objects)
const element = this.scene.add.rectangle(x, y, w, h, color);
container.add(element); // Element exists in both scene and container
```

**CORRECT:**
```javascript
// This prevents double-rendering (visible objects)
const element = this.add.rectangle(x, y, w, h, color);
container.add(element); // Element moved from scene to container
```

### ❌ Missing Container Registration

**WRONG:**
```javascript
// Container is invisible (not in scene display list)
const container = this.add.container(x, y);
// Missing: this.add.existing(container);
```

**CORRECT:**
```javascript
// Container is visible (properly registered)
const container = this.add.container(x, y);
this.add.existing(container);
```

### ❌ Incorrect API Usage

**WRONG:**
```javascript
// Using incorrect scene API methods
if (!this.isActive()) return false;
if (this.isShuttingDown()) return false;
```

**CORRECT:**
```javascript
// Using correct Phaser scene system API
if (!this.sys.isActive()) return false;
if (this.sys.isShuttingDown()) return false;
```

## Testing Checklist

> **📖 Reference**: See `TESTING_WEBGL_GAMES.md` for comprehensive testing strategies and `PHASER_PATTERNS.md` for Phaser compliance testing patterns.

### ✅ Scene Creation Testing

- [ ] Scene loads without errors
- [ ] All UI elements are visible
- [ ] Containers are properly registered (if used)
- [ ] No double-rendering issues
- [ ] Proper depth layering
- [ ] Event listeners work correctly
- [ ] Scene transitions work properly
- [ ] Cleanup happens on shutdown

### ✅ Phaser Compliance Testing

- [ ] Uses correct Phaser API methods
- [ ] Follows Phaser best practices
- [ ] No anti-patterns present
- [ ] Proper memory management
- [ ] Event handling is correct
- [ ] Scene lifecycle is managed properly

## Quick Reference

> **📖 Reference**: See `MASTER_DOCUMENTATION_INDEX.md` for complete documentation index and `PHASER_ARCHITECTURE.md` for detailed Phaser system reference.

### Scene Complexity Decision Tree

```
Does the scene need complex UI with multiple layers?
├─ YES → Use Level 2 (Container Architecture)
└─ NO → Does the scene need any UI at all?
    ├─ YES → Use Level 1 (Direct Scene Addition)
    └─ NO → Use Level 3 (Utility Scene)
```

### Container Depth Guidelines

- **Background**: -1 (behind everything)
- **Main Content**: 0-10 (main game content)
- **UI Overlay**: 10-100 (buttons, menus, HUD)
- **Modals**: 1000+ (dialogs, popups, notifications)

### Essential Phaser Methods

- `this.add.container(x, y)` - Create container
- `this.add.existing(container)` - Register container with scene
- `container.add(element)` - Add element to container
- `container.setDepth(depth)` - Set container depth
- `container.destroy()` - Destroy container and children
- `this.sys.isActive()` - Check if scene is active
- `this.sys.isShuttingDown()` - Check if scene is shutting down
- `this.scene.start(sceneKey)` - Start new scene
- `this.scene.transition(options)` - Transition to new scene

### Initial Scene Configuration Patterns

```javascript
// ============================================================================
// PHASER INITIAL SCENE CONFIG: Common initial scene setup patterns
// ============================================================================
// PHASER PATTERN: These patterns are commonly used in initial scene setup
// - Camera configuration for proper viewport setup
// - Input configuration for initial interaction setup
// - Event setup for initial scene communication

// Camera configuration
this.cameras.main.setBackgroundColor('#f8f9fa');
this.cameras.main.setViewport(0, 0, 1200, 800);
this.cameras.main.setZoom(1);

// Input configuration
this.input.keyboard.createCursorKeys();
this.input.on('pointerdown', this.handleClick, this);

// Event setup
this.events.on('shutdown', this.onShutdown, this);
this.events.on('pause', this.onPause, this);
this.events.on('resume', this.onResume, this);
```

---

## 📚 Documentation Integration

This playbook is part of a comprehensive Phaser documentation suite designed for AI assistant context management:

1. **`PHASER_SCENE_CREATION_PLAYBOOK.md`** - This document (scene creation templates)
2. **`PHASER_ARCHITECTURE.md`** - Complete Phaser architecture reference
3. **`PHASER_PATTERNS.md`** - Detailed patterns and anti-patterns
4. **`INITIALIZATION_TIMING.md`** - Phaser initialization timing patterns
5. **`MASTER_DOCUMENTATION_INDEX.md`** - Complete documentation index

**🎯 AI Context Management**: These documents work together to provide comprehensive Phaser guidance for AI assistants, ensuring consistent, correct implementation across the entire project.

This playbook ensures that all new scenes created in this project will be fully compliant with Phaser 3 best practices and follow the established architectural patterns.
