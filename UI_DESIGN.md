# Goal Bingo - UI Design Document

## 1. Overall Layout

### Main Application Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Header/Navigation                     │
│  [Grid Size: 2x2 ▼] [Settings] [Stats] [Help]          │
├─────────────────────────────────────────────────────────┤
│  Goal Library Panel  │  Bingo Grid Panel  │  Rewards Panel │
│  (Left Sidebar)      │  (Center)          │  (Right Sidebar)│
│                      │                    │                │
│  - Goal List         │  - Flexible Grid   │  - Reward List  │
│  - Add Goal Form     │  - Goal Cards      │  - Add Reward   │
│  - State Filters     │  - Win Detection   │  - Claim Modal  │
│  - Category Filters  │  - Animations      │  - History      │
│  - Tag Management    │  - Size Controls   │                │
└─────────────────────────────────────────────────────────┘
```

## 2. Goal Library Panel (Left Sidebar)

### 2.1 Goal List Section
```html
<div class="goal-library">
  <div class="library-header">
    <h3>Goal Library</h3>
    <div class="goal-stats">
      <span class="stat">To-Do: <span id="todo-count">0</span></span>
      <span class="stat">In-Play: <span id="inplay-count">0</span></span>
      <span class="stat">Completed: <span id="completed-count">0</span></span>
    </div>
  </div>
  
  <div class="goal-filters">
    <div class="filter-group">
      <button class="filter-btn active" data-state="all">All</button>
      <button class="filter-btn" data-state="to-do">To-Do</button>
      <button class="filter-btn" data-state="in-play">In-Play</button>
      <button class="filter-btn" data-state="completed">Completed</button>
    </div>
    <div class="category-filters">
      <select id="category-filter" multiple>
        <option value="health">Health</option>
        <option value="hobbies">Hobbies</option>
        <option value="study">Study</option>
        <option value="skills">Skills</option>
      </select>
    </div>
  </div>
  
  <div class="goal-list" id="goal-list">
    <!-- Dynamic goal items -->
  </div>
</div>
```

### 2.2 Individual Goal Item
```html
<div class="goal-item" data-goal-id="123" data-state="to-do">
  <div class="goal-content">
    <div class="goal-text">Exercise for 30 minutes</div>
    <div class="goal-meta">
      <div class="goal-categories">
        <span class="category-tag health">Health</span>
        <span class="category-tag fitness">Fitness</span>
      </div>
      <div class="goal-settings">
        <span class="renewable-badge renewable">Renewable</span>
        <span class="cooldown-info">24h cooldown</span>
      </div>
      <span class="goal-date">Created: Dec 9, 2025</span>
    </div>
  </div>
  <div class="goal-actions">
    <button class="action-btn edit-btn" title="Edit Goal">✏️</button>
    <button class="action-btn delete-btn" title="Delete Goal">🗑️</button>
  </div>
  <div class="goal-state-indicator">
    <span class="state-badge to-do">To-Do</span>
  </div>
</div>
```

### 2.3 Add Goal Form
```html
<div class="add-goal-form">
  <h4>Add New Goal</h4>
  <form id="add-goal-form">
    <input type="text" id="goal-text" placeholder="Enter your goal..." required>
    
    <div class="form-group">
      <label>Categories (select multiple):</label>
      <div class="category-checkboxes">
        <label><input type="checkbox" value="health"> Health</label>
        <label><input type="checkbox" value="hobbies"> Hobbies</label>
        <label><input type="checkbox" value="study"> Study</label>
        <label><input type="checkbox" value="skills"> Skills</label>
      </div>
      <input type="text" id="custom-category" placeholder="Add custom category...">
    </div>
    
    <div class="form-group">
      <label>Goal Type:</label>
      <label><input type="radio" name="goal-type" value="renewable" checked> Renewable</label>
      <label><input type="radio" name="goal-type" value="one-off"> One-off</label>
    </div>
    
    <div class="form-group" id="cooldown-group">
      <label>Cooldown Period (hours):</label>
      <select id="cooldown-period">
        <option value="1">1 hour</option>
        <option value="6">6 hours</option>
        <option value="12">12 hours</option>
        <option value="24" selected>24 hours</option>
        <option value="48">48 hours</option>
        <option value="168">1 week</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Difficulty (optional):</label>
      <select id="goal-difficulty">
        <option value="">None</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
    
    <button type="submit" class="btn btn-primary">Add Goal</button>
  </form>
</div>
```

## 3. Bingo Grid Panel (Center)

### 3.1 Main Grid Container
```html
<div class="bingo-container">
  <div class="grid-header">
    <h2>Goal Bingo</h2>
    <div class="grid-size-controls">
      <label>Grid Size:</label>
      <select id="grid-size-selector">
        <option value="2">2x2</option>
        <option value="3">3x3</option>
        <option value="4">4x4</option>
        <option value="5" selected>5x5</option>
        <option value="6">6x6</option>
        <option value="7">7x7</option>
        <option value="8">8x8</option>
        <option value="9">9x9</option>
        <option value="10">10x10</option>
      </select>
    </div>
    <div class="game-stats">
      <span class="stat">Wins: <span id="win-count">0</span></span>
      <span class="stat">Streak: <span id="streak-count">0</span></span>
    </div>
  </div>
  
  <div class="bingo-grid" id="bingo-grid" data-size="5">
    <!-- Dynamic grid will be generated here -->
  </div>
  
  <div class="grid-controls">
    <button id="new-game-btn" class="btn btn-secondary">New Game</button>
    <button id="shuffle-btn" class="btn btn-secondary">Shuffle Goals</button>
  </div>
</div>
```

### 3.2 Individual Grid Cell
```html
<div class="grid-cell" data-row="0" data-col="0" data-goal-id="123">
  <div class="goal-card">
    <div class="goal-text">Exercise for 30 minutes</div>
    <div class="goal-categories">
      <span class="category-tag health">Health</span>
      <span class="category-tag fitness">Fitness</span>
    </div>
    <div class="goal-difficulty easy">Easy</div>
    <div class="completion-indicator">
      <button class="complete-btn">✓</button>
    </div>
  </div>
</div>
```

### 3.3 Win Animation Overlay
```html
<div class="win-overlay" id="win-overlay">
  <div class="win-message">
    <h2>🎉 BINGO! 🎉</h2>
    <p>You completed a <span id="win-pattern">row</span>!</p>
    <div class="reward-selection">
      <h3>Choose Your Reward:</h3>
      <div class="reward-options" id="reward-options">
        <!-- Dynamic reward options - single selection -->
      </div>
      <p class="reward-note">You can only claim one reward per bingo.</p>
    </div>
    <button class="btn btn-primary" id="claim-reward-btn">Claim Reward</button>
  </div>
</div>
```

## 4. Rewards Panel (Right Sidebar)

### 4.1 Rewards List Section
```html
<div class="rewards-panel">
  <div class="rewards-header">
    <h3>Rewards</h3>
    <button id="add-reward-btn" class="btn btn-small">+ Add Reward</button>
  </div>
  
  <div class="rewards-list" id="rewards-list">
    <!-- Dynamic reward items -->
  </div>
  
  <div class="rewards-history">
    <h4>Recent Rewards</h4>
    <div class="history-list" id="rewards-history">
      <!-- Claimed rewards history -->
    </div>
  </div>
</div>
```

### 4.2 Individual Reward Item
```html
<div class="reward-item" data-reward-id="456">
  <div class="reward-content">
    <div class="reward-description">Watch a movie</div>
    <div class="reward-category">Entertainment</div>
    <div class="reward-status">
      <span class="status-badge available">Available</span>
    </div>
  </div>
  <div class="reward-actions">
    <button class="action-btn edit-btn" title="Edit Reward">✏️</button>
    <button class="action-btn delete-btn" title="Delete Reward">🗑️</button>
  </div>
</div>
```

### 4.3 Add Reward Form
```html
<div class="add-reward-form">
  <h4>Add New Reward</h4>
  <form id="add-reward-form">
    <input type="text" id="reward-description" placeholder="Describe your reward..." required>
    <select id="reward-category">
      <option value="entertainment">Entertainment</option>
      <option value="treat">Treat</option>
      <option value="experience">Experience</option>
      <option value="purchase">Purchase</option>
      <option value="other">Other</option>
    </select>
    <button type="submit" class="btn btn-primary">Add Reward</button>
  </form>
</div>
```

## 5. Responsive Design

### 5.1 Desktop Layout (1200px+)
- Three-column layout with sidebars
- Full feature set visible
- Hover effects and animations

### 5.2 Tablet Layout (768px - 1199px)
- Collapsible sidebars
- Grid remains prominent
- Touch-friendly interactions

### 5.3 Mobile Layout (< 768px)
- Single-column stacked layout
- Tabbed interface for panels
- Swipe gestures for navigation
- Simplified grid (3x3 or 4x4)

## 6. Visual Design System

### 6.1 Color Palette
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #4CAF50;
  --warning-color: #FF9800;
  --error-color: #F44336;
  --background-color: #f8f9fa;
  --surface-color: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e9ecef;
}
```

### 6.2 Typography
- **Headers**: 'Segoe UI', system fonts, 24px-32px
- **Body**: 'Segoe UI', system fonts, 14px-16px
- **Labels**: 'Segoe UI', system fonts, 12px-14px

### 6.3 Spacing System
- **Small**: 8px
- **Medium**: 16px
- **Large**: 24px
- **Extra Large**: 32px

## 7. Interactive States

### 7.1 Goal States
- **To-Do**: Gray background, inactive appearance
- **In-Play**: Blue accent, active appearance
- **Completed**: Green background, checkmark visible

### 7.2 Hover States
- Subtle elevation and color changes
- Smooth transitions (0.3s ease)
- Visual feedback for interactive elements

### 7.3 Loading States
- Skeleton screens for data loading
- Spinner animations for actions
- Progress indicators for long operations

## 8. Accessibility Features

### 8.1 Keyboard Navigation
- Tab order through all interactive elements
- Enter/Space for button activation
- Arrow keys for grid navigation

### 8.2 Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content

### 8.3 Visual Accessibility
- High contrast mode support
- Scalable text and elements
- Color-blind friendly palette

---

*Document Version: 1.0*  
*Last Updated: December 9, 2025*  
*Next Review: [To be scheduled]*
