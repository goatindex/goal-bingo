# Phaser Native Implementation Strategy

## Overview: Prioritizing Phaser Core Functions

This strategy prioritizes using Phaser's built-in systems over custom plugins, only creating custom plugins for legitimate edge cases that extend Phaser's functionality rather than reinventing core capabilities.

## Phase 0: Phaser Core Systems Foundation

### 1. Game-Level Data Management (game.data)

**Purpose**: Use Phaser's built-in DataManager for application state management

**Official Documentation**: 
- [Phaser DataManager Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.DataManager)
- [Data Events Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.Events)
- [Game Object Data Management](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.GameObject#setData)

**Relevant Patterns**:
```javascript
// Game-level data management
game.data.set('key', value);
game.data.get('key');
game.data.events.on('changedata', callback);

// Batch data setting
game.data.set({
    goals: goalsArray,
    gameState: stateObject,
    settings: settingsObject
});

// Direct data access
game.data.values.goals.push(newGoal);
```

**Key Steps to Integration**:
1. Remove custom DataManagerPlugin
2. Use game.data for all application state
3. Listen to built-in data events
4. Create ApplicationStateManager utility class

**Code Snippets**:
```javascript
// Initialize data in main.js
function initializeGameData(game) {
    // Set initial application state
    game.data.set('goals', []);
    game.data.set('gameState', {});
    game.data.set('settings', {});
    game.data.set('rewards', []);
    game.data.set('categories', []);
    
    // Listen to data changes
    game.data.events.on('changedata', (parent, key, value, previousValue) => {
        console.log(`Data changed: ${key}`, value);
        // Handle specific data changes
        if (key === 'goals') {
            game.events.emit('goalsChanged', value, previousValue);
        }
    });
}

// Usage in scenes
class BingoGridScene extends Phaser.Scene {
    create() {
        // Get data
        const goals = this.game.data.get('goals') || [];
        const gameState = this.game.data.get('gameState') || {};
        
        // Update data
        this.game.data.set('gameState', {
            ...gameState,
            currentGrid: this.grid
        });
        
        // Listen to data changes
        this.game.data.events.on('changedata', this.onDataChanged, this);
    }
    
    onDataChanged(parent, key, value, previousValue) {
        if (key === 'goals') {
            this.updateGrid();
        }
    }
}
```

**Directions to Comment**:
- Document data keys and their purposes
- Comment event handling for data changes
- Explain data structure and relationships

**Anti-patterns to Watch**:
- Don't store large objects directly in data manager
- Avoid circular data dependencies
- Don't forget to clean up event listeners

**Current Code → Phaser Core Mapping**:
```javascript
// REMOVE: Custom DataManagerPlugin
// this.game.dataManagerPlugin.getGoals()
// this.game.dataManagerPlugin.updateGameState()

// USE: Phaser's built-in game.data
this.game.data.get('goals')
this.game.data.set('gameState', gameState)

// REMOVE: Custom event handling
// this.game.dataManagerPlugin.dataManager.events.on('changedata', callback)

// USE: Built-in data events
this.game.data.events.on('changedata', callback)
```

**File-by-File Migration Steps**:

### Files to Remove (Reinventing Phaser Core):
- `src/plugins/DataManagerPlugin.js` - **DELETE** - Use game.data instead
- `src/plugins/StateManagerAdapter.js` - **DELETE** - No longer needed

### Files to Create:
- `src/utils/ApplicationStateManager.js` - Domain logic utility class

### Files to Modify:
- `src/main.js` (lines 20, 35-40, 264-297) - Remove DataManagerPlugin, use game.data
- `src/scenes/BingoGridScene.js` (lines 390-396, 566, 607-608, 622-633) - Use game.data
- `src/scenes/MainMenuScene.js` (lines 174-177) - Use game.data events
- `src/scenes/GoalLibraryScene.js` (lines 311-312) - Use game.data events
- `src/scenes/BootScene.js` (lines 42) - Use game.data events

**Migration Steps**:
1. **Create ApplicationStateManager utility** (`src/utils/ApplicationStateManager.js`):
   ```javascript
   // Move ApplicationState logic to utility class
   // Use game.data for persistence
   // Keep domain logic separate from Phaser systems
   ```

2. **Update main.js** (lines 20, 35-40, 264-297):
   ```javascript
   // REMOVE: import { DataManagerPlugin } from './plugins/DataManagerPlugin.js';
   // REMOVE: pluginRegistry.register('DataManagerPlugin', DataManagerPlugin, {...});
   // ADD: import { ApplicationStateManager } from './utils/ApplicationStateManager.js';
   // ADD: Initialize game.data with application state
   ```

3. **Update all scene files**:
   ```javascript
   // CHANGE: this.game.dataManagerPlugin.getGoals()
   // TO: this.game.data.get('goals')
   
   // CHANGE: this.game.dataManagerPlugin.updateGameState(state)
   // TO: this.game.data.set('gameState', state)
   ```

4. **Update event handling** (all files):
   ```javascript
   // CHANGE: this.game.dataManagerPlugin.dataManager.events.on('changedata', callback)
   // TO: this.game.data.events.on('changedata', callback)
   ```

**Search & Replace Patterns**:
- `this.game.dataManagerPlugin.` → `this.game.data.`
- `game.dataManagerPlugin` → `game.data`
- `import { DataManagerPlugin }` → `// DataManagerPlugin removed - use game.data`
- `pluginRegistry.register('DataManagerPlugin'` → `// DataManagerPlugin removed - use game.data`

### 2. Game-Level Event Management (game.events)

**Purpose**: Use Phaser's built-in EventEmitter for application event management

**Official Documentation**: 
- [Phaser EventEmitter Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter)
- [Game Object Events](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.GameObject#emit)
- [Event Management](https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter#on)

**Relevant Patterns**:
```javascript
// Game-level event management
game.events.on('event', callback);
game.events.emit('event', data);
game.events.off('event', callback);

// Event with context
game.events.on('event', callback, context);

// One-time events
game.events.once('event', callback);

// Remove all listeners
game.events.removeAllListeners();
```

**Key Steps to Integration**:
1. Remove custom EventManagerPlugin
2. Use game.events for all application events
3. Implement proper event cleanup
4. Use built-in event management

**Code Snippets**:
```javascript
// Initialize events in main.js
function initializeGameEvents(game) {
    // Set up global event handlers
    game.events.on('goalCompleted', (goalData) => {
        console.log('Goal completed:', goalData);
        // Update game state
        const gameState = game.data.get('gameState') || {};
        game.data.set('gameState', {
            ...gameState,
            completedGoals: (gameState.completedGoals || 0) + 1
        });
    });
    
    game.events.on('gameStateChanged', (newState, oldState) => {
        console.log('Game state changed:', newState);
        // Handle state changes
    });
}

// Usage in scenes
class BingoGridScene extends Phaser.Scene {
    create() {
        // Listen to game events
        this.game.events.on('goalsChanged', this.onGoalsChanged, this);
        this.game.events.on('gameStateChanged', this.onGameStateChanged, this);
        
        // Emit events
        this.game.events.emit('gridInitialized', this.grid);
    }
    
    onGoalCompleted(goal) {
        // Emit goal completion event
        this.game.events.emit('goalCompleted', {
            goalId: goal.id,
            timestamp: Date.now(),
            gridPosition: goal.gridPosition
        });
    }
    
    shutdown() {
        // Clean up event listeners
        this.game.events.off('goalsChanged', this.onGoalsChanged, this);
        this.game.events.off('gameStateChanged', this.onGameStateChanged, this);
    }
}
```

**Directions to Comment**:
- Document event names and their data structures
- Comment event lifecycle and cleanup
- Explain event propagation rules

**Anti-patterns to Watch**:
- Don't create memory leaks with unremoved listeners
- Avoid circular event dependencies
- Don't emit events in tight loops

**Current Code → Phaser Core Mapping**:
```javascript
// REMOVE: Custom EventManagerPlugin
// this.game.eventManagerPlugin.emit('goalCompleted', data)
// this.game.eventManagerPlugin.on('goalCompleted', callback)

// USE: Phaser's built-in game.events
this.game.events.emit('goalCompleted', data)
this.game.events.on('goalCompleted', callback)

// REMOVE: Custom event cleanup
// this.game.eventManagerPlugin.cleanup(game)

// USE: Built-in event cleanup
this.game.events.off('event', callback, context)
```

**File-by-File Migration Steps**:

### Files to Remove (Reinventing Phaser Core):
- `src/plugins/EventManagerPlugin.js` - **DELETE** - Use game.events instead
- `src/plugins/EventManagerAdapter.js` - **DELETE** - No longer needed

### Files to Modify:
- `src/main.js` (lines 21, 42-48, 270-277) - Remove EventManagerPlugin, use game.events
- `src/scenes/BingoGridScene.js` (lines 162, 205-206, 641-643) - Use game.events
- `src/scenes/MainMenuScene.js` (lines 174-177, 216-220) - Use game.events
- `src/scenes/GoalLibraryScene.js` (lines 311-312, 405-407, 582-588) - Use game.events
- `src/scenes/BootScene.js` (lines 42, 67) - Use game.events

**Migration Steps**:
1. **Update main.js** (lines 21, 42-48, 270-277):
   ```javascript
   // REMOVE: import { EventManagerPlugin } from './plugins/EventManagerPlugin.js';
   // REMOVE: pluginRegistry.register('EventManagerPlugin', EventManagerPlugin, {...});
   // REMOVE: const eventManagerPlugin = game.plugins.get('EventManagerPlugin');
   // ADD: Initialize game.events with application event handlers
   ```

2. **Update all scene files**:
   ```javascript
   // CHANGE: this.game.eventManagerPlugin.emit('event', data)
   // TO: this.game.events.emit('event', data)
   
   // CHANGE: this.game.eventManagerPlugin.on('event', callback)
   // TO: this.game.events.on('event', callback, context)
   ```

3. **Update event cleanup** (all files):
   ```javascript
   // CHANGE: this.game.eventManagerPlugin.cleanup(game)
   // TO: this.game.events.off('event', callback, context)
   ```

**Search & Replace Patterns**:
- `this.game.eventManagerPlugin.` → `this.game.events.`
- `game.eventManagerPlugin` → `game.events`
- `import { EventManagerPlugin }` → `// EventManagerPlugin removed - use game.events`
- `pluginRegistry.register('EventManagerPlugin'` → `// EventManagerPlugin removed - use game.events`

---

## Phase 1: Custom Plugins (Edge Cases Only)

### 1. DebugPlugin (Visual Debugging)

**Purpose**: Custom visual debugging tools that extend Phaser's built-in debug capabilities

**Official Documentation**: 
- [Phaser Graphics Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.Graphics)
- [Phaser Debug Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Utils.Debug)
- [BasePlugin Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Plugins.BasePlugin)

**Relevant Patterns**:
```javascript
// Visual debugging with Graphics
this.debugGraphics = this.scene.add.graphics();
this.debugGraphics.lineStyle(2, 0x00ff00);
this.debugGraphics.strokeRect(x, y, width, height);

// Debug text rendering
this.scene.add.text(x, y, text, style);

// Console debugging tools
window.debugTools = {
    drawRect: (x, y, w, h) => this.drawRect(x, y, w, h),
    getGameState: () => this.getGameState()
};
```

**Key Steps to Integration**:
1. Keep DebugPlugin for visual debugging
2. Remove references to deleted plugins
3. Update to work with game.data and game.events
4. Optimize for edge case functionality only

**Code Snippets**:
```javascript
// DebugPlugin extending BasePlugin
export class DebugPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.debugGraphics = null;
        this.isEnabled = false;
    }
    
    onInit(data) {
        this.isEnabled = data.enabled || false;
    }
    
    onSceneBoot(scene) {
        // Create debug graphics for this scene
        this.debugGraphics = scene.add.graphics();
        this.debugGraphics.setDepth(1000);
    }
    
    // Visual debugging methods
    drawRect(x, y, width, height, color = 0x00ff00) {
        if (!this.isEnabled || !this.debugGraphics) return;
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeRect(x, y, width, height);
    }
    
    // Console debugging methods
    getGameState() {
        return this.game.data.get('gameState') || {};
    }
    
    getActiveScenes() {
        return this.game.scene.scenes
            .filter(scene => scene.scene.isActive())
            .map(scene => scene.scene.key);
    }
}
```

**Directions to Comment**:
- Document debug rendering methods
- Comment debug state management
- Explain debug performance impact

**Anti-patterns to Watch**:
- Don't leave debug graphics in production
- Avoid expensive debug operations in update loops
- Don't forget to clear debug graphics

**Current Code → Optimized Plugin Mapping**:
```javascript
// KEEP: DebugPlugin for visual debugging
// this.plugins.get('DebugPlugin').drawRect(x, y, w, h)

// UPDATE: Remove references to deleted plugins
// OLD: this.game.dataManagerPlugin.getGoals()
// NEW: this.game.data.get('goals')

// OLD: this.game.eventManagerPlugin.emit('event', data)
// NEW: this.game.events.emit('event', data)
```

**File-by-File Migration Steps**:

### Files to Keep (Legitimate Custom Functionality):
- `src/plugins/DebugPlugin.js` - **KEEP** - Visual debugging + console tools
- `src/plugins/BasePlugin.js` - **KEEP** - Foundation for custom plugins
- `src/plugins/PluginRegistry.js` - **SIMPLIFY** - For custom plugins only

### Files to Modify:
- `src/plugins/DebugPlugin.js` - Remove references to deleted plugins
- `src/plugins/PluginRegistry.js` - Remove DataManagerPlugin and EventManagerPlugin registrations
- `src/main.js` - Simplify plugin registrations

**Migration Steps**:
1. **Update DebugPlugin** (`src/plugins/DebugPlugin.js`):
   ```javascript
   // REMOVE: References to DataManagerPlugin and EventManagerPlugin
   // UPDATE: Use game.data and game.events directly
   // KEEP: Visual debugging and console tools functionality
   ```

2. **Simplify PluginRegistry** (`src/plugins/PluginRegistry.js`):
   ```javascript
   // REMOVE: DataManagerPlugin and EventManagerPlugin registrations
   // KEEP: Only custom plugins (DebugPlugin, future custom plugins)
   ```

3. **Update main.js**:
   ```javascript
   // REMOVE: DataManagerPlugin and EventManagerPlugin imports
   // KEEP: DebugPlugin registration
   // ADD: Initialize game.data and game.events directly
   ```

**Search & Replace Patterns**:
- `this.game.dataManagerPlugin.` → `this.game.data.`
- `this.game.eventManagerPlugin.` → `this.game.events.`
- `pluginRegistry.register('DataManagerPlugin'` → `// DataManagerPlugin removed - use game.data`
- `pluginRegistry.register('EventManagerPlugin'` → `// EventManagerPlugin removed - use game.events`

---

## Phase 2: Application State Management

### 1. ApplicationStateManager Utility Class

**Purpose**: Domain logic utility class that works with Phaser's built-in data system

**Official Documentation**: 
- [Phaser DataManager Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.DataManager)
- [Data Events Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.Events)

**Relevant Patterns**:
```javascript
// ApplicationStateManager using game.data
export class ApplicationStateManager {
    constructor(game) {
        this.game = game;
        this.setupDataIntegration();
    }
    
    setupDataIntegration() {
        // Listen to game.data events
        this.game.data.events.on('changedata', this.handleDataChange, this);
    }
    
    // Domain logic methods
    getGoals() {
        return this.game.data.get('goals') || [];
    }
    
    updateGoals(goals) {
        this.game.data.set('goals', goals);
    }
}
```

**Key Steps to Integration**:
1. Create ApplicationStateManager utility class
2. Move ApplicationState logic from DataManagerPlugin
3. Use game.data for persistence
4. Keep domain logic separate from Phaser systems

**Code Snippets**:
```javascript
// ApplicationStateManager.js
export class ApplicationStateManager {
    constructor(game) {
        this.game = game;
        this.initializeData();
        this.setupDataIntegration();
    }
    
    initializeData() {
        // Initialize with default data
        this.game.data.set('goals', []);
        this.game.data.set('gameState', {
            totalWins: 0,
            currentStreak: 0,
            gridSize: 5
        });
        this.game.data.set('settings', {
            soundEnabled: true,
            musicEnabled: true
        });
        this.game.data.set('rewards', []);
        this.game.data.set('categories', []);
    }
    
    setupDataIntegration() {
        // Listen to data changes and emit application events
        this.game.data.events.on('changedata', (parent, key, value, previousValue) => {
            switch (key) {
                case 'goals':
                    this.game.events.emit('goalsChanged', value, previousValue);
                    break;
                case 'gameState':
                    this.game.events.emit('gameStateChanged', value, previousValue);
                    break;
                case 'settings':
                    this.game.events.emit('settingsChanged', value, previousValue);
                    break;
            }
        });
    }
    
    // Domain logic methods
    getGoals() {
        return this.game.data.get('goals') || [];
    }
    
    getGoalsByState(state) {
        return this.getGoals().filter(goal => goal.state === state);
    }
    
    addGoal(goalData) {
        const goals = this.getGoals();
        const newGoal = {
            id: Date.now().toString(),
            ...goalData,
            state: 'to-do',
            createdAt: new Date()
        };
        goals.push(newGoal);
        this.game.data.set('goals', goals);
        return newGoal;
    }
    
    updateGoal(goalId, updates) {
        const goals = this.getGoals();
        const goalIndex = goals.findIndex(goal => goal.id === goalId);
        if (goalIndex !== -1) {
            goals[goalIndex] = { ...goals[goalIndex], ...updates };
            this.game.data.set('goals', goals);
            return goals[goalIndex];
        }
        return null;
    }
    
    getGameState() {
        return this.game.data.get('gameState') || {};
    }
    
    updateGameState(updates) {
        const currentState = this.getGameState();
        this.game.data.set('gameState', { ...currentState, ...updates });
    }
    
    getSettings() {
        return this.game.data.get('settings') || {};
    }
    
    updateSettings(updates) {
        const currentSettings = this.getSettings();
        this.game.data.set('settings', { ...currentSettings, ...updates });
    }
    
    exportState() {
        return {
            goals: this.getGoals(),
            gameState: this.getGameState(),
            settings: this.getSettings(),
            rewards: this.game.data.get('rewards') || [],
            categories: this.game.data.get('categories') || [],
            exportedAt: new Date().toISOString()
        };
    }
    
    importState(stateData) {
        if (stateData.goals) this.game.data.set('goals', stateData.goals);
        if (stateData.gameState) this.game.data.set('gameState', stateData.gameState);
        if (stateData.settings) this.game.data.set('settings', stateData.settings);
        if (stateData.rewards) this.game.data.set('rewards', stateData.rewards);
        if (stateData.categories) this.game.data.set('categories', stateData.categories);
        
        this.game.events.emit('stateImported', stateData);
    }
}
```

**Directions to Comment**:
- Document data structure and relationships
- Comment domain logic methods
- Explain integration with Phaser's data system

**Anti-patterns to Watch**:
- Don't store large objects directly in data manager
- Avoid circular data dependencies
- Don't forget to clean up event listeners

**File-by-File Migration Steps**:

### Files to Create:
- `src/utils/ApplicationStateManager.js` - Domain logic utility class

### Files to Modify:
- `src/main.js` - Add ApplicationStateManager initialization
- All scene files - Use ApplicationStateManager instead of DataManagerPlugin

**Migration Steps**:
1. **Create ApplicationStateManager** (`src/utils/ApplicationStateManager.js`):
   ```javascript
   // Move ApplicationState logic from DataManagerPlugin
   // Use game.data for persistence
   // Keep domain logic separate from Phaser systems
   ```

2. **Update main.js**:
   ```javascript
   // ADD: import { ApplicationStateManager } from './utils/ApplicationStateManager.js';
   // ADD: const appStateManager = new ApplicationStateManager(game);
   // REMOVE: DataManagerPlugin and EventManagerPlugin initialization
   ```

3. **Update all scene files**:
   ```javascript
   // CHANGE: this.game.dataManagerPlugin.getGoals()
   // TO: this.game.appStateManager.getGoals()
   
   // CHANGE: this.game.dataManagerPlugin.updateGameState(state)
   // TO: this.game.appStateManager.updateGameState(state)
   ```

**Search & Replace Patterns**:
- `this.game.dataManagerPlugin.` → `this.game.appStateManager.`
- `game.dataManagerPlugin` → `game.appStateManager`
- `import { DataManagerPlugin }` → `import { ApplicationStateManager } from './utils/ApplicationStateManager.js'`

---

## Phase 3: Plugin Registry Simplification

### 1. Simplified Plugin Registry

**Purpose**: Manage only custom plugins that extend Phaser functionality

**Official Documentation**: 
- [Phaser Plugin System](https://newdocs.phaser.io/docs/3.70.0/Phaser.Plugins.PluginManager)
- [BasePlugin Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Plugins.BasePlugin)

**Relevant Patterns**:
```javascript
// Simplified plugin registry for custom plugins only
export class PluginRegistry {
    constructor() {
        this.plugins = new Map();
    }
    
    register(key, pluginClass, config = {}, dependencies = []) {
        // Only register custom plugins
        this.plugins.set(key, {
            pluginClass,
            config,
            dependencies,
            enabled: config.enabled !== false
        });
    }
    
    getPhaserPluginConfig() {
        // Return only custom plugins for Phaser config
        const customPlugins = [];
        for (const [key, plugin] of this.plugins) {
            if (plugin.enabled) {
                customPlugins.push({
                    key,
                    plugin: plugin.pluginClass,
                    start: true,
                    ...plugin.config
                });
            }
        }
        return { global: customPlugins };
    }
}
```

**Key Steps to Integration**:
1. Remove DataManagerPlugin and EventManagerPlugin registrations
2. Keep only custom plugins (DebugPlugin, future custom plugins)
3. Simplify plugin management
4. Focus on edge case functionality

**Code Snippets**:
```javascript
// Simplified main.js plugin registration
import { PluginRegistry } from './plugins/PluginRegistry.js';
import { DebugPlugin } from './plugins/DebugPlugin.js';
import { ApplicationStateManager } from './utils/ApplicationStateManager.js';

// Create plugin registry
const pluginRegistry = new PluginRegistry();

// Register only custom plugins
pluginRegistry.register('DebugPlugin', DebugPlugin, {
    enabled: process.env.NODE_ENV === 'development',
    debug: true,
    showBounds: false,
    showGrid: false
}, []);

// Game configuration
const config = {
    // ... other config
    plugins: pluginRegistry.getPhaserPluginConfig()
};

// Initialize ApplicationStateManager directly (not as plugin)
async function initializeCoreSystems(game) {
    const appStateManager = new ApplicationStateManager(game);
    await appStateManager.initialize();
    
    // Make globally accessible
    window.appStateManager = appStateManager;
    game.appStateManager = appStateManager;
}
```

**Directions to Comment**:
- Document custom plugin purposes
- Comment plugin configuration options
- Explain when to create custom plugins vs using Phaser core

**Anti-patterns to Watch**:
- Don't create plugins that reinvent Phaser core functionality
- Avoid over-engineering simple functionality
- Don't forget to clean up plugin resources

**File-by-File Migration Steps**:

### Files to Modify:
- `src/plugins/PluginRegistry.js` - Simplify for custom plugins only
- `src/main.js` - Remove core plugin registrations, add ApplicationStateManager

**Migration Steps**:
1. **Update PluginRegistry** (`src/plugins/PluginRegistry.js`):
   ```javascript
   // REMOVE: DataManagerPlugin and EventManagerPlugin support
   // SIMPLIFY: Focus on custom plugins only
   // KEEP: Plugin lifecycle management for custom plugins
   ```

2. **Update main.js**:
   ```javascript
   // REMOVE: DataManagerPlugin and EventManagerPlugin imports
   // REMOVE: pluginRegistry.register calls for core plugins
   // ADD: ApplicationStateManager initialization
   // KEEP: DebugPlugin registration
   ```

**Search & Replace Patterns**:
- `pluginRegistry.register('DataManagerPlugin'` → `// DataManagerPlugin removed - use game.data`
- `pluginRegistry.register('EventManagerPlugin'` → `// EventManagerPlugin removed - use game.events`
- `import { DataManagerPlugin }` → `// DataManagerPlugin removed - use game.data`
- `import { EventManagerPlugin }` → `// EventManagerPlugin removed - use game.events`

---

## Implementation Summary

### What We Remove (Reinventing Phaser Core):
- ❌ **DataManagerPlugin** - Use `game.data` instead
- ❌ **EventManagerPlugin** - Use `game.events` instead  
- ❌ **StateManagerAdapter** - No longer needed
- ❌ **EventManagerAdapter** - No longer needed

### What We Keep (Legitimate Custom Functionality):
- ✅ **DebugPlugin** - Visual debugging + console tools (edge case)
- ✅ **BasePlugin** - Foundation for custom plugins
- ✅ **PluginRegistry** - Simplified for custom plugins only
- ✅ **ApplicationStateManager** - Domain logic utility class

### What We Use (Phaser Core Functions):
- 🏗️ **`game.data`** - Built-in DataManager for application state
- 🏗️ **`game.events`** - Built-in EventEmitter for application events
- 🏗️ **`scene.data`** - Scene-level DataManager (if needed)
- 🏗️ **`scene.events`** - Scene-level EventEmitter (if needed)

### Benefits of This Approach:
1. **Leverages Phaser's built-in systems** - Better performance, less maintenance
2. **Follows Phaser best practices** - Uses framework as intended
3. **Reduces code complexity** - Less custom code to maintain
4. **Better integration** - Works seamlessly with Phaser's lifecycle
5. **Future-proof** - Updates with Phaser framework
6. **Focus on value** - Custom plugins only for legitimate edge cases

### Migration Timeline:
- **Week 1**: Remove DataManagerPlugin and EventManagerPlugin, implement game.data and game.events
- **Week 2**: Create ApplicationStateManager, update all scene files, test functionality
- **Week 3**: Optimize DebugPlugin, simplify PluginRegistry, final testing

This approach gives you a clean, Phaser-native implementation that follows the framework's intended patterns while keeping only the custom functionality that truly adds value.

---

## **📚 Phaser Native Capabilities Reference**

### **✅ Built-in Systems (Use Directly - DO NOT Create Custom Plugins)**

#### **Audio Management**
```javascript
// Native Phaser Sound System
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
```

#### **Tween Management**
```javascript
// Native Phaser Tween System
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
```

#### **Texture Management**
```javascript
// Native Phaser Texture System
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
```

#### **Input Management**
```javascript
// Native Phaser Input System
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
```

#### **Camera Management**
```javascript
// Native Phaser Camera System
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
```

#### **Particle Management**
```javascript
// Native Phaser Particle System
this.add.particles(x, y, texture, config);
particles.createEmitter(config);
emitter.setPosition(x, y);
emitter.start();
emitter.stop();
emitter.kill();

// Particle Events (Native)
emitter.on('particledeath', callback);
emitter.on('particleexplode', callback);
```

### **❌ Anti-Patterns: DO NOT Create These Custom Plugins**

**These would reinvent Phaser's built-in capabilities:**

1. **AudioManagerPlugin** - Use `this.sound.*` directly
2. **TweenManagerPlugin** - Use `this.tweens.*` directly  
3. **TextureManagerPlugin** - Use `this.textures.*` directly
4. **InputManagerPlugin** - Use `this.input.*` directly
5. **CameraManagerPlugin** - Use `this.cameras.*` directly (basic cases)
6. **ParticleManagerPlugin** - Use `this.add.particles()` directly (basic cases)

### **✅ Legitimate Custom Plugins (Edge Cases Only)**

**Only create custom plugins for functionality Phaser doesn't provide:**

1. **DebugPlugin** - Visual debugging tools (✅ We have this)
2. **AdvancedCameraPlugin** - Complex camera transitions, multi-camera setups
3. **AdvancedParticlePlugin** - Complex particle behaviors, particle pooling
4. **CustomInputPlugin** - Specialized input handling beyond Phaser's capabilities
5. **GameplayPlugin** - Domain-specific game mechanics

### **📋 Best Practices Summary**

1. **Use Phaser's native systems directly** in scenes
2. **Create utility classes** for domain-specific logic (like `ApplicationStateManager`)
3. **Only create custom plugins** for truly unique functionality
4. **Follow the 95% native, 5% custom rule**
5. **Document architectural decisions** for AI assistants

### **🔗 Official Documentation References**

- [Phaser Sound Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Sound.BaseSound)
- [Phaser Tween Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Tweens.Tween)
- [Phaser Texture Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Textures.TextureManager)
- [Phaser Input Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Input.InputManager)
- [Phaser Camera Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Cameras.Scene2D.Camera)
- [Phaser Particle Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.Particles.ParticleEmitter)
```javascript
// Current: Custom StateManager
class StateManager {
    constructor() {
        this.state = {};
    }
    
    setState(key, value) {
        this.state[key] = value;
        this.emit('stateChanged', key, value);
    }
    
    getState(key) {
        return this.state[key];
    }
}

// Usage: Direct instantiation
const stateManager = new StateManager();
stateManager.setState('score', 100);
const score = stateManager.getState('score');

// Plugin: DataManagerPlugin using Phaser DataManager
class DataManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.dataManager = new Phaser.Data.DataManager();
    }
    
    init(data) {
        // Initialize with existing state data
        if (data.initialState) {
            this.dataManager.set(data.initialState);
        }
    }
    
    setState(key, value) {
        this.dataManager.set(key, value);
        // Phaser DataManager automatically emits 'changedata' events
    }
    
    getState(key) {
        return this.dataManager.get(key);
    }
}

// Usage: Via plugin system
this.plugins.get('DataManagerPlugin').setState('score', 100);
const score = this.plugins.get('DataManagerPlugin').getState('score');

// Current: Manual state change events
stateManager.on('stateChanged', (key, value) => {
    console.log(`State changed: ${key} = ${value}`);
});

// Plugin: Phaser DataManager events
this.data.on('changedata', (key, value, oldValue) => {
    console.log(`Data changed: ${key} = ${value} (was: ${oldValue})`);
});

// Current: Batch state setting
stateManager.setState('player', { name: 'Player1', level: 5 });
stateManager.setState('score', 1000);

// Plugin: Phaser DataManager batch setting
this.data.set({ 
    player: { name: 'Player1', level: 5 },
    score: 1000 
});
```

**File-by-File Migration Steps**:

### Files to Create/Modify for StateManager → DataManagerPlugin

**New Files to Create:**
- `src/plugins/DataManagerPlugin.js` - New plugin implementation
- `src/plugins/StateManagerAdapter.js` - Compatibility layer

**Files to Modify:**
- `src/managers/StateManager.js` (lines 1-426) - **DEPRECATE** - Keep for compatibility
- `src/main.js` (lines 10, 100-120) - Update StateManager instantiation
- `src/scenes/MainMenuScene.js` (lines 1-227) - Update state access patterns
- `src/scenes/BingoGridScene.js` (lines 1-653) - Update state access patterns
- `src/scenes/GoalLibraryScene.js` - Update state access patterns
- `src/scenes/RewardsScene.js` - Update state access patterns
- `src/components/BingoCell.js` - Update state access patterns
- `src/components/GoalCard.js` - Update state access patterns
- `src/components/AddGoalModal.js` - Update state access patterns

**Detailed Migration Steps:**

1. **Create DataManagerPlugin** (`src/plugins/DataManagerPlugin.js`):
   ```javascript
   // Migrate StateManager functionality to plugin
   // Lines 1-426 from StateManager.js → Plugin structure
   ```

2. **Update main.js** (lines 100-120):
   ```javascript
   // BEFORE: const stateManager = new StateManager(game, logger);
   // AFTER: Register DataManagerPlugin in game config
   ```

3. **Update scene constructors** (all scene files):
   ```javascript
   // BEFORE: this.stateManager = game.stateManager;
   // AFTER: this.dataPlugin = this.plugins.get('DataManagerPlugin');
   ```

4. **Update state access patterns** (all files):
   ```javascript
   // BEFORE: this.stateManager.getGoals()
   // AFTER: this.dataPlugin.getGoals()
   ```

5. **Update event listeners** (all files):
   ```javascript
   // BEFORE: this.stateManager.on('goalsChanged', callback)
   // AFTER: this.data.on('changedata-goals', callback)
   ```

**Search & Replace Patterns:**
- `stateManager.` → `this.plugins.get('DataManagerPlugin').`
- `this.stateManager` → `this.dataPlugin`
- `game.stateManager` → `game.plugins.get('DataManagerPlugin')`
- `import { StateManager }` → `// StateManager replaced by DataManagerPlugin`

### 2. EventManager → EventEmitter

**Official Documentation**:
- [Phaser EventEmitter Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter)
- [Scene Events](https://newdocs.phaser.io/docs/3.70.0/Phaser.Scenes.Events)

**Relevant Patterns**:
```javascript
// EventEmitter patterns
this.events.on('event', callback);
this.events.emit('event', data);
this.events.off('event', callback);
```

**Key Steps to Integration**:
1. Replace custom EventManager with Phaser EventEmitter
2. Update event registration patterns
3. Migrate event data structures
4. Update cleanup procedures

**Code Snippets**:
```javascript
class EventManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.eventEmitter = new Phaser.Events.EventEmitter();
    }
    
    init(data) {
        // Initialize with existing event handlers
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        // Migrate existing event handlers
        this.eventEmitter.on('gameStateChanged', this.handleGameStateChange);
    }
    
    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }
    
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
}

// Usage in scenes
this.plugins.get('EventManagerPlugin').emit('goalCompleted', { goalId: 1 });
```

**Directions to Comment**:
- Document event names and data structures
- Comment event lifecycle and cleanup
- Explain event propagation rules

**Anti-patterns to Watch**:
- Don't create memory leaks with unremoved listeners
- Avoid circular event dependencies
- Don't emit events in tight loops

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom EventManager
class EventManager {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// Usage: Direct instantiation
const eventManager = new EventManager();
eventManager.on('goalCompleted', (data) => {
    console.log('Goal completed:', data);
});
eventManager.emit('goalCompleted', { goalId: 1 });

// Plugin: EventManagerPlugin using Phaser EventEmitter
class EventManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.eventEmitter = new Phaser.Events.EventEmitter();
    }
    
    init(data) {
        // Initialize with existing event handlers
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        // Migrate existing event handlers
        this.eventEmitter.on('gameStateChanged', this.handleGameStateChange);
    }
    
    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }
    
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
}

// Usage: Via plugin system
this.plugins.get('EventManagerPlugin').emit('goalCompleted', { goalId: 1 });
this.plugins.get('EventManagerPlugin').on('goalCompleted', (data) => {
    console.log('Goal completed:', data);
});

// Current: Manual event cleanup
eventManager.off('goalCompleted', callback);

// Plugin: Phaser EventEmitter cleanup
this.plugins.get('EventManagerPlugin').off('goalCompleted', callback);

// Current: Custom event data structures
eventManager.emit('playerAction', {
    action: 'click',
    target: 'goal',
    timestamp: Date.now()
});

// Plugin: Phaser EventEmitter with same data structures
this.plugins.get('EventManagerPlugin').emit('playerAction', {
    action: 'click',
    target: 'goal',
    timestamp: Date.now()
});

// Current: Event namespacing
eventManager.on('ui.button.click', callback);
eventManager.emit('ui.button.click', { buttonId: 'start' });

// Plugin: Phaser EventEmitter with namespacing
this.plugins.get('EventManagerPlugin').on('ui.button.click', callback);
this.plugins.get('EventManagerPlugin').emit('ui.button.click', { buttonId: 'start' });
```

**File-by-File Migration Steps**:

### Files to Create/Modify for EventManager → EventEmitter

**New Files to Create:**
- `src/plugins/EventManagerPlugin.js` - New plugin implementation
- `src/plugins/EventManagerAdapter.js` - Compatibility layer

**Files to Modify:**
- `src/utils/EventManager.js` (lines 1-108) - **DEPRECATE** - Keep for compatibility
- `src/main.js` (lines 17, 150-200) - Update EventManager usage
- `src/managers/StateManager.js` (lines 75-93) - Update event listener setup
- `src/scenes/MainMenuScene.js` - Update event handling
- `src/scenes/BingoGridScene.js` - Update event handling
- `src/scenes/GoalLibraryScene.js` - Update event handling
- `src/scenes/RewardsScene.js` - Update event handling
- `src/components/BingoCell.js` - Update event handling
- `src/components/GoalCard.js` - Update event handling
- `src/components/AddGoalModal.js` - Update event handling

**Detailed Migration Steps:**

1. **Create EventManagerPlugin** (`src/plugins/EventManagerPlugin.js`):
   ```javascript
   // Migrate EventManager functionality to plugin
   // Lines 1-108 from EventManager.js → Plugin structure
   ```

2. **Update main.js** (lines 17, 150-200):
   ```javascript
   // BEFORE: import { eventManager } from './utils/EventManager.js';
   // AFTER: Register EventManagerPlugin in game config
   ```

3. **Update StateManager.js** (lines 75-93):
   ```javascript
   // BEFORE: this.setupDataEventListeners();
   // AFTER: Use Phaser EventEmitter directly
   ```

4. **Update event registration** (all files):
   ```javascript
   // BEFORE: eventManager.addListener(game, event, callback, context);
   // AFTER: this.events.on(event, callback, context);
   ```

5. **Update event cleanup** (all files):
   ```javascript
   // BEFORE: eventManager.cleanup(game);
   // AFTER: this.events.off(event, callback, context);
   ```

**Search & Replace Patterns:**
- `eventManager.` → `this.events.`
- `import { eventManager }` → `// EventManager replaced by Phaser EventEmitter`
- `eventManager.addListener(` → `this.events.on(`
- `eventManager.cleanup(` → `// Event cleanup handled by Phaser`

### 3. DebugTools → Debug Plugin

**Official Documentation**:
- [Phaser Debug Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Utils.Debug)
- [Debug Scene Plugin](https://newdocs.phaser.io/docs/3.70.0/Phaser.Plugins.ScenePlugin)

**Relevant Patterns**:
```javascript
// Debug patterns
this.debug = this.add.graphics();
this.debug.lineStyle(2, 0x00ff00);
this.debug.strokeRect(x, y, width, height);
```

**Key Steps to Integration**:
1. Create DebugPlugin extending BasePlugin
2. Migrate existing debug utilities
3. Integrate with Phaser debug system
4. Update debug rendering

**Code Snippets**:
```javascript
class DebugPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.debugGraphics = null;
    }
    
    init(data) {
        // Initialize debug graphics
        this.debugGraphics = this.scene.add.graphics();
    }
    
    drawRect(x, y, width, height, color = 0x00ff00) {
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeRect(x, y, width, height);
    }
    
    clear() {
        this.debugGraphics.clear();
    }
}

// Usage in scenes
this.plugins.get('DebugPlugin').drawRect(100, 100, 50, 50);
```

**Directions to Comment**:
- Document debug rendering methods
- Comment debug state management
- Explain debug performance impact

**Anti-patterns to Watch**:
- Don't leave debug graphics in production
- Avoid expensive debug operations in update loops
- Don't forget to clear debug graphics

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom DebugTools
class DebugTools {
    constructor(scene) {
        this.scene = scene;
        this.debugGraphics = scene.add.graphics();
    }
    
    drawRect(x, y, width, height, color = 0x00ff00) {
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeRect(x, y, width, height);
    }
    
    drawCircle(x, y, radius, color = 0xff0000) {
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeCircle(x, y, radius);
    }
    
    clear() {
        this.debugGraphics.clear();
    }
}

// Usage: Direct instantiation
const debugTools = new DebugTools(this);
debugTools.drawRect(100, 100, 50, 50);
debugTools.clear();

// Plugin: DebugPlugin using Phaser Graphics
class DebugPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.debugGraphics = null;
    }
    
    init(data) {
        // Initialize debug graphics
        this.debugGraphics = this.scene.add.graphics();
    }
    
    drawRect(x, y, width, height, color = 0x00ff00) {
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeRect(x, y, width, height);
    }
    
    drawCircle(x, y, radius, color = 0xff0000) {
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeCircle(x, y, radius);
    }
    
    clear() {
        this.debugGraphics.clear();
    }
}

// Usage: Via plugin system
this.plugins.get('DebugPlugin').drawRect(100, 100, 50, 50);
this.plugins.get('DebugPlugin').clear();

// Current: Manual debug state management
class DebugTools {
    constructor(scene) {
        this.scene = scene;
        this.debugGraphics = scene.add.graphics();
        this.isEnabled = false;
    }
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            this.clear();
        }
    }
}

// Plugin: DebugPlugin with Phaser debug features
class DebugPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.debugGraphics = null;
        this.isEnabled = false;
    }
    
    init(data) {
        this.debugGraphics = this.scene.add.graphics();
        this.isEnabled = data.enabled || false;
    }
    
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            this.clear();
        }
    }
    
    // Additional Phaser debug features
    drawBounds(gameObject, color = 0x00ff00) {
        if (!this.isEnabled) return;
        const bounds = gameObject.getBounds();
        this.drawRect(bounds.x, bounds.y, bounds.width, bounds.height, color);
    }
    
    drawGrid(cellWidth, cellHeight, color = 0x666666) {
        if (!this.isEnabled) return;
        this.debugGraphics.lineStyle(1, color, 0.5);
        for (let x = 0; x < this.scene.cameras.main.width; x += cellWidth) {
            this.debugGraphics.moveTo(x, 0);
            this.debugGraphics.lineTo(x, this.scene.cameras.main.height);
        }
        for (let y = 0; y < this.scene.cameras.main.height; y += cellHeight) {
            this.debugGraphics.moveTo(0, y);
            this.debugGraphics.lineTo(this.scene.cameras.main.width, y);
        }
        this.debugGraphics.strokePath();
    }
}

// Current: Debug text rendering
debugTools.drawText(100, 100, 'Debug Info', { fontSize: '16px', color: '#ffffff' });

// Plugin: DebugPlugin with text rendering
this.plugins.get('DebugPlugin').drawText(100, 100, 'Debug Info', { 
    fontSize: '16px', 
    color: '#ffffff' 
});
```

**File-by-File Migration Steps**:

### Files to Create/Modify for DebugTools → Debug Plugin

**New Files to Create:**
- `src/plugins/DebugPlugin.js` - New plugin implementation
- `src/plugins/DebugToolsAdapter.js` - Compatibility layer

**Files to Modify:**
- `src/utils/DebugTools.js` (lines 1-423) - **DEPRECATE** - Keep for compatibility
- `src/main.js` (lines 15, 200-250) - Update DebugTools instantiation
- `src/scenes/MainMenuScene.js` - Update debug access patterns
- `src/scenes/BingoGridScene.js` - Update debug access patterns
- `src/scenes/GoalLibraryScene.js` - Update debug access patterns
- `src/scenes/RewardsScene.js` - Update debug access patterns
- `src/components/BingoCell.js` - Update debug access patterns
- `src/components/GoalCard.js` - Update debug access patterns
- `src/components/AddGoalModal.js` - Update debug access patterns

**Detailed Migration Steps:**

1. **Create DebugPlugin** (`src/plugins/DebugPlugin.js`):
   ```javascript
   // Migrate DebugTools functionality to plugin
   // Lines 1-423 from DebugTools.js → Plugin structure
   ```

2. **Update main.js** (lines 15, 200-250):
   ```javascript
   // BEFORE: const debugTools = new DebugTools(game, logger);
   // AFTER: Register DebugPlugin in game config
   ```

3. **Update debug access patterns** (all files):
   ```javascript
   // BEFORE: window.debugTools.getGameState()
   // AFTER: this.plugins.get('DebugPlugin').getGameState()
   ```

4. **Update debug graphics** (all files):
   ```javascript
   // BEFORE: debugTools.drawRect(x, y, w, h)
   // AFTER: this.plugins.get('DebugPlugin').drawRect(x, y, w, h)
   ```

5. **Update debug state management** (all files):
   ```javascript
   // BEFORE: debugTools.toggle()
   // AFTER: this.plugins.get('DebugPlugin').toggle()
   ```

**Search & Replace Patterns:**
- `window.debugTools.` → `this.plugins.get('DebugPlugin').`
- `debugTools.` → `this.plugins.get('DebugPlugin').`
- `import { DebugTools }` → `// DebugTools replaced by DebugPlugin`
- `new DebugTools(` → `// DebugTools replaced by DebugPlugin`

---

## Phase 2: Enhancement Plugins (Short-term)

### 4. AudioManager

**Official Documentation**:
- [Phaser Sound Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Sound.BaseSound)
- [Audio Manager](https://newdocs.phaser.io/docs/3.70.0/Phaser.Sound.BaseSoundManager)

**Relevant Patterns**:
```javascript
// Audio patterns
this.sound.add('key');
this.sound.play('key');
this.sound.stop('key');
```

**Key Steps to Integration**:
1. Create AudioManagerPlugin extending BasePlugin
2. Implement audio loading and playback
3. Add spatial audio support
4. Integrate with asset loading

**Code Snippets**:
```javascript
class AudioManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.sounds = new Map();
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
    }
    
    init(data) {
        // Initialize audio settings
        this.musicVolume = data.musicVolume || 1.0;
        this.sfxVolume = data.sfxVolume || 1.0;
    }
    
    loadSound(key, config) {
        const sound = this.scene.sound.add(key, config);
        this.sounds.set(key, sound);
        return sound;
    }
    
    playSound(key, config = {}) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play(config);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        // Update all music sounds
    }
}

// Usage in scenes
this.plugins.get('AudioManagerPlugin').playSound('goalComplete', { volume: 0.5 });
```

**Directions to Comment**:
- Document audio file formats and loading
- Comment volume management and mixing
- Explain spatial audio implementation

**Anti-patterns to Watch**:
- Don't load large audio files without compression
- Avoid playing too many sounds simultaneously
- Don't forget to preload audio assets

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom AudioManager
class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = new Map();
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
    }
    
    loadSound(key, config) {
        const sound = this.scene.sound.add(key, config);
        this.sounds.set(key, sound);
        return sound;
    }
    
    playSound(key, config = {}) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play(config);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        // Update all music sounds
    }
}

// Usage: Direct instantiation
const audioManager = new AudioManager(this);
audioManager.loadSound('goalComplete', { volume: 0.5 });
audioManager.playSound('goalComplete');

// Plugin: AudioManagerPlugin using Phaser Sound
class AudioManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.sounds = new Map();
        this.musicVolume = 1.0;
        this.sfxVolume = 1.0;
    }
    
    init(data) {
        // Initialize audio settings
        this.musicVolume = data.musicVolume || 1.0;
        this.sfxVolume = data.sfxVolume || 1.0;
    }
    
    loadSound(key, config) {
        const sound = this.scene.sound.add(key, config);
        this.sounds.set(key, sound);
        return sound;
    }
    
    playSound(key, config = {}) {
        const sound = this.sounds.get(key);
        if (sound) {
            sound.play(config);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        // Update all music sounds
    }
}

// Usage: Via plugin system
this.plugins.get('AudioManagerPlugin').loadSound('goalComplete', { volume: 0.5 });
this.plugins.get('AudioManagerPlugin').playSound('goalComplete');

// Current: Manual sound loading
audioManager.loadSound('backgroundMusic', { 
    loop: true, 
    volume: 0.3 
});

// Plugin: Phaser Sound with spatial audio
this.plugins.get('AudioManagerPlugin').loadSound('backgroundMusic', { 
    loop: true, 
    volume: 0.3,
    source: {
        x: 400,
        y: 300,
        refDistance: 50
    }
});

// Current: Sound event handling
sound.on('complete', () => {
    console.log('Sound finished playing');
});

// Plugin: Phaser Sound events
const sound = this.plugins.get('AudioManagerPlugin').loadSound('goalComplete');
sound.on('complete', () => {
    console.log('Sound finished playing');
});

// Current: Volume management
audioManager.setMusicVolume(0.5);
audioManager.setSfxVolume(0.8);

// Plugin: Phaser Sound volume management
this.plugins.get('AudioManagerPlugin').setMusicVolume(0.5);
this.plugins.get('AudioManagerPlugin').setSfxVolume(0.8);

// Current: Sound stopping
sound.stop();

// Plugin: Phaser Sound stopping
const sound = this.plugins.get('AudioManagerPlugin').sounds.get('goalComplete');
sound.stop();
```

**File-by-File Migration Steps**:

### Files to Create/Modify for AudioManager

**New Files to Create:**
- `src/plugins/AudioManagerPlugin.js` - New plugin implementation
- `src/plugins/AudioManagerAdapter.js` - Compatibility layer

**Files to Modify:**
- `src/main.js` (lines 25-77) - Add AudioManagerPlugin to game config
- `src/scenes/PreloadScene.js` - Add audio asset loading
- `src/scenes/MainMenuScene.js` - Add audio playback
- `src/scenes/BingoGridScene.js` - Add audio feedback
- `src/scenes/GoalLibraryScene.js` - Add audio feedback
- `src/scenes/RewardsScene.js` - Add audio feedback
- `src/components/BingoCell.js` - Add click sounds
- `src/components/GoalCard.js` - Add interaction sounds
- `src/components/AddGoalModal.js` - Add UI sounds

**Detailed Migration Steps:**

1. **Create AudioManagerPlugin** (`src/plugins/AudioManagerPlugin.js`):
   ```javascript
   // Create new audio plugin using Phaser Sound system
   // Implement spatial audio, volume management, sound effects
   ```

2. **Update PreloadScene.js**:
   ```javascript
   // BEFORE: No audio loading
   // AFTER: Load audio assets
   this.load.audio('goalComplete', 'assets/audio/goal-complete.mp3');
   this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
   ```

3. **Update scene files** (all scenes):
   ```javascript
   // BEFORE: No audio
   // AFTER: Add audio feedback
   this.plugins.get('AudioManagerPlugin').playSound('goalComplete');
   ```

4. **Update component files** (all components):
   ```javascript
   // BEFORE: No audio feedback
   // AFTER: Add interaction sounds
   this.plugins.get('AudioManagerPlugin').playSound('buttonClick');
   ```

5. **Update main.js** (lines 25-77):
   ```javascript
   // BEFORE: No audio configuration
   // AFTER: Add AudioManagerPlugin to game config
   plugins: {
       global: [
           { key: 'AudioManagerPlugin', plugin: AudioManagerPlugin, start: true }
       ]
   }
   ```

**Search & Replace Patterns:**
- `// No audio` → `this.plugins.get('AudioManagerPlugin').playSound('soundKey');`
- `this.load.` → `this.load.audio('key', 'path');` (in PreloadScene)
- `// Add audio` → `this.plugins.get('AudioManagerPlugin').loadSound('key', config);`

### 5. TweenManager

**File-by-File Migration Steps**:

### Files to Create/Modify for TweenManager

**New Files to Create:**
- `src/plugins/TweenManagerPlugin.js` - New plugin implementation

**Files to Modify:**
- `src/main.js` (lines 25-77) - Add TweenManagerPlugin to game config
- `src/scenes/MainMenuScene.js` - Add UI animations
- `src/scenes/BingoGridScene.js` - Add grid animations
- `src/scenes/GoalLibraryScene.js` - Add list animations
- `src/scenes/RewardsScene.js` - Add reward animations
- `src/components/BingoCell.js` - Add cell animations
- `src/components/GoalCard.js` - Add card animations
- `src/components/AddGoalModal.js` - Add modal animations

**Search & Replace Patterns:**
- `// Add animation` → `this.plugins.get('TweenManagerPlugin').fadeIn(target);`
- `this.tweens.add(` → `this.plugins.get('TweenManagerPlugin').tweenManager.add(`
- `// No animation` → `this.plugins.get('TweenManagerPlugin').slideIn(target, fromX, toX);`

### 6. TextureManager

**File-by-File Migration Steps**:

### Files to Create/Modify for TextureManager

**New Files to Create:**
- `src/plugins/TextureManagerPlugin.js` - New plugin implementation

**Files to Modify:**
- `src/main.js` (lines 25-77) - Add TextureManagerPlugin to game config
- `src/scenes/PreloadScene.js` - Add texture optimization
- `src/scenes/MainMenuScene.js` - Add texture atlasing
- `src/scenes/BingoGridScene.js` - Add texture atlasing
- `src/scenes/GoalLibraryScene.js` - Add texture atlasing
- `src/scenes/RewardsScene.js` - Add texture atlasing
- `src/components/BingoCell.js` - Add texture optimization
- `src/components/GoalCard.js` - Add texture optimization
- `src/components/AddGoalModal.js` - Add texture optimization

**Search & Replace Patterns:**
- `this.load.image(` → `this.plugins.get('TextureManagerPlugin').loadTexture(`
- `this.textures.get(` → `this.plugins.get('TextureManagerPlugin').getTexture(`
- `// Add texture` → `this.plugins.get('TextureManagerPlugin').optimizeTexture('key');`

### 7. CameraManager

**File-by-File Migration Steps**:

### Files to Create/Modify for CameraManager

**New Files to Create:**
- `src/plugins/CameraManagerPlugin.js` - New plugin implementation

**Files to Modify:**
- `src/main.js` (lines 25-77) - Add CameraManagerPlugin to game config
- `src/scenes/MainMenuScene.js` - Add camera transitions
- `src/scenes/BingoGridScene.js` - Add camera effects
- `src/scenes/GoalLibraryScene.js` - Add camera transitions
- `src/scenes/RewardsScene.js` - Add camera effects
- `src/components/BingoCell.js` - Add camera focus
- `src/components/GoalCard.js` - Add camera focus
- `src/components/AddGoalModal.js` - Add camera focus

**Search & Replace Patterns:**
- `this.cameras.main.` → `this.plugins.get('CameraManagerPlugin').`
- `// Add camera` → `this.plugins.get('CameraManagerPlugin').transitionTo(x, y);`
- `// No camera` → `this.plugins.get('CameraManagerPlugin').zoomTo(1.5);`

### 8. ParticleManager

**File-by-File Migration Steps**:

### Files to Create/Modify for ParticleManager

**New Files to Create:**
- `src/plugins/ParticleManagerPlugin.js` - New plugin implementation

**Files to Modify:**
- `src/main.js` (lines 25-77) - Add ParticleManagerPlugin to game config
- `src/scenes/PreloadScene.js` - Add particle textures
- `src/scenes/MainMenuScene.js` - Add particle effects
- `src/scenes/BingoGridScene.js` - Add celebration particles
- `src/scenes/GoalLibraryScene.js` - Add particle effects
- `src/scenes/RewardsScene.js` - Add reward particles
- `src/components/BingoCell.js` - Add completion particles
- `src/components/GoalCard.js` - Add interaction particles
- `src/components/AddGoalModal.js` - Add UI particles

**Search & Replace Patterns:**
- `// Add particles` → `this.plugins.get('ParticleManagerPlugin').createEffect('key', x, y);`
- `this.add.particles(` → `this.plugins.get('ParticleManagerPlugin').particleManager.add(`
- `// No particles` → `this.plugins.get('ParticleManagerPlugin').playEffect('key');`

### 9. InputManager

**File-by-File Migration Steps**:

### Files to Create/Modify for InputManager

**New Files to Create:**
- `src/plugins/InputManagerPlugin.js` - New plugin implementation

**Files to Modify:**
- `src/main.js` (lines 25-77) - Add InputManagerPlugin to game config
- `src/scenes/MainMenuScene.js` - Add input handling
- `src/scenes/BingoGridScene.js` - Add input handling
- `src/scenes/GoalLibraryScene.js` - Add input handling
- `src/scenes/RewardsScene.js` - Add input handling
- `src/components/BingoCell.js` - Add input handling
- `src/components/GoalCard.js` - Add input handling
- `src/components/AddGoalModal.js` - Add input handling

**Search & Replace Patterns:**
- `this.input.on(` → `this.plugins.get('InputManagerPlugin').on(`
- `this.input.keyboard.on(` → `this.plugins.get('InputManagerPlugin').on(`
- `this.input.gamepad.on(` → `this.plugins.get('InputManagerPlugin').on(`
- `// Add input` → `this.plugins.get('InputManagerPlugin').addInputHandler('key', handler);`

**Official Documentation**:
- [Phaser Tween Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Tweens.Tween)
- [Tween Manager](https://newdocs.phaser.io/docs/3.70.0/Phaser.Tweens.TweenManager)

**Relevant Patterns**:
```javascript
// Tween patterns
this.tweens.add({
    targets: object,
    x: 100,
    duration: 1000,
    ease: 'Power2'
});
```

**Key Steps to Integration**:
1. Create TweenManagerPlugin extending BasePlugin
2. Implement common tween patterns
3. Add easing functions
4. Integrate with UI animations

**Code Snippets**:
```javascript
class TweenManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.tweenManager = null;
    }
    
    init(data) {
        this.tweenManager = this.scene.tweens;
    }
    
    fadeIn(target, duration = 500) {
        return this.tweenManager.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    slideIn(target, fromX, toX, duration = 500) {
        target.x = fromX;
        return this.tweenManager.add({
            targets: target,
            x: toX,
            duration: duration,
            ease: 'Back.easeOut'
        });
    }
    
    bounce(target, scale = 1.2, duration = 300) {
        return this.tweenManager.add({
            targets: target,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            ease: 'Bounce.easeOut'
        });
    }
}

// Usage in scenes
this.plugins.get('TweenManagerPlugin').fadeIn(uiElement);
```

**Directions to Comment**:
- Document tween easing functions
- Comment animation timing and performance
- Explain tween chaining and sequencing

**Anti-patterns to Watch**:
- Don't create too many simultaneous tweens
- Avoid tweening properties that cause reflow
- Don't forget to stop tweens on scene cleanup

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom TweenManager
class TweenManager {
    constructor(scene) {
        this.scene = scene;
        this.tweenManager = scene.tweens;
    }
    
    fadeIn(target, duration = 500) {
        return this.tweenManager.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    slideIn(target, fromX, toX, duration = 500) {
        target.x = fromX;
        return this.tweenManager.add({
            targets: target,
            x: toX,
            duration: duration,
            ease: 'Back.easeOut'
        });
    }
}

// Usage: Direct instantiation
const tweenManager = new TweenManager(this);
tweenManager.fadeIn(uiElement);
tweenManager.slideIn(button, -100, 100);

// Plugin: TweenManagerPlugin using Phaser Tweens
class TweenManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.tweenManager = null;
    }
    
    init(data) {
        this.tweenManager = this.scene.tweens;
    }
    
    fadeIn(target, duration = 500) {
        return this.tweenManager.add({
            targets: target,
            alpha: 1,
            duration: duration,
            ease: 'Power2'
        });
    }
    
    slideIn(target, fromX, toX, duration = 500) {
        target.x = fromX;
        return this.tweenManager.add({
            targets: target,
            x: toX,
            duration: duration,
            ease: 'Back.easeOut'
        });
    }
}

// Usage: Via plugin system
this.plugins.get('TweenManagerPlugin').fadeIn(uiElement);
this.plugins.get('TweenManagerPlugin').slideIn(button, -100, 100);

// Current: Manual tween configuration
this.tweens.add({
    targets: sprite,
    x: 400,
    y: 300,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => {
        console.log('Tween complete');
    }
});

// Plugin: TweenManagerPlugin with event handling
const tween = this.plugins.get('TweenManagerPlugin').tweenManager.add({
    targets: sprite,
    x: 400,
    y: 300,
    duration: 1000,
    ease: 'Power2'
});

tween.on('complete', () => {
    console.log('Tween complete');
});

// Current: Tween chaining
tween1.on('complete', () => {
    tween2.start();
});

// Plugin: Phaser Tween chaining
const tween1 = this.plugins.get('TweenManagerPlugin').tweenManager.add({
    targets: sprite,
    x: 400,
    duration: 1000
});

const tween2 = this.plugins.get('TweenManagerPlugin').tweenManager.add({
    targets: sprite,
    y: 300,
    duration: 1000,
    delay: 1000
});

tween1.on('complete', () => {
    tween2.start();
});

// Current: Staggered animations
const targets = [sprite1, sprite2, sprite3];
targets.forEach((target, index) => {
    this.tweens.add({
        targets: target,
        alpha: 1,
        duration: 500,
        delay: index * 100
    });
});

// Plugin: Phaser Tween stagger
this.plugins.get('TweenManagerPlugin').tweenManager.add({
    targets: [sprite1, sprite2, sprite3],
    alpha: 1,
    duration: 500,
    delay: this.plugins.get('TweenManagerPlugin').tweenManager.stagger(100)
});

// Current: Tween timeline
const timeline = this.tweens.timeline({
    targets: sprite,
    ease: 'Power2',
    duration: 1000,
    tweens: [
        { x: 400 },
        { y: 300 },
        { alpha: 0 }
    ]
});

// Plugin: Phaser Timeline
const timeline = this.add.timeline([
    {
        at: 0,
        tween: { targets: sprite, x: 400 }
    },
    {
        at: 500,
        tween: { targets: sprite, y: 300 }
    },
    {
        at: 1000,
        tween: { targets: sprite, alpha: 0 }
    }
]);

timeline.play();
```

### 6. TextureManager

**Official Documentation**:
- [Phaser Texture Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Textures.Texture)
- [Texture Manager](https://newdocs.phaser.io/docs/3.70.0/Phaser.Textures.TextureManager)

**Relevant Patterns**:
```javascript
// Texture patterns
this.textures.add('key', image);
this.textures.get('key');
this.textures.remove('key');
```

**Key Steps to Integration**:
1. Create TextureManagerPlugin extending BasePlugin
2. Implement texture optimization
3. Add texture atlasing
4. Integrate with asset loading

**Code Snippets**:
```javascript
class TextureManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.textureManager = null;
        this.textureCache = new Map();
    }
    
    init(data) {
        this.textureManager = this.scene.textures;
    }
    
    loadTexture(key, source, config = {}) {
        if (this.textureCache.has(key)) {
            return this.textureCache.get(key);
        }
        
        const texture = this.textureManager.add(key, source, config);
        this.textureCache.set(key, texture);
        return texture;
    }
    
    optimizeTexture(key) {
        const texture = this.textureManager.get(key);
        if (texture) {
            // Apply texture optimization
            texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
    
    createAtlas(key, texture, data) {
        return this.textureManager.addAtlas(key, texture, data);
    }
}

// Usage in scenes
this.plugins.get('TextureManagerPlugin').loadTexture('goalIcon', 'assets/goal.png');
```

**Directions to Comment**:
- Document texture formats and optimization
- Comment atlas creation and management
- Explain texture memory management

**Anti-patterns to Watch**:
- Don't load textures without proper sizing
- Avoid loading duplicate textures
- Don't forget to dispose of unused textures

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom TextureManager
class TextureManager {
    constructor(scene) {
        this.scene = scene;
        this.textureManager = scene.textures;
        this.textureCache = new Map();
    }
    
    loadTexture(key, source, config = {}) {
        if (this.textureCache.has(key)) {
            return this.textureCache.get(key);
        }
        
        const texture = this.textureManager.add(key, source, config);
        this.textureCache.set(key, texture);
        return texture;
    }
    
    optimizeTexture(key) {
        const texture = this.textureManager.get(key);
        if (texture) {
            texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
}

// Usage: Direct instantiation
const textureManager = new TextureManager(this);
textureManager.loadTexture('goalIcon', 'assets/goal.png');
textureManager.optimizeTexture('goalIcon');

// Plugin: TextureManagerPlugin using Phaser TextureManager
class TextureManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.textureManager = null;
        this.textureCache = new Map();
    }
    
    init(data) {
        this.textureManager = this.scene.textures;
    }
    
    loadTexture(key, source, config = {}) {
        if (this.textureCache.has(key)) {
            return this.textureCache.get(key);
        }
        
        const texture = this.textureManager.add(key, source, config);
        this.textureCache.set(key, texture);
        return texture;
    }
    
    optimizeTexture(key) {
        const texture = this.textureManager.get(key);
        if (texture) {
            texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
}

// Usage: Via plugin system
this.plugins.get('TextureManagerPlugin').loadTexture('goalIcon', 'assets/goal.png');
this.plugins.get('TextureManagerPlugin').optimizeTexture('goalIcon');

// Current: Manual texture loading
this.load.image('goalIcon', 'assets/goal.png');
this.load.once('complete', () => {
    const texture = this.textures.get('goalIcon');
    // Use texture
});

// Plugin: TextureManagerPlugin with preloading
this.load.image('goalIcon', 'assets/goal.png');
this.load.once('complete', () => {
    const texture = this.plugins.get('TextureManagerPlugin').loadTexture('goalIcon', 'assets/goal.png');
    // Use texture
});

// Current: Texture atlas loading
this.load.atlas('sprites', 'assets/sprites.png', 'assets/sprites.json');

// Plugin: TextureManagerPlugin with atlas
this.load.atlas('sprites', 'assets/sprites.png', 'assets/sprites.json');
this.load.once('complete', () => {
    const atlas = this.plugins.get('TextureManagerPlugin').createAtlas('sprites', 'assets/sprites.png', 'assets/sprites.json');
});

// Current: Texture disposal
texture.destroy();

// Plugin: TextureManagerPlugin disposal
this.plugins.get('TextureManagerPlugin').disposeTexture('goalIcon');

// Current: Texture filtering
texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

// Plugin: TextureManagerPlugin filtering
this.plugins.get('TextureManagerPlugin').setFilter('goalIcon', Phaser.Textures.FilterMode.LINEAR);

// Current: Texture frame access
const frame = texture.get('frameName');

// Plugin: TextureManagerPlugin frame access
const frame = this.plugins.get('TextureManagerPlugin').getFrame('goalIcon', 'frameName');
```

---

## Phase 3: Advanced Plugins (Long-term)

### 7. CameraManager

**Official Documentation**:
- [Phaser Camera Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Cameras.Scene2D.Camera)
- [Camera Manager](https://newdocs.phaser.io/docs/3.70.0/Phaser.Cameras.Scene2D.CameraManager)

**Relevant Patterns**:
```javascript
// Camera patterns
this.cameras.main.setZoom(1.5);
this.cameras.main.pan(x, y, duration);
this.cameras.main.fadeOut(duration);
```

**Key Steps to Integration**:
1. Create CameraManagerPlugin extending BasePlugin
2. Implement camera transitions
3. Add zoom and pan controls
4. Integrate with scene system

**Code Snippets**:
```javascript
class CameraManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.cameraManager = null;
        this.cameras = new Map();
    }
    
    init(data) {
        this.cameraManager = this.scene.cameras;
        this.setupCameras();
    }
    
    setupCameras() {
        // Create additional cameras
        this.cameras.set('ui', this.cameraManager.add(0, 0, 800, 600));
        this.cameras.set('game', this.cameraManager.main);
    }
    
    transitionTo(x, y, duration = 1000) {
        return this.cameraManager.main.pan(x, y, duration);
    }
    
    zoomTo(zoom, duration = 500) {
        return this.cameraManager.main.zoomTo(zoom, duration);
    }
    
    fadeIn(duration = 500) {
        this.cameraManager.main.fadeIn(duration);
    }
    
    fadeOut(duration = 500) {
        this.cameraManager.main.fadeOut(duration);
    }
}

// Usage in scenes
this.plugins.get('CameraManagerPlugin').transitionTo(400, 300);
```

**Directions to Comment**:
- Document camera transition types
- Comment camera bounds and limits
- Explain camera layering and depth

**Anti-patterns to Watch**:
- Don't create too many cameras
- Avoid camera transitions during gameplay
- Don't forget to set camera bounds

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom CameraManager
class CameraManager {
    constructor(scene) {
        this.scene = scene;
        this.cameraManager = scene.cameras;
        this.cameras = new Map();
    }
    
    setupCameras() {
        this.cameras.set('ui', this.cameraManager.add(0, 0, 800, 600));
        this.cameras.set('game', this.cameraManager.main);
    }
    
    transitionTo(x, y, duration = 1000) {
        return this.cameraManager.main.pan(x, y, duration);
    }
    
    zoomTo(zoom, duration = 500) {
        return this.cameraManager.main.zoomTo(zoom, duration);
    }
}

// Usage: Direct instantiation
const cameraManager = new CameraManager(this);
cameraManager.setupCameras();
cameraManager.transitionTo(400, 300);

// Plugin: CameraManagerPlugin using Phaser Camera
class CameraManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.cameraManager = null;
        this.cameras = new Map();
    }
    
    init(data) {
        this.cameraManager = this.scene.cameras;
        this.setupCameras();
    }
    
    setupCameras() {
        // Create additional cameras
        this.cameras.set('ui', this.cameraManager.add(0, 0, 800, 600));
        this.cameras.set('game', this.cameraManager.main);
    }
    
    transitionTo(x, y, duration = 1000) {
        return this.cameraManager.main.pan(x, y, duration);
    }
    
    zoomTo(zoom, duration = 500) {
        return this.cameraManager.main.zoomTo(zoom, duration);
    }
}

// Usage: Via plugin system
this.plugins.get('CameraManagerPlugin').transitionTo(400, 300);
this.plugins.get('CameraManagerPlugin').zoomTo(1.5);

// Current: Manual camera setup
this.cameras.main.setZoom(1.5);
this.cameras.main.pan(400, 300, 1000);
this.cameras.main.fadeOut(500);

// Plugin: CameraManagerPlugin with fade effects
this.plugins.get('CameraManagerPlugin').fadeIn(500);
this.plugins.get('CameraManagerPlugin').fadeOut(500);

// Current: Camera bounds
this.cameras.main.setBounds(0, 0, 1600, 1200);

// Plugin: CameraManagerPlugin bounds
this.plugins.get('CameraManagerPlugin').setBounds(0, 0, 1600, 1200);

// Current: Camera shake
this.cameras.main.shake(100, 0.01);

// Plugin: CameraManagerPlugin shake
this.plugins.get('CameraManagerPlugin').shake(100, 0.01);

// Current: Camera follow
this.cameras.main.startFollow(player);

// Plugin: CameraManagerPlugin follow
this.plugins.get('CameraManagerPlugin').follow(player);
```

### 8. ParticleManager

**Official Documentation**:
- [Phaser Particle Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.Particles.ParticleEmitter)
- [Particle Manager](https://newdocs.phaser.io/docs/3.70.0/Phaser.GameObjects.Particles.ParticleEmitterManager)

**Relevant Patterns**:
```javascript
// Particle patterns
this.add.particles(x, y, texture);
this.particles.createEmitter(config);
this.particles.stop();
```

**Key Steps to Integration**:
1. Create ParticleManagerPlugin extending BasePlugin
2. Implement particle effects
3. Add particle presets
4. Integrate with visual effects

**Code Snippets**:
```javascript
class ParticleManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.particleManager = null;
        this.emitters = new Map();
    }
    
    init(data) {
        this.particleManager = this.scene.add.particles(0, 0, 'particle');
    }
    
    createEffect(key, x, y, config = {}) {
        const emitter = this.particleManager.createEmitter({
            x: x,
            y: y,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            ...config
        });
        
        this.emitters.set(key, emitter);
        return emitter;
    }
    
    playEffect(key) {
        const emitter = this.emitters.get(key);
        if (emitter) {
            emitter.start();
        }
    }
    
    stopEffect(key) {
        const emitter = this.emitters.get(key);
        if (emitter) {
            emitter.stop();
        }
    }
    
    createCelebration(x, y) {
        return this.createEffect('celebration', x, y, {
            quantity: 50,
            speed: { min: 200, max: 400 },
            scale: { start: 0.5, end: 0 },
            lifespan: 2000,
            tint: [0xff0000, 0x00ff00, 0x0000ff]
        });
    }
}

// Usage in scenes
this.plugins.get('ParticleManagerPlugin').createCelebration(400, 300);
```

**Directions to Comment**:
- Document particle effect presets
- Comment particle performance optimization
- Explain particle texture requirements

**Anti-patterns to Watch**:
- Don't create too many particle emitters
- Avoid particles with long lifespans
- Don't forget to stop emitters on cleanup

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom ParticleManager
class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.particleManager = scene.add.particles(0, 0, 'particle');
        this.emitters = new Map();
    }
    
    createEffect(key, x, y, config = {}) {
        const emitter = this.particleManager.createEmitter({
            x: x,
            y: y,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            ...config
        });
        
        this.emitters.set(key, emitter);
        return emitter;
    }
    
    playEffect(key) {
        const emitter = this.emitters.get(key);
        if (emitter) {
            emitter.start();
        }
    }
}

// Usage: Direct instantiation
const particleManager = new ParticleManager(this);
particleManager.createEffect('celebration', 400, 300);
particleManager.playEffect('celebration');

// Plugin: ParticleManagerPlugin using Phaser Particles
class ParticleManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.particleManager = null;
        this.emitters = new Map();
    }
    
    init(data) {
        this.particleManager = this.scene.add.particles(0, 0, 'particle');
    }
    
    createEffect(key, x, y, config = {}) {
        const emitter = this.particleManager.createEmitter({
            x: x,
            y: y,
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 1000,
            ...config
        });
        
        this.emitters.set(key, emitter);
        return emitter;
    }
    
    playEffect(key) {
        const emitter = this.emitters.get(key);
        if (emitter) {
            emitter.start();
        }
    }
}

// Usage: Via plugin system
this.plugins.get('ParticleManagerPlugin').createEffect('celebration', 400, 300);
this.plugins.get('ParticleManagerPlugin').playEffect('celebration');

// Current: Manual particle creation
this.add.particles(x, y, texture);
this.particles.createEmitter(config);
this.particles.stop();

// Plugin: ParticleManagerPlugin with advanced features
this.plugins.get('ParticleManagerPlugin').createEffect('explosion', x, y, {
    quantity: 50,
    speed: { min: 200, max: 400 },
    scale: { start: 0.5, end: 0 },
    lifespan: 2000,
    tint: [0xff0000, 0x00ff00, 0x0000ff]
});

// Current: Particle animation
const emitter = this.particles.createEmitter({
    frame: 'star',
    x: 400,
    y: 300,
    speed: 200,
    gravityY: 200,
    anims: {
        key: 'sparkle',
        frameRate: 10,
        repeat: -1,
        randomFrame: true,
        yoyo: true
    }
});

// Plugin: ParticleManagerPlugin with animation
this.plugins.get('ParticleManagerPlugin').createEffect('sparkle', 400, 300, {
    frame: 'star',
    speed: 200,
    gravityY: 200,
    anims: {
        key: 'sparkle',
        frameRate: 10,
        repeat: -1,
        randomFrame: true,
        yoyo: true
    }
});

// Current: Particle events
emitter.on('particledeath', (particle) => {
    console.log('Particle died');
});

// Plugin: ParticleManagerPlugin events
const emitter = this.plugins.get('ParticleManagerPlugin').createEffect('explosion', 400, 300);
emitter.on('particledeath', (particle) => {
    console.log('Particle died');
});

// Current: Particle cleanup
emitter.stop();
emitter.destroy();

// Plugin: ParticleManagerPlugin cleanup
this.plugins.get('ParticleManagerPlugin').stopEffect('explosion');
this.plugins.get('ParticleManagerPlugin').destroyEffect('explosion');
```

### 9. InputManager

**Official Documentation**:
- [Phaser Input Documentation](https://newdocs.phaser.io/docs/3.70.0/Phaser.Input.InputManager)
- [Input Events](https://newdocs.phaser.io/docs/3.70.0/Phaser.Input.Events)

**Relevant Patterns**:
```javascript
// Input patterns
this.input.on('pointerdown', callback);
this.input.keyboard.on('keydown', callback);
this.input.gamepad.on('down', callback);
```

**Key Steps to Integration**:
1. Create InputManagerPlugin extending BasePlugin
2. Implement input handling
3. Add gesture recognition
4. Integrate with UI controls

**Code Snippets**:
```javascript
class InputManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.inputManager = null;
        this.inputHandlers = new Map();
    }
    
    init(data) {
        this.inputManager = this.scene.input;
        this.setupInputHandlers();
    }
    
    setupInputHandlers() {
        // Mouse/touch input
        this.inputManager.on('pointerdown', this.handlePointerDown, this);
        this.inputManager.on('pointerup', this.handlePointerUp, this);
        
        // Keyboard input
        this.inputManager.keyboard.on('keydown', this.handleKeyDown, this);
        
        // Gamepad input
        this.inputManager.gamepad.on('down', this.handleGamepadDown, this);
    }
    
    handlePointerDown(pointer) {
        // Handle pointer down events
        this.emit('pointerDown', pointer);
    }
    
    handleKeyDown(event) {
        // Handle keyboard events
        this.emit('keyDown', event);
    }
    
    addInputHandler(key, handler) {
        this.inputHandlers.set(key, handler);
    }
    
    removeInputHandler(key) {
        this.inputHandlers.delete(key);
    }
}

// Usage in scenes
this.plugins.get('InputManagerPlugin').addInputHandler('goalClick', (pointer) => {
    // Handle goal click
});
```

**Directions to Comment**:
- Document input event types
- Comment input handling priorities
- Explain input state management

**Anti-patterns to Watch**:
- Don't create too many input handlers
- Avoid input handling in update loops
- Don't forget to remove input handlers

**Current Code → Plugin Code Mapping**:
```javascript
// Current: Custom InputManager
class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.inputManager = scene.input;
        this.inputHandlers = new Map();
    }
    
    setupInputHandlers() {
        // Mouse/touch input
        this.inputManager.on('pointerdown', this.handlePointerDown, this);
        this.inputManager.on('pointerup', this.handlePointerUp, this);
        
        // Keyboard input
        this.inputManager.keyboard.on('keydown', this.handleKeyDown, this);
        
        // Gamepad input
        this.inputManager.gamepad.on('down', this.handleGamepadDown, this);
    }
    
    addInputHandler(key, handler) {
        this.inputHandlers.set(key, handler);
    }
}

// Usage: Direct instantiation
const inputManager = new InputManager(this);
inputManager.setupInputHandlers();
inputManager.addInputHandler('goalClick', (pointer) => {
    // Handle goal click
});

// Plugin: InputManagerPlugin using Phaser Input
class InputManagerPlugin extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        this.inputManager = null;
        this.inputHandlers = new Map();
    }
    
    init(data) {
        this.inputManager = this.scene.input;
        this.setupInputHandlers();
    }
    
    setupInputHandlers() {
        // Mouse/touch input
        this.inputManager.on('pointerdown', this.handlePointerDown, this);
        this.inputManager.on('pointerup', this.handlePointerUp, this);
        
        // Keyboard input
        this.inputManager.keyboard.on('keydown', this.handleKeyDown, this);
        
        // Gamepad input
        this.inputManager.gamepad.on('down', this.handleGamepadDown, this);
    }
    
    addInputHandler(key, handler) {
        this.inputHandlers.set(key, handler);
    }
}

// Usage: Via plugin system
this.plugins.get('InputManagerPlugin').addInputHandler('goalClick', (pointer) => {
    // Handle goal click
});

// Current: Manual input handling
this.input.on('pointerdown', (pointer) => {
    console.log('Pointer down at:', pointer.x, pointer.y);
});

// Plugin: InputManagerPlugin with event handling
this.plugins.get('InputManagerPlugin').on('pointerDown', (pointer) => {
    console.log('Pointer down at:', pointer.x, pointer.y);
});

// Current: Keyboard input
this.input.keyboard.on('keydown', (event) => {
    if (event.key === 'Space') {
        console.log('Space pressed');
    }
});

// Plugin: InputManagerPlugin keyboard
this.plugins.get('InputManagerPlugin').on('keyDown', (event) => {
    if (event.key === 'Space') {
        console.log('Space pressed');
    }
});

// Current: Gamepad input
this.input.gamepad.on('down', (pad, button) => {
    console.log('Gamepad button pressed:', button.index);
});

// Plugin: InputManagerPlugin gamepad
this.plugins.get('InputManagerPlugin').on('gamepadDown', (pad, button) => {
    console.log('Gamepad button pressed:', button.index);
});

// Current: Input cleanup
this.input.off('pointerdown', callback);

// Plugin: InputManagerPlugin cleanup
this.plugins.get('InputManagerPlugin').removeInputHandler('goalClick');

// Current: Input state checking
if (this.input.isOver) {
    console.log('Mouse over game');
}

// Plugin: InputManagerPlugin state
if (this.plugins.get('InputManagerPlugin').isOver) {
    console.log('Mouse over game');
});

// Current: Pixel perfect input
sprite.setInteractive({ pixelPerfect: true });

// Plugin: InputManagerPlugin pixel perfect
this.plugins.get('InputManagerPlugin').setPixelPerfect(sprite, true);
```

---

## Plugin Integration Checklist

### Pre-Integration
- [ ] Review official Phaser documentation
- [ ] Identify current system patterns
- [ ] Plan data migration strategy
- [ ] Set up testing framework

### During Integration
- [ ] Create plugin class extending BasePlugin
- [ ] Implement lifecycle methods
- [ ] Migrate existing functionality
- [ ] Add proper error handling
- [ ] Update scene references

### Post-Integration
- [ ] Test plugin functionality
- [ ] Update documentation
- [ ] Remove old system code
- [ ] Performance testing
- [ ] Memory leak testing

### Maintenance
- [ ] Monitor plugin performance
- [ ] Update plugin dependencies
- [ ] Document plugin changes
- [ ] Test plugin compatibility

---

## Common Anti-Patterns to Avoid

### Memory Management
- Don't store references to scene objects in global plugins
- Always clean up event listeners in destroy()
- Don't create circular references between plugins

### Performance
- Avoid expensive operations in plugin init()
- Don't create too many plugin instances
- Use object pooling for frequently created objects

### Architecture
- Don't bypass plugin system for direct access
- Avoid tight coupling between plugins
- Don't create plugins that depend on specific scenes

### Testing
- Don't test plugins in isolation
- Always test plugin integration with scenes
- Don't forget to test plugin cleanup

---

## Plugin Development Best Practices

### Code Organization
- Keep plugin logic focused and single-purpose
- Use clear, descriptive method names
- Document all public methods and properties

### Error Handling
- Implement proper error handling for all operations
- Log errors with context information
- Provide fallback behavior for critical operations

### Performance
- Optimize for common use cases
- Use efficient data structures
- Minimize memory allocations

### Testing
- Write unit tests for plugin functionality
- Test plugin integration with scenes
- Test plugin cleanup and memory management

## Migration Summary

### Complete File Inventory

**Files to Create (9 new plugins):**
- `src/plugins/BasePlugin.js`
- `src/plugins/DataManagerPlugin.js`
- `src/plugins/EventManagerPlugin.js`
- `src/plugins/DebugPlugin.js`
- `src/plugins/AudioManagerPlugin.js`
- `src/plugins/TweenManagerPlugin.js`
- `src/plugins/TextureManagerPlugin.js`
- `src/plugins/CameraManagerPlugin.js`
- `src/plugins/ParticleManagerPlugin.js`
- `src/plugins/InputManagerPlugin.js`

**Files to Modify (15+ files):**
- `src/main.js` - Game configuration and plugin registration
- `src/managers/StateManager.js` - **DEPRECATE** (keep for compatibility)
- `src/utils/EventManager.js` - **DEPRECATE** (keep for compatibility)
- `src/utils/DebugTools.js` - **DEPRECATE** (keep for compatibility)
- `src/scenes/MainMenuScene.js` - Update all system access patterns
- `src/scenes/BingoGridScene.js` - Update all system access patterns
- `src/scenes/GoalLibraryScene.js` - Update all system access patterns
- `src/scenes/RewardsScene.js` - Update all system access patterns
- `src/scenes/PreloadScene.js` - Add asset loading for new plugins
- `src/components/BingoCell.js` - Update all system access patterns
- `src/components/GoalCard.js` - Update all system access patterns
- `src/components/AddGoalModal.js` - Update all system access patterns

### Migration Timeline

**Phase 1 (Week 1-2): Critical Plugins**
- Day 1-2: StateManager → DataManagerPlugin
- Day 3-4: EventManager → EventEmitter
- Day 5-6: DebugTools → Debug Plugin
- Day 7-10: Testing and validation

**Phase 2 (Week 3-4): Enhancement Plugins**
- Day 11-13: AudioManager
- Day 14-16: TweenManager
- Day 17-19: TextureManager
- Day 20-24: Testing and validation

**Phase 3 (Week 5-6): Advanced Plugins**
- Day 25-27: CameraManager
- Day 28-30: ParticleManager
- Day 31-33: InputManager
- Day 34-42: Testing and validation

### Testing Strategy

**Unit Tests:**
- Test each plugin individually
- Test plugin lifecycle methods
- Test plugin error handling

**Integration Tests:**
- Test plugin interactions
- Test scene integration
- Test component integration

**Performance Tests:**
- Test memory usage
- Test performance impact
- Test hot reload functionality

**User Acceptance Tests:**
- Test all game functionality
- Test user interactions
- Test cross-browser compatibility

### Rollback Plan

**If Issues Occur:**
1. Revert to previous git commit
2. Restore original system files
3. Update import statements
4. Test basic functionality
5. Document issues for future reference

**Emergency Recovery:**
- Keep original files as `.backup` extensions
- Maintain compatibility adapters
- Document all changes for easy rollback

This plugin conversion strategy provides a comprehensive roadmap for migrating from custom systems to proper Phaser plugins, ensuring better maintainability, performance, and alignment with Phaser best practices.
