/**
 * BingoCell - Individual cell in the bingo grid
 * Handles goal display, completion state, and interactions
 */
export class BingoCell extends Phaser.GameObjects.Container {
    constructor(scene, x, y, goal = null, cellSize = 100) {
        super(scene, x, y);
        
        this.scene = scene;
        this.goal = goal;
        this.cellSize = cellSize;
        this.isCompleted = false;
        this.isHighlighted = false;
        
        // Create cell background
        this.createBackground();
        
        // Create goal text
        this.createGoalText();
        
        // Create completion indicator
        this.createCompletionIndicator();
        
        // Set up interactions
        this.setupInteractions();
        
        // Add to scene
        scene.add.existing(this);
    }
    
    createBackground() {
        this.background = this.scene.add.rectangle(0, 0, this.cellSize, this.cellSize, 0xffffff);
        this.background.setStrokeStyle(2, 0xcccccc);
        this.add(this.background);
    }
    
    createGoalText() {
        this.goalText = this.scene.add.text(0, 0, '', {
            fontSize: '12px',
            fill: '#333333',
            wordWrap: { width: this.cellSize - 10 },
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.goalText);
        
        this.updateGoalText();
    }
    
    createCompletionIndicator() {
        this.completionIndicator = this.scene.add.circle(0, -this.cellSize/2 + 15, 8, 0x4CAF50);
        this.completionIndicator.setVisible(false);
        this.add(this.completionIndicator);
    }
    
    setupInteractions() {
        this.setSize(this.cellSize, this.cellSize);
        this.setInteractive();
        
        this.on('pointerdown', () => {
            this.toggleCompletion();
        });
        
        this.on('pointerover', () => {
            if (!this.isCompleted) {
                this.background.setFillStyle(0xf0f0f0);
            }
        });
        
        this.on('pointerout', () => {
            if (!this.isCompleted) {
                this.background.setFillStyle(0xffffff);
            }
        });
    }
    
    setGoal(goal) {
        this.goal = goal;
        this.isCompleted = false;
        this.updateGoalText();
        this.updateAppearance();
    }
    
    updateGoalText() {
        if (this.goal) {
            this.goalText.setText(this.goal.text);
        } else {
            this.goalText.setText('');
        }
    }
    
    toggleCompletion() {
        if (!this.goal) return;
        
        this.isCompleted = !this.isCompleted;
        this.updateAppearance();
        
        // Play completion animation
        if (this.isCompleted) {
            this.playCompletionAnimation();
        }
        
        // Emit completion event
        this.scene.events.emit('goalCompleted', this.goal, this.isCompleted);
    }
    
    setCompleted(completed) {
        this.isCompleted = completed;
        this.updateAppearance();
    }
    
    playCompletionAnimation() {
        // Scale animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
        
        // Completion indicator animation
        this.scene.tweens.add({
            targets: this.completionIndicator,
            scaleX: 0,
            scaleY: 0,
            duration: 100,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.completionIndicator,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            }
        });
        
        // Text color flash
        this.scene.tweens.add({
            targets: this.goalText,
            alpha: 0.5,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    setHighlighted(highlighted) {
        this.isHighlighted = highlighted;
        this.updateAppearance();
    }
    
    updateAppearance() {
        if (this.isCompleted) {
            this.background.setFillStyle(0x4CAF50);
            this.background.setStrokeStyle(2, 0x45a049);
            this.goalText.setFill('#ffffff');
            this.completionIndicator.setVisible(true);
        } else if (this.isHighlighted) {
            this.background.setFillStyle(0xFFC107);
            this.background.setStrokeStyle(2, 0xFF9800);
            this.goalText.setFill('#333333');
            this.completionIndicator.setVisible(false);
        } else {
            this.background.setFillStyle(0xffffff);
            this.background.setStrokeStyle(2, 0xcccccc);
            this.goalText.setFill('#333333');
            this.completionIndicator.setVisible(false);
        }
    }
    
    getGoal() {
        return this.goal;
    }
    
    isEmpty() {
        return this.goal === null;
    }
    
    destroy() {
        this.goal = null;
        super.destroy();
    }
}
