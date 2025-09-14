/**
 * GoalCard - Phaser-based goal card component
 * 
 * PHASER COMPLIANCE:
 * - Extends Phaser.GameObjects.Container for proper scene integration
 * - Uses native Phaser input events and interaction patterns
 * - Follows Phaser component lifecycle and event emission patterns
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * ARCHITECTURE NOTES:
 * - Container-based component for easy management and positioning
 * - Event-driven design using Phaser's EventEmitter
 * - Proper cleanup and destruction following Phaser patterns
 * - Interactive elements using Phaser input system
 * 
 * ============================================================================
 * AI CONTEXT: CRITICAL DOUBLE-RENDERING PREVENTION PATTERN
 * ============================================================================
 * 
 * THIS FILE DEMONSTRATES THE CORRECT PATTERN FOR CREATING CUSTOM PHASER CONTAINERS
 * 
 * ❌ WRONG PATTERN (DO NOT USE - CAUSES DOUBLE-RENDERING):
 * ```javascript
 * // This creates objects that exist in BOTH scene display list AND container
 * this.element = this.scene.add.rectangle(x, y, w, h, color);
 * this.add(this.element); // DOUBLE-RENDERING = INVISIBLE OBJECTS
 * ```
 * 
 * ✅ CORRECT PATTERN (USE THIS - PREVENTS DOUBLE-RENDERING):
 * ```javascript
 * // This creates objects that exist ONLY in container display list
 * this.element = new Phaser.GameObjects.Rectangle(this.scene, x, y, w, h, color);
 * this.add(this.element); // SINGLE RENDERING = VISIBLE OBJECTS
 * ```
 * 
 * WHY THIS MATTERS:
 * - Phaser objects can only exist in ONE display list at a time
 * - scene.add.* methods automatically add objects to scene display list
 * - container.add() adds objects to container display list
 * - Same object in both lists = double-rendering = invisible
 * - Object in only container list = proper rendering = visible
 * 
 * AI MEMORY: When creating custom containers, ALWAYS use constructors, NEVER scene.add methods
 * 
 * APPLICABLE TO ALL PHASER GAME OBJECTS:
 * - new Phaser.GameObjects.Rectangle() instead of this.scene.add.rectangle()
 * - new Phaser.GameObjects.Text() instead of this.scene.add.text()
 * - new Phaser.GameObjects.Sprite() instead of this.scene.add.sprite()
 * - new Phaser.GameObjects.Image() instead of this.scene.add.image()
 * - etc.
 * ============================================================================
 */

export class GoalCard extends Phaser.GameObjects.Container {
    constructor(scene, x, y, goalData, options = {}) {
        super(scene, x, y);
        
        // Store configuration
        this.goalData = goalData;
        this.options = {
            width: 300,
            height: 120,
            padding: 10,
            ...options
        };
        
        // Component state
        this.isSelected = false;
        this.isHovered = false;
        
        // Create the card visual elements
        this.createCardElements();
        
        // Set up interactivity
        this.setupInteractivity();
        
        // ============================================================================
        // AI CONTEXT: CONTAINER CONSTRUCTOR - NO SCENE DISPLAY LIST ADDITION
        // ============================================================================
        // 
        // AI WARNING: Custom containers should NOT be added to scene display list in constructor
        // 
        // ❌ WRONG PATTERN (DO NOT USE - CAUSES DOUBLE-RENDERING):
        // scene.add.existing(this); // This adds container to scene display list
        // // Later, when container is added to group: group.add(container)
        // // Result: Container exists in BOTH scene display list AND group = double-rendering
        //
        // ✅ CORRECT PATTERN (USE THIS - PREVENTS DOUBLE-RENDERING):
        // // Don't add container to scene display list in constructor
        // // Container will be added to group later: group.add(container)
        // // Group manages collection, scene renders group's children
        // // Result: Container exists in only group = proper rendering
        //
        // WHY THIS MATTERS:
        // - GoalCard is added to goalCardsGroup in renderGoalCards() method
        // - Groups manage collections but don't render children directly
        // - Scene renders group's children through the group
        // - Adding container to both scene and group creates rendering conflicts
        //
        // AI MEMORY: Custom containers should be added to groups, not scene display list
        // ============================================================================
        
        // Enable data management
        this.setDataEnabled();
        this.setData('goalData', goalData);
    }
    
    createCardElements() {
        const { width, height, padding } = this.options;
        
        // ============================================================================
        // AI CONTEXT: PHASER DOUBLE-RENDERING FIX - CRITICAL PATTERN FOR AI TO UNDERSTAND
        // ============================================================================
        // 
        // PROBLEM: AI assistants often make this mistake when creating custom containers
        // 
        // ❌ WRONG PATTERN (DO NOT USE - CAUSES DOUBLE-RENDERING):
        // this.cardBackground = this.scene.add.rectangle(0, 0, width, height, 0xffffff);
        // this.add(this.cardBackground); // This creates double-rendering!
        //
        // WHY IT'S WRONG:
        // - this.scene.add.rectangle() automatically adds the object to the scene's display list
        // - this.add() adds the object to the container's display list
        // - Same object exists in TWO display lists = double-rendering = invisible objects
        //
        // ✅ CORRECT PATTERN (USE THIS - PREVENTS DOUBLE-RENDERING):
        // this.cardBackground = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, 0xffffff);
        // this.add(this.cardBackground); // Object only exists in container's display list
        //
        // WHY IT'S CORRECT:
        // - new Phaser.GameObjects.Rectangle() creates object WITHOUT adding to scene display list
        // - this.add() adds object to container's display list
        // - Object exists in only ONE display list = proper rendering = visible objects
        //
        // AI MEMORY: When creating custom containers, ALWAYS use constructors, NEVER scene.add methods
        // ============================================================================
        
        // Card background
        // AI NOTE: Using constructor prevents automatic scene display list addition
        this.cardBackground = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, 0xffffff);
        this.cardBackground.setStrokeStyle(2, 0xe9ecef);
        this.add(this.cardBackground); // Safe to add to container - no double-rendering
        
        // Status indicator (colored bar on left)
        // AI NOTE: Same pattern - constructor + container.add()
        const statusColor = this.getStatusColor(this.goalData.state);
        this.statusBar = new Phaser.GameObjects.Rectangle(this.scene, -width/2 + 5, 0, 6, height - 10, statusColor);
        this.add(this.statusBar);
        
        // Goal title
        // AI NOTE: Text objects follow same pattern - constructor + container.add()
        this.titleText = new Phaser.GameObjects.Text(this.scene, -width/2 + 20, -height/2 + 15, this.goalData.text || 'Untitled Goal', {
            fontSize: '16px',
            fill: '#333333',
            fontStyle: 'bold',
            wordWrap: { width: width - 40 }
        }).setOrigin(0, 0);
        this.add(this.titleText);
        
        // Goal description
        // AI NOTE: Another text object using correct pattern
        this.descriptionText = new Phaser.GameObjects.Text(this.scene, -width/2 + 20, -height/2 + 35, this.goalData.description || 'No description', {
            fontSize: '12px',
            fill: '#666666',
            wordWrap: { width: width - 40 }
        }).setOrigin(0, 0);
        this.add(this.descriptionText);
        
        // Category badge
        // AI NOTE: Conditional creation still uses constructor pattern
        if (this.goalData.category) {
            this.categoryBadge = new Phaser.GameObjects.Rectangle(this.scene, width/2 - 15, -height/2 + 15, 60, 20, 0x007bff);
            this.categoryBadge.setStrokeStyle(1, 0x0056b3);
            this.add(this.categoryBadge);
            
            this.categoryText = new Phaser.GameObjects.Text(this.scene, width/2 - 15, -height/2 + 15, this.goalData.category, {
                fontSize: '10px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.add(this.categoryText);
        }
        
        // Action buttons container
        this.createActionButtons();
        
        // Set initial state
        this.updateVisualState();
    }
    
    createActionButtons() {
        const { width, height } = this.options;
        const buttonY = height/2 - 20;
        
        // ============================================================================
        // AI CONTEXT: ACTION BUTTONS - SAME DOUBLE-RENDERING PATTERN APPLIES
        // ============================================================================
        // 
        // AI WARNING: Interactive elements (buttons) follow the SAME pattern as other elements
        // 
        // ❌ COMMON AI MISTAKE (DO NOT USE):
        // this.editButton = this.scene.add.rectangle(-width/2 + 30, buttonY, 50, 25, 0x28a745);
        // this.editButton.setInteractive(); // This would cause double-rendering!
        // this.add(this.editButton);
        //
        // ✅ CORRECT PATTERN (USE THIS):
        // this.editButton = new Phaser.GameObjects.Rectangle(this.scene, -width/2 + 30, buttonY, 50, 25, 0x28a745);
        // this.editButton.setInteractive(); // Safe - object not in scene display list yet
        // this.add(this.editButton);
        //
        // AI MEMORY: Interactive elements still need constructor pattern to avoid double-rendering
        // ============================================================================
        
        // Edit button
        // AI NOTE: Interactive rectangles still use constructor pattern
        this.editButton = new Phaser.GameObjects.Rectangle(this.scene, -width/2 + 30, buttonY, 50, 25, 0x28a745);
        this.editButton.setStrokeStyle(1, 0x1e7e34);
        this.editButton.setInteractive(); // Safe to make interactive - not in scene display list
        this.add(this.editButton);
        
        // Edit button text
        // AI NOTE: Text for buttons follows same pattern
        this.editText = new Phaser.GameObjects.Text(this.scene, -width/2 + 30, buttonY, 'Edit', {
            fontSize: '10px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.editText);
        
        // Delete button
        // AI NOTE: Another interactive element using correct pattern
        this.deleteButton = new Phaser.GameObjects.Rectangle(this.scene, width/2 - 30, buttonY, 50, 25, 0xdc3545);
        this.deleteButton.setStrokeStyle(1, 0xc82333);
        this.deleteButton.setInteractive(); // Safe to make interactive
        this.add(this.deleteButton);
        
        // Delete button text
        // AI NOTE: Text for delete button follows same pattern
        this.deleteText = new Phaser.GameObjects.Text(this.scene, width/2 - 30, buttonY, 'Delete', {
            fontSize: '10px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.deleteText);
    }
    
    setupInteractivity() {
        // Make the entire card interactive
        this.setInteractive(new Phaser.Geom.Rectangle(-this.options.width/2, -this.options.height/2, this.options.width, this.options.height), Phaser.Geom.Rectangle.Contains);
        
        // Card selection
        this.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.toggleSelection();
        });
        
        // Hover effects
        this.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.setHovered(true);
        });
        
        this.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.setHovered(false);
        });
        
        // Action button events
        this.editButton.on(Phaser.Input.Events.POINTER_DOWN, (event) => {
            event.stopPropagation(); // Prevent card selection
            this.emit('goalCardEdit', this.goalData);
        });
        
        this.deleteButton.on(Phaser.Input.Events.POINTER_DOWN, (event) => {
            event.stopPropagation(); // Prevent card selection
            this.emit('goalCardDelete', this.goalData);
        });
        
        // Button hover effects
        this.setupButtonHoverEffects();
    }
    
    setupButtonHoverEffects() {
        // Edit button hover
        this.editButton.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.editButton.setScale(1.05);
            this.editButton.setFillStyle(0x218838);
        });
        
        this.editButton.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.editButton.setScale(1);
            this.editButton.setFillStyle(0x28a745);
        });
        
        // Delete button hover
        this.deleteButton.on(Phaser.Input.Events.POINTER_OVER, () => {
            this.deleteButton.setScale(1.05);
            this.deleteButton.setFillStyle(0xc82333);
        });
        
        this.deleteButton.on(Phaser.Input.Events.POINTER_OUT, () => {
            this.deleteButton.setScale(1);
            this.deleteButton.setFillStyle(0xdc3545);
        });
    }
    
    getStatusColor(state) {
        const colors = {
            'to-do': 0x6c757d,      // Gray
            'in-play': 0x007bff,    // Blue
            'completed': 0x28a745   // Green
        };
        return colors[state] || colors['to-do'];
    }
    
    toggleSelection() {
        this.setSelected(!this.isSelected);
    }
    
    setSelected(selected) {
        this.isSelected = selected;
        this.updateVisualState();
        this.emit('goalCardSelected', this.goalData, selected);
    }
    
    setHovered(hovered) {
        this.isHovered = hovered;
        this.updateVisualState();
    }
    
    updateVisualState() {
        if (this.isSelected) {
            this.cardBackground.setStrokeStyle(3, 0x007bff);
            this.cardBackground.setFillStyle(0xf8f9ff);
        } else if (this.isHovered) {
            this.cardBackground.setStrokeStyle(2, 0x007bff);
            this.cardBackground.setFillStyle(0xffffff);
        } else {
            this.cardBackground.setStrokeStyle(2, 0xe9ecef);
            this.cardBackground.setFillStyle(0xffffff);
        }
    }
    
    animateAppearance() {
        // Fade in animation
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // Scale animation
        this.setScale(0.8);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    updateGoalData(newGoalData) {
        this.goalData = newGoalData;
        this.setData('goalData', newGoalData);
        
        // Update visual elements
        this.titleText.setText(newGoalData.text || 'Untitled Goal');
        this.descriptionText.setText(newGoalData.description || 'No description');
        
        // Update status bar color
        const statusColor = this.getStatusColor(newGoalData.state);
        this.statusBar.setFillStyle(statusColor);
        
        // Update category badge
        if (newGoalData.category) {
            if (this.categoryBadge) {
                this.categoryText.setText(newGoalData.category);
            } else {
                this.createCategoryBadge();
            }
        } else if (this.categoryBadge) {
            this.categoryBadge.destroy();
            this.categoryText.destroy();
            this.categoryBadge = null;
            this.categoryText = null;
        }
    }
    
    createCategoryBadge() {
        const { width } = this.options;
        
        // ============================================================================
        // AI CONTEXT: DYNAMIC ELEMENT CREATION - SAME PATTERN APPLIES
        // ============================================================================
        // 
        // AI WARNING: Even when creating elements dynamically (like this method), use constructor pattern
        // 
        // ❌ COMMON AI MISTAKE (DO NOT USE):
        // this.categoryBadge = this.scene.add.rectangle(width/2 - 15, -this.options.height/2 + 15, 60, 20, 0x007bff);
        // this.add(this.categoryBadge); // This would cause double-rendering!
        //
        // ✅ CORRECT PATTERN (USE THIS):
        // this.categoryBadge = new Phaser.GameObjects.Rectangle(this.scene, width/2 - 15, -this.options.height/2 + 15, 60, 20, 0x007bff);
        // this.add(this.categoryBadge); // Safe - no double-rendering
        //
        // AI MEMORY: Dynamic creation still requires constructor pattern to avoid double-rendering
        // ============================================================================
        
        // Category badge background
        // AI NOTE: Dynamic creation still uses constructor pattern
        this.categoryBadge = new Phaser.GameObjects.Rectangle(this.scene, width/2 - 15, -this.options.height/2 + 15, 60, 20, 0x007bff);
        this.categoryBadge.setStrokeStyle(1, 0x0056b3);
        this.add(this.categoryBadge);
        
        // Category badge text
        // AI NOTE: Dynamic text creation follows same pattern
        this.categoryText = new Phaser.GameObjects.Text(this.scene, width/2 - 15, -this.options.height/2 + 15, this.goalData.category, {
            fontSize: '10px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.categoryText);
    }
    
    destroy() {
        // Clean up event listeners
        this.removeAllListeners();
        
        // Call parent destroy
        super.destroy();
    }
}