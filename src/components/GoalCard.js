/**
 * GoalCard - Individual goal display component
 * Extends Phaser.GameObjects.Container for proper organization and interaction
 */
export class GoalCard extends Phaser.GameObjects.Container {
    constructor(scene, x, y, goal, options = {}) {
        super(scene, x, y);
        
        // Store references
        this.scene = scene;
        this.goal = goal;
        
        // Card dimensions and styling
        this.cardWidth = options.width || 300;
        this.cardHeight = options.height || 120;
        this.isSelected = false;
        this.isHovered = false;
        
        // Create card elements
        this.createBackground();
        this.createTextElements();
        this.createStateIndicator();
        this.createActionButtons();
        
        // Set up interactions
        this.setupInteractions();
        
        // Add to scene
        scene.add.existing(this);
    }

    createBackground() {
        // Main card background
        this.background = this.scene.add.rectangle(0, 0, this.cardWidth, this.cardHeight, 0xffffff);
        this.background.setStrokeStyle(2, 0xdee2e6);
        
        // State indicator bar (top edge)
        this.stateBar = this.scene.add.rectangle(0, -this.cardHeight/2 + 3, this.cardWidth, 6, this.getStateColor());
        
        // Add background elements to container
        this.add([this.background, this.stateBar]);
    }

    createTextElements() {
        // Goal title
        this.titleText = this.scene.add.text(0, -20, this.goal.text || 'Untitled Goal', {
            fontSize: '16px',
            fill: '#333333',
            fontStyle: 'bold',
            wordWrap: { width: this.cardWidth - 40 },
            align: 'center'
        }).setOrigin(0.5);
        
        // Goal state
        this.stateText = this.scene.add.text(0, 10, this.goal.state || 'to-do', {
            fontSize: '12px',
            fill: '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Create category tags and date info first
        this.createCategoryTags();
        this.createDateInfo();
        
        // Collect all text elements for adding to container
        const textElements = [this.titleText, this.stateText];
        
        // Add category tags if they exist
        if (this.categoryTags && this.categoryTags.length > 0) {
            textElements.push(...this.categoryTags);
        }
        
        // Add date elements if they exist
        if (this.createdText) textElements.push(this.createdText);
        if (this.completedText) textElements.push(this.completedText);
        
        // Add all text elements to container
        this.add(textElements);
    }

    createCategoryTags() {
        this.categoryTags = [];
        
        if (this.goal.categories && this.goal.categories.length > 0) {
            this.goal.categories.forEach((category, index) => {
                const tag = this.scene.add.rectangle(
                    -this.cardWidth/2 + 20 + (index * 60), 
                    30, 
                    50, 
                    20, 
                    this.getCategoryColor(category)
                );
                tag.setStrokeStyle(1, 0xffffff);
                
                const tagText = this.scene.add.text(tag.x, tag.y, category, {
                    fontSize: '10px',
                    fill: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                
                // Store for later addition to container
                this.categoryTags.push(tag, tagText);
            });
        }
    }

    createDateInfo() {
        const dateY = 40;
        
        // Created date
        if (this.goal.createdAt) {
            this.createdText = this.scene.add.text(-this.cardWidth/2 + 10, dateY, 
                `Created: ${this.formatDate(this.goal.createdAt)}`, {
                fontSize: '10px',
                fill: '#999999'
            }).setOrigin(0, 0.5);
        }
        
        // Completed date
        if (this.goal.completedAt) {
            this.completedText = this.scene.add.text(this.cardWidth/2 - 10, dateY, 
                `Completed: ${this.formatDate(this.goal.completedAt)}`, {
                fontSize: '10px',
                fill: '#28a745'
            }).setOrigin(1, 0.5);
        }
    }

    createStateIndicator() {
        // State icon
        const stateIcon = this.getStateIcon();
        this.stateIcon = this.scene.add.text(this.cardWidth/2 - 15, -this.cardHeight/2 + 15, stateIcon, {
            fontSize: '16px'
        }).setOrigin(1, 0);
        
        // Add state indicator to container
        this.add([this.stateIcon]);
    }

    createActionButtons() {
        this.actionButtons = [];
        
        // Edit button
        this.editBtn = this.scene.add.rectangle(this.cardWidth/2 - 30, this.cardHeight/2 - 15, 20, 20, 0x007bff);
        this.editBtn.setStrokeStyle(1, 0xffffff);
        this.editBtn.setInteractive();
        
        const editIcon = this.scene.add.text(this.editBtn.x, this.editBtn.y, '✏️', {
            fontSize: '10px'
        }).setOrigin(0.5);
        
        // Delete button
        this.deleteBtn = this.scene.add.rectangle(this.cardWidth/2 - 5, this.cardHeight/2 - 15, 20, 20, 0xdc3545);
        this.deleteBtn.setStrokeStyle(1, 0xffffff);
        this.deleteBtn.setInteractive();
        
        const deleteIcon = this.scene.add.text(this.deleteBtn.x, this.deleteBtn.y, '🗑️', {
            fontSize: '10px'
        }).setOrigin(0.5);
        
        // Store action buttons for later addition
        this.actionButtons.push(this.editBtn, editIcon, this.deleteBtn, deleteIcon);
        
        // Add all action buttons to container at once
        this.add(this.actionButtons);
        
        // Initially hide action buttons
        this.actionButtons.forEach(btn => btn.setVisible(false));
    }

    setupInteractions() {
        // CORRECT - use proper hit area geometry
        this.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.cardWidth, this.cardHeight),
            Phaser.Geom.Rectangle.Contains
        );
        
        // Main card interactions
        this.on('pointerdown', () => {
            this.toggleSelection();
        });
        
        this.on('pointerover', () => {
            this.setHovered(true);
        });
        
        this.on('pointerout', () => {
            this.setHovered(false);
        });
        
        // Action button interactions
        this.editBtn.on('pointerdown', (event) => {
            event.stopPropagation();
            this.editGoal();
        });
        
        this.deleteBtn.on('pointerdown', (event) => {
            event.stopPropagation();
            this.deleteGoal();
        });
    }

    setHovered(hovered) {
        this.isHovered = hovered;
        this.updateAppearance();
    }

    setSelected(selected) {
        this.isSelected = selected;
        this.updateAppearance();
    }

    toggleSelection() {
        this.setSelected(!this.isSelected);
        
        // Emit selection event
        this.scene.events.emit('goalCardSelected', this.goal, this.isSelected);
    }

    updateAppearance() {
        if (this.isSelected) {
            this.background.setFillStyle(0xe3f2fd);
            this.background.setStrokeStyle(3, 0x2196f3);
            this.actionButtons.forEach(btn => btn.setVisible(true));
        } else if (this.isHovered) {
            this.background.setFillStyle(0xf8f9fa);
            this.background.setStrokeStyle(2, 0x007bff);
            this.actionButtons.forEach(btn => btn.setVisible(true));
        } else {
            this.background.setFillStyle(0xffffff);
            this.background.setStrokeStyle(2, 0xdee2e6);
            this.actionButtons.forEach(btn => btn.setVisible(false));
        }
    }

    updateGoal(goal) {
        this.goal = goal;
        this.titleText.setText(goal.text || 'Untitled Goal');
        this.stateText.setText(goal.state || 'to-do');
        this.stateBar.setFillStyle(this.getStateColor());
        this.stateIcon.setText(this.getStateIcon());
        
        // Update category tags
        this.updateCategoryTags();
        
        // Update date info
        this.updateDateInfo();
    }

    updateCategoryTags() {
        // Clear existing tags
        this.categoryTags.forEach(tag => tag.destroy());
        this.categoryTags = [];
        
        if (this.goal.categories && this.goal.categories.length > 0) {
            // Create all tag objects first
            this.goal.categories.forEach((category, index) => {
                const tag = this.scene.add.rectangle(
                    -this.cardWidth/2 + 20 + (index * 60), 
                    30, 
                    50, 
                    20, 
                    this.getCategoryColor(category)
                );
                tag.setStrokeStyle(1, 0xffffff);
                
                const tagText = this.scene.add.text(tag.x, tag.y, category, {
                    fontSize: '10px',
                    fill: '#ffffff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                
                // Store for later addition to container
                this.categoryTags.push(tag, tagText);
            });
            
            // Add all tags to container at once (following Phaser Container pattern)
            this.add(this.categoryTags);
        }
    }

    updateDateInfo() {
        // Update created date
        if (this.createdText) {
            this.createdText.setText(`Created: ${this.formatDate(this.goal.createdAt)}`);
        }
        
        // Update completed date
        if (this.completedText) {
            if (this.goal.completedAt) {
                this.completedText.setText(`Completed: ${this.formatDate(this.goal.completedAt)}`);
                this.completedText.setVisible(true);
            } else {
                this.completedText.setVisible(false);
            }
        }
    }

    editGoal() {
        // Emit edit event
        this.scene.events.emit('goalCardEdit', this.goal);
    }

    deleteGoal() {
        // Emit delete event
        this.scene.events.emit('goalCardDelete', this.goal);
    }

    getStateColor() {
        switch (this.goal.state) {
            case 'completed':
                return 0x28a745; // Green
            case 'in-play':
                return 0xffc107; // Yellow
            case 'to-do':
                return 0x6c757d; // Gray
            default:
                return 0x6c757d;
        }
    }

    getStateIcon() {
        switch (this.goal.state) {
            case 'completed':
                return '✅';
            case 'in-play':
                return '🎯';
            case 'to-do':
                return '📝';
            default:
                return '📝';
        }
    }

    getCategoryColor(category) {
        // Simple color mapping - could be enhanced with actual category colors
        const colors = [0x007bff, 0x28a745, 0xffc107, 0xdc3545, 0x6f42c1, 0xfd7e14];
        const hash = category.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }

    formatDate(date) {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString();
    }

    // Animation methods
    animateAppearance() {
        this.setScale(0);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    animateRemoval() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    animateUpdate() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });
    }

    destroy() {
        // Clean up references
        this.goal = null;
        this.scene = null;
        
        // Call parent destroy
        super.destroy();
    }
}