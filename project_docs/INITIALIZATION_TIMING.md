# Phaser Initialization Timing Guide - Goal Bingo Project

## **🎯 AI CONTEXT MANAGEMENT**

This document provides comprehensive guidance on Phaser initialization timing patterns for the Goal Bingo project. It serves as a reference for AI assistants to ensure correct timing and proper system initialization.

---

## **📋 PHASER INITIALIZATION TIMING OVERVIEW**

### **Timing Sequence (Phaser 3.70.0+)**
1. **Game Creation**: `new Phaser.Game(config)`
2. **postBoot callback**: Runs after all game systems have started and plugins are loaded
3. **READY event**: Game instance has finished booting and all local systems are ready
4. **SYSTEM_READY event**: Scene Manager has created the System Scene

### **When to Use Each Timing**

#### **postBoot Callback (In Config)**
- **When**: After all game systems have started and plugins are loaded
- **Use for**: Core systems that don't need scene manager
- **Examples**: Logger, EventManager, ApplicationStateManager, StorageManager, PerformanceLogger

#### **SYSTEM_READY Event (After Game Creation)**
- **When**: Scene Manager has created the System Scene
- **Use for**: Scene-dependent systems that need `game.scene`
- **Examples**: SceneStateLogger, DebugTools, scene monitoring systems

---

## **✅ CORRECT IMPLEMENTATION PATTERN**

### **1. Game Configuration with postBoot**
```javascript
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    scene: [BootScene, PreloadScene, MainMenuScene, GoalLibraryScene, BingoGridScene, RewardsScene],
    // PHASER STANDARD: Use postBoot for core systems initialization
    callbacks: {
        postBoot: async (game) => {
            try {
                console.log('=== PHASER POSTBOOT CALLBACK TRIGGERED ===');
                
                // Initialize core systems (don't need scene manager)
                await initializeCoreSystems(game);
                
                console.log('Core systems initialized');
            } catch (error) {
                console.error('Failed to initialize core systems in postBoot:', error);
            }
        }
    }
};
```

### **2. Game Creation and SYSTEM_READY Listener**
```javascript
// Create game instance
const game = new Phaser.Game(config);

// PHASER STANDARD: Set up SYSTEM_READY listener after game creation
// This follows the documented approach for scene-dependent systems
game.events.once(Phaser.Core.Events.SYSTEM_READY, async (sys) => {
    try {
        console.log('=== PHASER SYSTEM_READY EVENT TRIGGERED ===');
        
        // Initialize scene-dependent systems (needs scene manager)
        await initializeSceneSystems(game);
        
        console.log('=== ALL SYSTEMS INITIALIZATION COMPLETE ===');
    } catch (error) {
        console.error('Failed to initialize scene systems:', error);
    }
});
```

---

## **❌ COMMON ANTI-PATTERNS**

### **1. Using READY Event for Scene-Dependent Systems**
```javascript
// ❌ WRONG - Scene manager might not be fully available yet
game.events.once(Phaser.Core.Events.READY, async () => {
    await initializeSceneSystems(game); // May fail!
});
```

### **2. Setting SYSTEM_READY Listener Inside postBoot**
```javascript
// ❌ WRONG - This is too late, SYSTEM_READY may have already fired
callbacks: {
    postBoot: async (game) => {
        game.events.once(Phaser.Core.Events.SYSTEM_READY, callback);
    }
}
```

### **3. Immediate Event Access**
```javascript
// ❌ WRONG - game.events not available immediately
const game = new Phaser.Game(config);
game.events.on('ready', callback); // Will fail!
```

---

## **🔧 SYSTEM CATEGORIZATION**

### **Core Systems (postBoot callback)**
- **Logger**: Centralized logging system
- **EventManager**: Event management system
- **ApplicationStateManager**: Domain logic management
- **StorageManager**: Data persistence
- **PerformanceLogger**: Performance monitoring

### **Scene-Dependent Systems (SYSTEM_READY event)**
- **SceneStateLogger**: Scene state monitoring
- **DebugTools**: Debug utilities
- **UserActionLogger**: User interaction tracking

---

## **📚 PHASER DOCUMENTATION REFERENCES**

- **postBoot callback**: [Phaser Core Config](https://docs.phaser.io/api-documentation/class/core-config)
- **SYSTEM_READY event**: [Phaser Core Events](https://docs.phaser.io/api-documentation/event/core-events)
- **Scene Manager**: [Phaser Scene Manager](https://docs.phaser.io/api-documentation/class/scenes-scenemanager)

---

## **🎵 AUDIO SYSTEM INITIALIZATION TIMING**

### **✅ Correct Audio Loading Pattern (Phaser 3.70.0+)**
```javascript
// PreloadScene.js - Audio loading in preload phase
preload() {
    // PHASER AUDIO LOADING PATTERN:
    // - Load all audio assets in PreloadScene preload() method
    // - Audio files are loaded asynchronously by Phaser's Loader
    // - create() is only called after ALL assets are loaded
    // - This ensures audio is available when MainMenuScene starts
    
    console.log('PreloadScene: Loading audio assets...');
    
    // Load audio files using Phaser's native loading system
    this.load.audio('buttonClick', 'assets/audio/button-click.mp3');
    this.load.audio('buttonHover', 'assets/audio/button-hover.mp3');
    this.load.audio('modalOpen', 'assets/audio/modal-open.mp3');
    this.load.audio('modalClose', 'assets/audio/modal-close.mp3');
    this.load.audio('goalComplete', 'assets/audio/goal-complete.mp3');
    this.load.audio('bingoWin', 'assets/audio/bingo-win.mp3');
    this.load.audio('newGame', 'assets/audio/new-game.mp3');
    this.load.audio('gridRepopulate', 'assets/audio/grid-repopulate.mp3');
    this.load.audio('backgroundMusic', 'assets/audio/background-music.mp3');
}

create() {
    // PHASER AUDIO TIMING: create() only called after loading is complete
    // - All audio assets are guaranteed to be loaded
    // - Safe to transition to MainMenuScene
    // - MainMenuScene can safely initialize AudioManager
    
    console.log('PreloadScene: All assets loaded, transitioning to MainMenuScene');
    this.scene.start('MainMenuScene');
}
```

### **✅ Audio Integration in Scene Creation**
```javascript
// MainMenuScene.js - Audio integration with error handling
create() {
    // PHASER AUDIO INTEGRATION PATTERN:
    // - Check if audio assets are available before initializing AudioManager
    // - Use Phaser's cache.audio system to verify asset availability
    // - Provide graceful fallback if audio assets are missing
    // - This prevents scene creation failures due to missing audio
    
    if (this.cache.audio.exists('buttonClick')) {
        console.log('MainMenuScene: Audio assets available, initializing AudioManager');
        this.audioManager = new AudioManager(this);
        this.audioManager.initializeAudio();
    } else {
        console.warn('MainMenuScene: Audio assets not available, using mock AudioManager');
        this.audioManager = new MockAudioManager(this);
    }
    
    // Continue with scene creation...
    this.createUI();
}
```

### **✅ Audio Usage in Scene Methods**
```javascript
// MainMenuScene.js - Audio usage with proper error handling
onButtonClick() {
    // PHASER AUDIO USAGE PATTERN:
    // - Always check if AudioManager exists before calling methods
    // - AudioManager handles volume, mute settings, and error handling
    // - Provides consistent audio feedback across all buttons
    // - Graceful degradation if audio is not available
    
    if (this.audioManager) {
        this.audioManager.playButtonClick();
    }
    
    // Continue with button logic...
    this.handleButtonAction();
}
```

### **❌ Common Audio Timing Anti-Patterns**
```javascript
// ❌ WRONG - Loading audio in MainMenuScene preload()
// This causes duplicate loading and timing issues
export class MainMenuScene extends Phaser.Scene {
    preload() {
        this.load.audio('buttonClick', 'assets/audio/button-click.mp3'); // ❌ Duplicate loading
    }
}

// ❌ WRONG - Not checking audio availability before use
create() {
    this.audioManager = new AudioManager(this); // ❌ May fail if audio not loaded
    this.audioManager.initializeAudio(); // ❌ May fail if audio not available
}

// ❌ WRONG - No error handling for missing audio
onButtonClick() {
    this.audioManager.playButtonClick(); // ❌ May fail if AudioManager not initialized
}
```

### **📋 Audio System Timing Sequence**
1. **PreloadScene.preload()** - Load all audio assets
2. **PreloadScene.create()** - Audio loading complete, transition to MainMenuScene
3. **MainMenuScene.create()** - Check audio availability, initialize AudioManager
4. **MainMenuScene UI** - Use AudioManager for button feedback

---

## **🎯 AI ASSISTANT GUIDANCE**

When working with Phaser initialization:

1. **Always use postBoot callback** for core systems that don't need scene manager
2. **Always use SYSTEM_READY event** for systems that need `game.scene`
3. **Set up SYSTEM_READY listener after game creation**, not inside postBoot
4. **Never access `game.events` immediately** after game creation
5. **Follow the timing sequence**: postBoot → READY → SYSTEM_READY
6. **Load audio assets in PreloadScene** - never in individual scenes
7. **Check audio availability before initializing AudioManager** - use `this.cache.audio.exists()`
8. **Provide graceful fallback for missing audio** - use mock AudioManager if needed

This approach ensures proper timing and follows Phaser's documented best practices.
