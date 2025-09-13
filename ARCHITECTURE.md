# Goal Bingo - Architecture Document

## 1. System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Goal Bingo App                       │
├─────────────────────────────────────────────────────────┤
│  Presentation Layer (HTML/CSS/JS)                      │
│  ├── Goal Library UI (List, Add/Edit, State Filters)   │
│  ├── Bingo Grid UI (Dynamic Grid, Goal Cards)          │
│  ├── Rewards UI (Reward List, Selection Modal)         │
│  └── Visual Feedback (Animations, Notifications)       │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer (JavaScript Classes)             │
│  ├── GoalBingo (Main Controller)                       │
│  ├── GoalLibrary (Goal CRUD & State Management)        │
│  ├── BingoGrid (Grid Population & Management)          │
│  ├── RewardManager (Reward CRUD & Selection)           │
│  ├── GameEngine (Row/Column Detection & Repopulation)  │
│  └── StorageManager (Data Persistence)                 │
├─────────────────────────────────────────────────────────┤
│  Data Layer (LocalStorage)                             │
│  ├── Goal Library (Goals with States & Timestamps)     │
│  ├── Rewards List (User-defined Rewards)               │
│  ├── Game State (Current Grid, Progress)               │
│  └── Achievement History (Completed Rewards)           │
└─────────────────────────────────────────────────────────┘
```

## 2. Core Components

### 2.1 GoalBingo (Main Controller)
**Responsibility**: Application orchestration and coordination
```javascript
class GoalBingo {
    constructor() {
        this.goalLibrary = new GoalLibrary();
        this.bingoGrid = new BingoGrid();
        this.rewardManager = new RewardManager();
        this.gameEngine = new GameEngine();
        this.storageManager = new StorageManager();
        this.uiManager = new UIManager();
    }
}
```

**Key Methods**:
- `init()` - Initialize application and load data
- `startNewGame()` - Initialize new bingo grid
- `handleGoalCompletion()` - Process goal completion and check for wins
- `handleRewardSelection()` - Process reward selection after win
- `repopulateGrid()` - Fill empty grid slots with new goals

### 2.2 GoalLibrary
**Responsibility**: Goal library management and state tracking
```javascript
class GoalLibrary {
    constructor() {
        this.goals = [];
        this.goalStates = {
            TODO: 'to-do',
            IN_PLAY: 'in-play', 
            COMPLETED: 'completed'
        };
    }
}
```

**Key Methods**:
- `addGoal(text, category)` - Add new goal to library
- `updateGoal(id, updates)` - Update existing goal
- `deleteGoal(id)` - Remove goal from library
- `getGoalsByState(state)` - Filter goals by state (to-do, in-play, completed)
- `moveGoalToInPlay(id)` - Move goal from to-do to in-play
- `completeGoal(id)` - Mark goal as completed with timestamp
- `getAvailableGoals()` - Get goals available for grid population

### 2.3 BingoGrid
**Responsibility**: Grid management and goal population
```javascript
class BingoGrid {
    constructor(gridSize = 5) {
        this.gridSize = gridSize; // 2x2 to 10x10
        this.grid = [];
        this.emptySlots = [];
        this.minSize = 2;
        this.maxSize = 10;
    }
}
```

**Key Methods**:
- `setGridSize(size)` - Set grid size (2x2 to 10x10)
- `populateGrid(availableGoals)` - Fill grid with random goals from library
- `getEmptySlots()` - Get positions of empty grid slots
- `fillEmptySlots(goals)` - Fill empty slots with new goals
- `getGridState()` - Get current grid state
- `clearCompletedRow(row)` - Clear goals from completed row
- `clearCompletedColumn(col)` - Clear goals from completed column
- `clearCompletedDiagonal(diagonal)` - Clear goals from completed diagonal

### 2.4 RewardManager
**Responsibility**: Reward management and selection
```javascript
class RewardManager {
    constructor() {
        this.rewards = [];
        this.claimedRewards = [];
    }
}
```

**Key Methods**:
- `addReward(description, category)` - Add new reward to list
- `updateReward(id, updates)` - Update existing reward
- `deleteReward(id)` - Remove reward from list
- `selectReward(rewardId)` - Claim a reward after bingo completion
- `getAvailableRewards()` - Get unclaimed rewards
- `getRewardHistory()` - Get history of claimed rewards

### 2.5 GameEngine
**Responsibility**: Game logic and win detection
```javascript
class GameEngine {
    constructor(gridSize = 5) {
        this.gridSize = gridSize;
        this.winPatterns = this.initializeWinPatterns();
    }
}
```

**Key Methods**:
- `checkForWins(grid)` - Check for completed rows/columns/diagonals
- `getCompletedRows(grid)` - Get list of completed rows
- `getCompletedColumns(grid)` - Get list of completed columns
- `getCompletedDiagonals(grid)` - Get list of completed diagonals
- `processWin(completedPatterns)` - Handle win processing (single reward)
- `repopulateAfterWin(grid, completedPatterns)` - Fill cleared slots

### 2.4 StorageManager
**Responsibility**: Data persistence, autosave, and data recovery
```javascript
class StorageManager {
    constructor() {
        this.storageKey = 'goal-bingo-data';
        this.autosaveInterval = 30000; // 30 seconds
        this.lastSaveTime = null;
        this.isDirty = false;
        this.autosaveTimer = null;
    }
}
```

**Key Methods**:
- `saveAllData()` - Save complete application state
- `loadAllData()` - Load complete application state
- `startAutosave()` - Start automatic saving
- `stopAutosave()` - Stop automatic saving
- `markDirty()` - Mark data as changed (triggers autosave)
- `exportData()` - Export data for backup
- `importData(data)` - Import data from backup
- `validateData(data)` - Validate loaded data integrity
- `recoverData()` - Attempt data recovery if corruption detected

### 2.5 UIManager
**Responsibility**: DOM manipulation and user interactions
```javascript
class UIManager {
    constructor() {
        this.gridElement = document.querySelector('.bingo-grid');
        this.controlsElement = document.querySelector('.controls');
    }
}
```

**Key Methods**:
- `renderGrid(goals)` - Render bingo grid
- `updateGoalCard(goal)` - Update individual goal card
- `showBingoMessage(patterns)` - Display bingo notification
- `showAddGoalModal()` - Show goal creation modal

## 3. Data Models

### 3.1 Goal Model
```javascript
class Goal {
    constructor(id, text, categories = [], state = 'to-do', isRenewable = true) {
        this.id = id;
        this.text = text;
        this.categories = categories; // Array of category strings
        this.state = state; // 'to-do', 'in-play', 'completed'
        this.isRenewable = isRenewable; // true for renewable, false for one-off
        this.cooldownPeriod = isRenewable ? 24 : null; // hours until can be reused
        this.lastCompletedAt = null; // When last completed (for cooldown)
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard' (optional)
        this.createdAt = new Date();
        this.movedToInPlayAt = null;
        this.completedAt = null;
        this.gridPosition = null; // Position in current grid (if in-play)
    }
}
```

### 3.2 Reward Model
```javascript
class Reward {
    constructor(id, description, category = 'general', claimed = false) {
        this.id = id;
        this.description = description;
        this.category = category;
        this.claimed = claimed;
        this.createdAt = new Date();
        this.claimedAt = null;
        this.claimedFor = null; // Which bingo completion this was claimed for
    }
}
```

### 3.3 BingoWin Model
```javascript
class BingoWin {
    constructor(id, pattern, timestamp, rewardId = null) {
        this.id = id;
        this.pattern = pattern; // 'row', 'column', 'diagonal'
        this.patternIndex = null; // Which row/column/diagonal (0-based)
        this.timestamp = timestamp;
        this.rewardId = rewardId; // ID of claimed reward (single reward)
        this.goalsCleared = []; // Array of goal IDs that were cleared
        this.gridSize = 5; // Size of grid when win occurred
    }
}
```

### 3.4 GameState Model
```javascript
class GameState {
    constructor() {
        this.gridSize = 5; // Current grid size (2-10)
        this.currentGrid = [];
        this.activeGoals = []; // Goals currently in the grid
        this.totalWins = 0;
        this.currentStreak = 0;
        this.lastWinAt = null;
        this.gameStartedAt = new Date();
        this.preferredGridSize = 5; // User's preferred grid size
        this.lastSaveTime = null; // When data was last saved
        this.sessionId = this.generateSessionId(); // Unique session identifier
    }
}
```

### 3.5 ApplicationState Model
```javascript
class ApplicationState {
    constructor() {
        this.version = '1.0.0'; // App version for data migration
        this.lastModified = new Date();
        this.gameState = new GameState();
        this.goalLibrary = [];
        this.rewards = [];
        this.categories = [];
        this.settings = {
            autosaveEnabled: true,
            autosaveInterval: 30000, // 30 seconds
            showSaveIndicator: true,
            backupEnabled: true
        };
        this.metadata = {
            totalPlayTime: 0,
            totalGoalsCompleted: 0,
            totalRewardsClaimed: 0,
            lastBackup: null
        };
    }
}
```

### 3.5 Category Model
```javascript
class Category {
    constructor(id, name, color = '#667eea', isPredefined = false) {
        this.id = id;
        this.name = name;
        this.color = color; // Hex color for UI display
        this.isPredefined = isPredefined; // true for system categories
        this.createdAt = new Date();
        this.goalCount = 0; // Number of goals using this category
    }
}

## 4. Design Patterns

### 4.1 Observer Pattern
**Use Case**: Goal state changes and UI updates
```javascript
class GoalObserver {
    update(goal) {
        // Update UI when goal changes
    }
}
```

### 4.2 Strategy Pattern
**Use Case**: Different bingo pattern detection algorithms
```javascript
class BingoStrategy {
    checkPattern(goals) {
        throw new Error('Must implement checkPattern');
    }
}

class RowBingoStrategy extends BingoStrategy {
    checkPattern(goals) {
        // Check for completed rows
    }
}
```

### 4.3 Factory Pattern
**Use Case**: Creating different types of goals and patterns
```javascript
class GoalFactory {
    static createGoal(type, data) {
        switch(type) {
            case 'daily': return new DailyGoal(data);
            case 'weekly': return new WeeklyGoal(data);
            default: return new Goal(data);
        }
    }
}
```

## 5. State Management

### 5.1 Application State
```javascript
const AppState = {
    goals: [],
    completedPatterns: [],
    currentBingoCount: 0,
    userPreferences: {
        theme: 'default',
        notifications: true,
        autoSave: true
    },
    ui: {
        showAddModal: false,
        selectedGoal: null,
        isAnimating: false
    }
};
```

### 5.2 State Updates
- **Immutable Updates**: Use spread operator for state changes
- **Single Source of Truth**: Centralized state management
- **Predictable Updates**: Clear state transition rules

## 6. Performance Considerations

### 6.1 Rendering Optimization
- **Virtual Scrolling**: For large goal lists (future)
- **Debounced Updates**: Prevent excessive re-renders
- **CSS Transforms**: Hardware-accelerated animations

### 6.2 Memory Management
- **Event Listener Cleanup**: Remove listeners on component destruction
- **Object Pooling**: Reuse DOM elements where possible
- **Lazy Loading**: Load non-critical features on demand

### 6.3 Storage Optimization
- **Data Compression**: Minimize localStorage usage
- **Incremental Updates**: Only save changed data
- **Cleanup Old Data**: Remove outdated achievements

## 7. Security Considerations

### 7.1 Data Validation
- **Input Sanitization**: Prevent XSS attacks
- **Data Type Validation**: Ensure data integrity
- **Size Limits**: Prevent storage abuse

### 7.2 Local Storage Security
- **No Sensitive Data**: Only store non-sensitive goal data
- **Data Encryption**: Consider encrypting stored data (future)
- **Backup Validation**: Verify imported data integrity

## 8. Testing Strategy

### 8.1 Unit Testing
- **Component Testing**: Test individual classes and methods
- **Mock Dependencies**: Use mocks for external dependencies
- **Edge Cases**: Test boundary conditions and error states

### 8.2 Integration Testing
- **User Flows**: Test complete user workflows
- **Data Persistence**: Test storage and retrieval
- **Cross-Browser**: Test compatibility across browsers

### 8.3 Performance Testing
- **Load Testing**: Test with large datasets
- **Memory Leaks**: Monitor memory usage over time
- **Rendering Performance**: Measure frame rates and response times

## 9. Deployment Architecture

### 9.1 Build Process
```
Source Code → Vite Build → Optimized Bundle → Static Hosting
```

### 9.2 Hosting Strategy
- **Static Hosting**: GitHub Pages or Netlify
- **CDN**: CloudFlare for global distribution
- **HTTPS**: SSL certificate for security

### 9.3 Environment Configuration
```javascript
const config = {
    development: {
        debug: true,
        apiUrl: 'http://localhost:3000'
    },
    production: {
        debug: false,
        apiUrl: 'https://api.goalbingo.com'
    }
};
```

## 10. Future Architecture Considerations

### 10.1 Scalability
- **Microservices**: Break into smaller services as needed
- **Database Migration**: Move from localStorage to proper database
- **API Layer**: Add RESTful API for data management

### 10.2 Feature Extensions
- **Plugin Architecture**: Support for custom goal types
- **Real-time Updates**: WebSocket integration for live collaboration
- **Mobile Apps**: React Native or Flutter for native apps

---

*Document Version: 1.0*  
*Last Updated: December 9, 2025*  
*Next Review: [To be scheduled]*
