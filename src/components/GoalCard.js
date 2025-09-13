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
        
        // Add to scene (Phaser pattern)
        scene.add.existing(this);
        
        // Enable data management
        this.setDataEnabled();
        this.setData('goalData', goalData);
    }
    
    createCardElements() {
        const { width, height, padding } = this.options;
        
        // Card background
        this.cardBackground = this.scene.add.rectangle(0, 0, width, height, 0xffffff);
        this.cardBackground.setStrokeStyle(2, 0xe9ecef);
        this.add(this.cardBackground);
        
        // Status indicator (colored bar on left)
        const statusColor = this.getStatusColor(this.goalData.state);
        this.statusBar = this.scene.add.rectangle(-width/2 + 5, 0, 6, height - 10, statusColor);
        this.add(this.statusBar);
        
        // Goal title
        this.titleText = this.scene.add.text(-width/2 + 20, -height/2 + 15, this.goalData.text || 'Untitled Goal', {
            fontSize: '16px',
            fill: '#333333',
            fontStyle: 'bold',
            wordWrap: { width: width - 40 }
        }).setOrigin(0, 0);
        this.add(this.titleText);
        
        // Goal description
        this.descriptionText = this.scene.add.text(-width/2 + 20, -height/2 + 35, this.goalData.description || 'No description', {
            fontSize: '12px',
            fill: '#666666',
            wordWrap: { width: width - 40 }
        }).setOrigin(0, 0);
        this.add(this.descriptionText);
        
        // Category badge
        if (this.goalData.category) {
            this.categoryBadge = this.scene.add.rectangle(width/2 - 15, -height/2 + 15, 60, 20, 0x007bff);
            this.categoryBadge.setStrokeStyle(1, 0x0056b3);
            this.add(this.categoryBadge);
            
            this.categoryText = this.scene.add.text(width/2 - 15, -height/2 + 15, this.goalData.category, {
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
        
        // Edit button
        this.editButton = this.scene.add.rectangle(-width/2 + 30, buttonY, 50, 25, 0x28a745);
        this.editButton.setStrokeStyle(1, 0x1e7e34);
        this.editButton.setInteractive();
        this.add(this.editButton);
        
        this.editText = this.scene.add.text(-width/2 + 30, buttonY, 'Edit', {
            fontSize: '10px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.editText);
        
        // Delete button
        this.deleteButton = this.scene.add.rectangle(width/2 - 30, buttonY, 50, 25, 0xdc3545);
        this.deleteButton.setStrokeStyle(1, 0xc82333);
        this.deleteButton.setInteractive();
        this.add(this.deleteButton);
        
        this.deleteText = this.scene.add.text(width/2 - 30, buttonY, 'Delete', {
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
        this.categoryBadge = this.scene.add.rectangle(width/2 - 15, -this.options.height/2 + 15, 60, 20, 0x007bff);
        this.categoryBadge.setStrokeStyle(1, 0x0056b3);
        this.add(this.categoryBadge);
        
        this.categoryText = this.scene.add.text(width/2 - 15, -this.options.height/2 + 15, this.goalData.category, {
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