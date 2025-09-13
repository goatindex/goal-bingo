# Plugin Architecture & Phaser Native Capabilities Reference

## **🚨 CRITICAL REMINDERS FOR AI ASSISTANTS**

### **❌ NEVER CREATE THESE CUSTOM PLUGINS (Anti-Patterns)**
- **AudioManagerPlugin** → Use `this.sound.*` directly
- **TweenManagerPlugin** → Use `this.tweens.*` directly  
- **TextureManagerPlugin** → Use `this.textures.*` directly
- **InputManagerPlugin** → Use `this.input.*` directly
- **DataManagerPlugin** → Use `game.registry` directly
- **EventManagerPlugin** → Use `game.events` directly

### **✅ ALWAYS USE PHASER NATIVE SYSTEMS FIRST**
- **95% Native Phaser** - Use built-in systems
- **5% Custom Extensions** - Only for edge cases Phaser doesn't cover
- **Utility Classes** - For domain logic, not core functionality

---

## **📋 Current Plugin Architecture Status**

### **✅ IMPLEMENTED (Correct Architecture)**

#### **1. ApplicationStateManager (Utility Class)**
- **Purpose**: Domain logic for application state
- **Uses**: `game.registry` for persistence, `game.events` for communication
- **Location**: `src/utils/ApplicationStateManager.js`
- **Pattern**: Utility class, NOT a plugin
- **Why Not Plugin**: Domain logic, not Phaser extension

#### **2. StorageManager (Utility Class)**
- **Purpose**: Data persistence with localStorage
- **Uses**: `game.registry.events` for change detection
- **Location**: `src/utils/StorageManager.js`
- **Pattern**: Utility class, NOT a plugin
- **Why Not Plugin**: Persistence logic, not Phaser extension

#### **3. DebugPlugin (Legitimate Custom Plugin)**
- **Purpose**: Visual debugging and console tools
- **Extends**: `BasePlugin` (correct pattern)
- **Location**: `src/plugins/DebugPlugin.js`
- **Pattern**: Custom plugin for edge case functionality
- **Why Plugin**: Extends Phaser with debugging capabilities

### **❌ REMOVED (Anti-Patterns Fixed)**

#### **1. DataManagerPlugin (DELETED)**
- **Why Removed**: Reinvented `game.registry`
- **Replacement**: Direct use of `game.registry`
- **Result**: Cleaner, more maintainable code

#### **2. EventManagerPlugin (DELETED)**
- **Why Removed**: Reinvented `game.events`
- **Replacement**: Direct use of `game.events`
- **Result**: Better performance, less code

#### **3. StateManagerAdapter (DELETED)**
- **Why Removed**: No longer needed
- **Replacement**: `ApplicationStateManager` utility class
- **Result**: Cleaner architecture

#### **4. EventManagerAdapter (DELETED)**
- **Why Removed**: No longer needed
- **Replacement**: Direct `game.events` usage
- **Result**: Simpler codebase

---

## **🏗️ Phaser Native Capabilities (Use These Directly)**

### **Audio Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in sound system
this.sound.add('key', config);           // Add sound
this.sound.play('key', config);          // Play sound
this.sound.stop('key');                  // Stop sound
this.sound.pause('key');                 // Pause sound
this.sound.resume('key');                // Resume sound

// Spatial Audio (Native)
this.sound.play('key', {
    source: {
        x: 400,
        y: 300,
        refDistance: 50,
        follow: sprite
    }
});

// Volume Management (Native)
this.sound.volume = 0.5;                 // Global volume
this.sound.setVolume(0.5);               // Set volume
this.sound.setMute(true);                // Mute all sounds

// ❌ WRONG: Don't create AudioManagerPlugin
// class AudioManagerPlugin extends BasePlugin { ... }
```

### **Tween Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in tween system
this.tweens.add(config);                 // Add tween
this.tweens.create(config);              // Create tween
this.tweens.stagger(500);                // Stagger delay
this.tweens.chain(tweens);               // Chain tweens
this.tweens.killAll();                   // Kill all tweens
this.tweens.killTweensOf(target);        // Kill specific tweens

// Timeline Support (Native)
const timeline = this.add.timeline([
    { at: 1000, run: () => {} },
    { at: 2000, tween: { targets: sprite, x: 600 } }
]);
timeline.play();

// Tween Events (Native)
tween.on('complete', callback);
tween.on('start', callback);
tween.on('update', callback);

// ❌ WRONG: Don't create TweenManagerPlugin
// class TweenManagerPlugin extends BasePlugin { ... }
```

### **Texture Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in texture system
this.textures.add(key, source);          // Add texture
this.textures.get(key);                  // Get texture
this.textures.renameTexture(old, new);   // Rename texture
this.textures.remove(key);               // Remove texture
this.textures.list;                      // List all textures

// Atlas Support (Native)
this.textures.addAtlas(key, source, data);
this.textures.addAtlasJSONArray(key, source, data);
this.textures.addAtlasJSONHash(key, source, data);
this.textures.addAtlasXML(key, source, data);

// Dynamic Textures (Native)
this.textures.addDynamicTexture(key);
this.textures.addCanvas(key, canvas);
this.textures.addBase64(key, data);

// ❌ WRONG: Don't create TextureManagerPlugin
// class TextureManagerPlugin extends BasePlugin { ... }
```

### **Input Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in input system
this.input.on('pointerdown', callback);  // Mouse/touch down
this.input.on('pointerup', callback);    // Mouse/touch up
this.input.on('pointermove', callback);  // Mouse/touch move
this.input.isOver;                       // Is pointer over canvas
this.input.setDefaultCursor('pointer');  // Set default cursor

// Keyboard Input (Native)
this.input.keyboard.on('keydown', callback);
this.input.keyboard.addKeys('W,A,S,D');
this.input.keyboard.createCursorKeys();

// Gamepad Input (Native)
this.input.gamepad.on('down', callback);
this.input.gamepad.pad1;                 // First gamepad
this.input.gamepad.getButtonValue(0);    // Button value
this.input.gamepad.getAxisValue(0);      // Axis value

// Interactive Objects (Native)
sprite.setInteractive();
sprite.setInteractive({ 
    pixelPerfect: true, 
    useHandCursor: true 
});

// ❌ WRONG: Don't create InputManagerPlugin
// class InputManagerPlugin extends BasePlugin { ... }
```

### **Data Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in data system
game.registry.set('key', value);             // Set data
game.registry.get('key');                    // Get data
game.registry.has('key');                    // Check if exists
game.registry.remove('key');                 // Remove data
game.registry.list;                          // List all data

// Data Events (Native)
game.registry.events.on('changedata', callback);
game.registry.events.on('setdata', callback);
game.registry.events.on('removedata', callback);

// ❌ WRONG: Don't create DataManagerPlugin
// class DataManagerPlugin extends BasePlugin { ... }
```

### **Event Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in event system
game.events.on('event', callback);       // Listen to event
game.events.emit('event', data);         // Emit event
game.events.off('event', callback);      // Remove listener
game.events.once('event', callback);     // One-time listener

// System Events (Native)
game.events.on(Phaser.Core.Events.SYSTEM_READY, callback);

// ❌ WRONG: Don't create EventManagerPlugin
// class EventManagerPlugin extends BasePlugin { ... }
```

### **Camera Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in camera system
this.cameras.main;                       // Main camera
this.cameras.add(x, y, width, height);   // Add camera
this.cameras.main.setZoom(2);            // Set zoom
this.cameras.main.setScroll(x, y);       // Set scroll
this.cameras.main.fadeIn(1000);          // Fade in
this.cameras.main.fadeOut(1000);         // Fade out
this.cameras.main.shake(500);            // Camera shake

// Camera Effects (Native)
this.cameras.main.postFX.addTiltShift();
this.cameras.main.postFX.addWipe();

// ❌ WRONG: Don't create basic CameraManagerPlugin
// class CameraManagerPlugin extends BasePlugin { ... }
```

### **Particle Management**
```javascript
// ✅ CORRECT: Use Phaser's built-in particle system
this.add.particles(x, y, texture, config);
particles.createEmitter(config);
emitter.setPosition(x, y);
emitter.start();
emitter.stop();
emitter.kill();

// Particle Events (Native)
emitter.on('particledeath', callback);
emitter.on('particleexplode', callback);

// ❌ WRONG: Don't create basic ParticleManagerPlugin
// class ParticleManagerPlugin extends BasePlugin { ... }
```

---

## **✅ Legitimate Custom Plugins (Edge Cases Only)**

### **When to Create Custom Plugins**
Only create custom plugins for functionality that Phaser doesn't provide:

1. **Advanced Camera Management** - Complex camera transitions, multi-camera setups
2. **Advanced Particle Systems** - Complex particle behaviors, particle pooling
3. **Custom Input Handling** - Specialized input beyond Phaser's capabilities
4. **Gameplay Mechanics** - Domain-specific game features
5. **Debug Tools** - Visual debugging and development tools (✅ We have this)

### **Custom Plugin Pattern**
```javascript
// ✅ CORRECT: Custom plugin for edge case functionality
export class AdvancedCameraPlugin extends BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
    }
    
    init(data) {
        // Initialize plugin-specific functionality
    }
    
    start() {
        // Start plugin functionality
    }
    
    stop() {
        // Stop plugin functionality
    }
    
    destroy() {
        // Clean up resources
    }
}
```

---

## **📋 Architecture Decision Framework**

### **Question 1: Does Phaser provide this functionality natively?**
- **YES** → Use Phaser's built-in system directly
- **NO** → Continue to Question 2

### **Question 2: Is this domain logic for our application?**
- **YES** → Create utility class (like `ApplicationStateManager`)
- **NO** → Continue to Question 3

### **Question 3: Is this a legitimate extension of Phaser's capabilities?**
- **YES** → Create custom plugin extending `BasePlugin`
- **NO** → Don't create anything, use existing solutions

### **Examples:**
- **Audio playback** → Use `this.sound.*` (Phaser native)
- **Game state management** → Use `ApplicationStateManager` utility class
- **Visual debugging tools** → Use `DebugPlugin` custom plugin
- **Data persistence** → Use `StorageManager` utility class

---

## **🔗 Official Documentation References**

- [Phaser Sound Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Sound.BaseSound)
- [Phaser Tween Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Tweens.Tween)
- [Phaser Texture Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Textures.TextureManager)
- [Phaser Input Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Input.InputManager)
- [Phaser Camera Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Cameras.Scene2D.Camera)
- [Phaser Particle Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.Particles.ParticleEmitter)
- [Phaser Data Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.DataManager)
- [Phaser Events Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter)
- [Phaser Plugin Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Plugins.BasePlugin)

---

## **🎯 Key Reminders for AI Assistants**

1. **Always check this document first** when considering plugin creation
2. **Use Phaser native systems** for 95% of functionality
3. **Create utility classes** for domain logic, not plugins
4. **Only create custom plugins** for legitimate edge cases
5. **Follow the architecture decision framework** for every decision
6. **Reference official Phaser documentation** for implementation details

---

*This document serves as the definitive reference for plugin architecture decisions in this project. Always consult this before creating any new plugins or systems.*
