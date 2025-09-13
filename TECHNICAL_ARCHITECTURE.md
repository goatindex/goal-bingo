# Goal Bingo - Technical Architecture

## 1. Technology Stack Decisions

### 1.1 Frontend Framework
**Phaser.js 3.x** - 2D game framework
- **Why**: Perfect for interactive bingo grid, smooth animations, particle effects
- **Bundle Size**: ~200KB (gzipped)
- **Performance**: Excellent for 2D games and interactive UIs
- **Learning Curve**: Moderate (well-documented)
- **Community**: Large, active community

### 1.2 State Management
**Centralized State with Event-Driven Updates**
- **Pattern**: Single ApplicationState object with event system
- **Benefits**: Predictable, debuggable, testable
- **Implementation**: Custom event emitter + immutable state updates

### 1.3 Persistence
**Local Storage with Backup System**
- **Primary**: localStorage API
- **Backup**: Automatic backup to localStorage backup key
- **Export/Import**: JSON file download/upload
- **Recovery**: Automatic fallback to backup or defaults

### 1.4 UI Layout
**Responsive Three-Panel Layout**
- **Desktop**: Side-by-side panels (Goal Library | Bingo Grid | Rewards)
- **Tablet**: Collapsible sidebars
- **Mobile**: Tabbed interface

## 2. Phaser.js Integration Architecture

### 2.1 Phaser Scene Structure
```javascript
// Main game scenes
class BootScene extends Phaser.Scene {
    // Initialize game settings, load assets
}

class PreloadScene extends Phaser.Scene {
    // Load all game assets (sprites, sounds, fonts)
}

class MainMenuScene extends Phaser.Scene {
    // Main menu with navigation to different panels
}

class GoalLibraryScene extends Phaser.Scene {
    // Goal management interface
}

class BingoGridScene extends Phaser.Scene {
    // Interactive bingo grid
}

class RewardsScene extends Phaser.Scene {
    // Reward management interface
}
```

### 2.2 Phaser Game Configuration
```javascript
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#f8f9fa',
    scene: [BootScene, PreloadScene, MainMenuScene, GoalLibraryScene, BingoGridScene, RewardsScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 320, height: 240 },
        max: { width: 1920, height: 1080 }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};
```

### 2.3 Phaser UI Components
```javascript
// Custom UI components for Phaser
class GoalCard extends Phaser.GameObjects.Container {
    // Interactive goal card with animations
}

class BingoCell extends Phaser.GameObjects.Container {
    // Interactive bingo grid cell
}

class RewardButton extends Phaser.GameObjects.Container {
    // Interactive reward selection button
}

class SaveIndicator extends Phaser.GameObjects.Text {
    // Animated save status indicator
}
```

## 3. State Management with Phaser

### 3.1 Centralized State Manager
```javascript
class StateManager {
    constructor() {
        this.state = new ApplicationState();
        this.eventEmitter = new Phaser.Events.EventEmitter();
        this.storageManager = new StorageManager();
    }

    // State update methods
    updateGoal(goalId, updates) {
        const goal = this.state.goalLibrary.find(g => g.id === goalId);
        if (goal) {
            Object.assign(goal, updates);
            this.eventEmitter.emit('goalUpdated', goal);
            this.markDirty();
        }
    }

    // Event emission
    emit(event, data) {
        this.eventEmitter.emit(event, data);
    }

    // Event subscription
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
}
```

### 3.2 Event-Driven Updates
```javascript
// In BingoGridScene
this.stateManager.on('goalCompleted', (goal) => {
    this.animateGoalCompletion(goal);
    this.checkForWins();
});

this.stateManager.on('winDetected', (winPattern) => {
    this.showWinAnimation(winPattern);
    this.showRewardSelection();
});

this.stateManager.on('dataChanged', () => {
    this.updateSaveIndicator();
});
```

## 4. Phaser-Specific Features

### 4.1 Animations and Effects
```javascript
// Goal completion animation
animateGoalCompletion(goal) {
    const cell = this.getCellByGoalId(goal.id);
    const tween = this.tweens.add({
        targets: cell,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
    });
}

// Win celebration animation
showWinAnimation(winPattern) {
    // Particle effects
    this.add.particles(400, 300, 'sparkle', {
        speed: { min: 100, max: 200 },
        scale: { start: 0.5, end: 0 },
        lifespan: 1000
    });

    // Screen shake
    this.cameras.main.shake(500, 0.01);
}
```

### 4.2 Interactive Elements
```javascript
// Bingo cell interaction
createBingoCell(x, y, goal) {
    const cell = new BingoCell(this, x, y, goal);
    
    cell.setInteractive();
    cell.on('pointerdown', () => {
        this.toggleGoal(goal.id);
    });
    
    cell.on('pointerover', () => {
        cell.setTint(0xcccccc);
    });
    
    cell.on('pointerout', () => {
        cell.clearTint();
    });
    
    return cell;
}
```

### 4.3 Responsive Design
```javascript
// Handle window resize
onWindowResize() {
    this.scale.refresh();
    this.repositionUI();
}

// Reposition UI elements based on screen size
repositionUI() {
    if (this.scale.width < 768) {
        this.showMobileLayout();
    } else {
        this.showDesktopLayout();
    }
}
```

## 5. Data Flow with Phaser

### 5.1 Scene Communication
```javascript
// Scene data passing
this.scene.start('BingoGridScene', { 
    gameState: this.stateManager.state.gameState 
});

// Scene events
this.scene.get('BingoGridScene').events.on('goalCompleted', (goal) => {
    this.updateGoalLibrary(goal);
});
```

### 5.2 Asset Management
```javascript
// Preload assets
preload() {
    this.load.image('goal-card', 'assets/images/goal-card.png');
    this.load.image('reward-icon', 'assets/images/reward-icon.png');
    this.load.audio('win-sound', 'assets/audio/win.mp3');
    this.load.atlas('ui-elements', 'assets/atlas/ui-elements.png', 'assets/atlas/ui-elements.json');
}
```

## 6. Performance Considerations

### 6.1 Phaser Optimization
```javascript
// Object pooling for frequently created/destroyed objects
class GoalCardPool {
    constructor(scene, maxSize = 50) {
        this.scene = scene;
        this.pool = [];
        this.maxSize = maxSize;
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return new GoalCard(this.scene);
    }

    release(card) {
        if (this.pool.length < this.maxSize) {
            card.reset();
            this.pool.push(card);
        } else {
            card.destroy();
        }
    }
}
```

### 6.2 Memory Management
```javascript
// Cleanup on scene shutdown
shutdown() {
    this.stateManager.off('goalCompleted');
    this.stateManager.off('winDetected');
    this.goalCardPool.releaseAll();
    this.tweens.killAll();
}
```

## 7. Build and Development Setup

### 7.1 Package.json
```json
{
  "name": "goal-bingo",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.70.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 7.2 Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

## 8. Implementation Phases

### 8.1 Phase 1: Phaser Setup & Basic UI
- Phaser game initialization
- Basic scene structure
- Simple goal card rendering
- Basic state management

### 8.2 Phase 2: Interactive Bingo Grid
- Bingo grid rendering
- Goal card interactions
- Win detection logic
- Basic animations

### 8.3 Phase 3: Goal Library & Rewards
- Goal management interface
- Reward system
- Data persistence
- Advanced animations

### 8.4 Phase 4: Polish & Optimization
- Performance optimization
- Responsive design
- Error handling
- Testing

## 9. Phaser-Specific Benefits

### 9.1 Game-Like Interactions
- Smooth animations and transitions
- Particle effects for wins
- Screen shake and visual feedback
- Sound effects and music

### 9.2 Performance
- Hardware-accelerated rendering
- Efficient sprite management
- Built-in tweening system
- Object pooling support

### 9.3 Cross-Platform
- Works on desktop, tablet, mobile
- Touch and mouse input
- Responsive scaling
- WebGL and Canvas fallback

## 10. Migration Path

### 10.1 From Vanilla JS to Phaser
- Keep existing data models
- Replace DOM manipulation with Phaser objects
- Convert CSS animations to Phaser tweens
- Maintain same state management

### 10.2 Future Enhancements
- Add more game mechanics
- Implement multiplayer features
- Add more visual effects
- Create mobile app versions

---

*Document Version: 1.0*  
*Last Updated: December 9, 2025*  
*Next Review: [To be scheduled]*

