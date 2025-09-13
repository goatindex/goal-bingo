/**
 * BingoGridScene - Main game area with interactive bingo grid
 * Handles grid rendering, goal population, win detection, and game mechanics
 * 
 * ARCHITECTURE NOTES:
 * - Uses game.appStateManager for state management (domain logic)
 * - Uses game.registry for data persistence (Phaser native)
 * - Uses game.events for application events (Phaser native)
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * KEY DEPENDENCIES:
 * - game.appStateManager: ApplicationStateManager instance for domain logic
 * - game.registry: Phaser's built-in data management system
 * - game.events: Phaser's built-in event system
 */
import { BingoCell } from '../components/BingoCell.js';

export default class BingoGridScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'BingoGridScene',
            plugins: ['TweenManager', 'InputPlugin', 'Clock'],
            data: {
                defaultData: 'value',
                sceneType: 'gameplay',
                hasAnimations: true,
                hasInput: true,
                gridSize: 5,
                isGameActive: false
            }
        });
        
        this.gridSize = 5;
        this.cells = [];
        this.gridContainer = null;
        this.gridSizeSelector = null;
        this.gameStats = null;
        this.winPatterns = [];
        this.isGameActive = false;
    }

    init(data) {
        // Initialize scene with data
        console.log('BingoGridScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
        if (data) {
            // Handle any data passed from other scenes
            if (data.gridSize) {
                this.gridSize = data.gridSize;
            }
            if (data.isGameActive !== undefined) {
                this.isGameActive = data.isGameActive;
            }
        }
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);

        // Create UI elements
        this.createHeader(width, height);
        this.createGridSizeSelector(width, height);
        this.createGameStats(width, height);
        this.createGrid(width, height);
        this.createActionButtons(width, height);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize game
        this.initializeGame();
    }
    
    createHeader(width, height) {
        // Title
        this.add.text(width / 2, 30, '🎲 Bingo Grid', {
            fontSize: '28px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.rectangle(80, 30, 100, 35, 0x666666);
        backBtn.setStrokeStyle(2, 0x555555);
        backBtn.setInteractive();
        
        this.add.text(80, 30, '← Back', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        // Add hover effects
        backBtn.on('pointerover', () => backBtn.setScale(1.05));
        backBtn.on('pointerout', () => backBtn.setScale(1));
    }
    
    createGridSizeSelector(width, height) {
        const y = 70;
        
        // Label
        this.add.text(20, y, 'Grid Size:', {
            fontSize: '16px',
            fill: '#333333',
            fontStyle: 'bold'
        });
        
        // Size buttons
        const sizes = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.gridSizeButtons = [];
        
        sizes.forEach((size, index) => {
            const x = 120 + (index * 35);
            const btn = this.add.rectangle(x, y, 30, 25, size === this.gridSize ? 0x4CAF50 : 0xcccccc);
            btn.setStrokeStyle(2, size === this.gridSize ? 0x45a049 : 0x999999);
            btn.setInteractive();
            
            this.add.text(x, y, size.toString(), {
                fontSize: '12px',
                fill: size === this.gridSize ? '#ffffff' : '#333333'
            }).setOrigin(0.5);
            
            btn.on('pointerdown', () => {
                this.changeGridSize(size);
            });
            
            this.gridSizeButtons.push(btn);
        });
    }
    
    createGameStats(width, height) {
        const y = 110;
        
        this.gameStats = this.add.text(20, y, '', {
            fontSize: '14px',
            fill: '#666666',
            wordWrap: { width: width - 40 }
        });
        
        this.updateGameStats();
    }
    
    createGrid(width, height) {
        const gridY = 150;
        const cellSize = Math.min(80, (width - 100) / this.gridSize);
        const gridWidth = this.gridSize * cellSize;
        const gridX = (width - gridWidth) / 2;
        
        // Create grid container
        this.gridContainer = this.add.container(gridX, gridY);
        
        // Create cells
        this.cells = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = col * cellSize + cellSize / 2;
                const y = row * cellSize + cellSize / 2;
                
                const cell = new BingoCell(this, x, y, null, cellSize);
                this.gridContainer.add(cell);
                this.cells[row][col] = cell;
            }
        }
        
        // Listen for goal completion events
        this.events.on('goalCompleted', this.onGoalCompleted, this);
    }
    
    createActionButtons(width, height) {
        const y = height - 60;
        
        // New Game button
        const newGameBtn = this.add.rectangle(width / 2 - 80, y, 120, 40, 0x4CAF50);
        newGameBtn.setStrokeStyle(2, 0x45a049);
        newGameBtn.setInteractive();
        
        this.add.text(width / 2 - 80, y, 'New Game', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        newGameBtn.on('pointerdown', () => {
            this.startNewGame();
        });
        
        // Repopulate button
        const repopulateBtn = this.add.rectangle(width / 2 + 80, y, 120, 40, 0xFF9800);
        repopulateBtn.setStrokeStyle(2, 0xe68900);
        repopulateBtn.setInteractive();
        
        this.add.text(width / 2 + 80, y, 'Repopulate', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        repopulateBtn.on('pointerdown', () => {
            this.repopulateGrid();
        });
        
        // Add hover effects
        [newGameBtn, repopulateBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setScale(1.05));
            btn.on('pointerout', () => btn.setScale(1));
        });
    }
    
    setupEventListeners() {
        // Listen for state changes
        this.game.events.on('goalsChanged', this.updateGameStats, this);
        this.game.events.on('gameStateChanged', this.updateGameStats, this);
    }
    
    initializeGame() {
        this.populateGrid();
        this.isGameActive = true;
        this.updateGameStats();
    }
    
    changeGridSize(newSize) {
        if (newSize === this.gridSize) return;
        
        this.gridSize = newSize;
        
        // Update button appearances
        this.gridSizeButtons.forEach((btn, index) => {
            const size = [2, 3, 4, 5, 6, 7, 8, 9, 10][index];
            if (size === this.gridSize) {
                btn.setFillStyle(0x4CAF50);
                btn.setStrokeStyle(2, 0x45a049);
            } else {
                btn.setFillStyle(0xcccccc);
                btn.setStrokeStyle(2, 0x999999);
            }
        });
        
        // Recreate grid
        this.recreateGrid();
    }
    
    recreateGrid() {
        // Clear existing grid
        if (this.gridContainer) {
            this.gridContainer.destroy();
        }
        
        // Create new grid
        this.createGrid(this.cameras.main.width, this.cameras.main.height);
        
        // Populate with goals
        this.populateGrid();
    }
    
    populateGrid() {
        if (!this.game.appStateManager) return;
        
        const availableGoals = this.game.appStateManager.getAvailableGoals();
        if (availableGoals.length === 0) {
            console.warn('No available goals to populate grid');
            return;
        }
        
        // Clear existing goals
        this.clearGrid();
        
        // Populate with random goals
        const totalCells = this.gridSize * this.gridSize;
        const goalsToUse = Math.min(totalCells, availableGoals.length);
        
        for (let i = 0; i < goalsToUse; i++) {
            const randomGoal = availableGoals[Math.floor(Math.random() * availableGoals.length)];
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            
            this.cells[row][col].setGoal(randomGoal);
        }
        
        // Update game state
        this.updateGameState();
    }
    
    clearGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.cells[row][col].setGoal(null);
                this.cells[row][col].setCompleted(false);
                this.cells[row][col].setHighlighted(false);
            }
        }
    }
    
    onGoalCompleted(goal, completed) {
        if (!this.isGameActive) return;
        
        // Update goal state in app state manager
        if (this.game.appStateManager) {
            this.game.appStateManager.updateGoal(goal.id, { 
                state: completed ? 'completed' : 'in-play' 
            });
        }
        
        // Check for wins
        this.checkForWins();
        this.updateGameStats();
    }
    
    checkForWins() {
        this.winPatterns = [];
        
        // Check rows
        for (let row = 0; row < this.gridSize; row++) {
            if (this.isRowComplete(row)) {
                this.winPatterns.push({ type: 'row', index: row });
                this.highlightRow(row);
            }
        }
        
        // Check columns
        for (let col = 0; col < this.gridSize; col++) {
            if (this.isColumnComplete(col)) {
                this.winPatterns.push({ type: 'column', index: col });
                this.highlightColumn(col);
            }
        }
        
        // Check diagonals
        if (this.isDiagonalComplete(true)) {
            this.winPatterns.push({ type: 'diagonal', index: 0 });
            this.highlightDiagonal(true);
        }
        
        if (this.isDiagonalComplete(false)) {
            this.winPatterns.push({ type: 'diagonal', index: 1 });
            this.highlightDiagonal(false);
        }
        
        // Process wins
        if (this.winPatterns.length > 0) {
            this.processWins();
        }
    }
    
    isRowComplete(row) {
        for (let col = 0; col < this.gridSize; col++) {
            if (!this.cells[row][col].isCompleted || this.cells[row][col].isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    isColumnComplete(col) {
        for (let row = 0; row < this.gridSize; row++) {
            if (!this.cells[row][col].isCompleted || this.cells[row][col].isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    isDiagonalComplete(mainDiagonal) {
        for (let i = 0; i < this.gridSize; i++) {
            const row = i;
            const col = mainDiagonal ? i : this.gridSize - 1 - i;
            
            if (!this.cells[row][col].isCompleted || this.cells[row][col].isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    highlightRow(row) {
        for (let col = 0; col < this.gridSize; col++) {
            this.cells[row][col].setHighlighted(true);
        }
    }
    
    highlightColumn(col) {
        for (let row = 0; row < this.gridSize; row++) {
            this.cells[row][col].setHighlighted(true);
        }
    }
    
    highlightDiagonal(mainDiagonal) {
        for (let i = 0; i < this.gridSize; i++) {
            const row = i;
            const col = mainDiagonal ? i : this.gridSize - 1 - i;
            this.cells[row][col].setHighlighted(true);
        }
    }
    
    processWins() {
        // Update game state
        if (this.game.appStateManager) {
            const gameState = this.game.appStateManager.getGameState();
            const newWins = gameState.totalWins + this.winPatterns.length;
            const newStreak = gameState.currentStreak + 1;
            
            this.game.appStateManager.updateGameState({
                totalWins: newWins,
                currentStreak: newStreak,
                lastWinAt: new Date()
            });
        }
        
        // Show win celebration
        this.showWinCelebration();
        
        // Clear completed goals after a delay
        this.time.delayedCall(2000, () => {
            this.clearCompletedGoals();
        });
    }
    
    showWinCelebration() {
        const { width, height } = this.cameras.main;
        
        // Create win celebration container
        const celebrationContainer = this.add.container(width / 2, height / 2);
        
        // Background overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3);
        celebrationContainer.add(overlay);
        
        // Win text
        const winText = this.add.text(0, -50, `🎉 BINGO!`, {
            fontSize: '48px',
            fill: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        celebrationContainer.add(winText);
        
        // Win count text
        const winCountText = this.add.text(0, 20, `${this.winPatterns.length} win${this.winPatterns.length > 1 ? 's' : ''}!`, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        celebrationContainer.add(winCountText);
        
        // Celebration particles
        this.createCelebrationParticles(celebrationContainer);
        
        // Animate celebration
        this.animateWinCelebration(celebrationContainer, winText, winCountText);
        
        // Auto-remove after animation
        this.time.delayedCall(3000, () => {
            celebrationContainer.destroy();
        });
    }
    
    createCelebrationParticles(container) {
        // Create particle effects around the win text
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(3, 8),
                Phaser.Math.RND.pick([0xFFD700, 0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4])
            );
            container.add(particle);
            
            // Animate particles
            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-200, 200),
                y: particle.y + Phaser.Math.Between(-200, 200),
                alpha: 0,
                scale: 0,
                duration: 2000,
                ease: 'Power2',
                delay: i * 50
            });
        }
    }
    
    animateWinCelebration(container, winText, winCountText) {
        // Initial scale up
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Win text animation
        winText.setScale(0);
        this.tweens.add({
            targets: winText,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 200
        });
        
        // Win count text animation
        winCountText.setScale(0);
        this.tweens.add({
            targets: winCountText,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 400
        });
        
        // Pulsing effect
        this.tweens.add({
            targets: winText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Power2',
            delay: 800
        });
    }
    
    clearCompletedGoals() {
        // Animate clearing of completed goals
        const completedCells = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.cells[row][col].isCompleted) {
                    completedCells.push({ row, col, cell: this.cells[row][col] });
                }
            }
        }
        
        // Animate clearing with fade out
        this.tweens.add({
            targets: completedCells.map(c => c.cell),
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Clear the cells
                completedCells.forEach(({ cell }) => {
                    cell.setGoal(null);
                    cell.setCompleted(false);
                    cell.setHighlighted(false);
                    cell.setAlpha(1);
                    cell.setScale(1);
                });
                
                // Repopulate with animation
                this.animateGridRepopulation();
            }
        });
    }
    
    animateGridRepopulation() {
        // Get empty cells
        const emptyCells = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.cells[row][col].isEmpty()) {
                    emptyCells.push({ row, col, cell: this.cells[row][col] });
                }
            }
        }
        
        // Populate with new goals
        const availableGoals = this.game.appStateManager?.getAvailableGoals() || [];
        emptyCells.forEach(({ cell }, index) => {
            if (availableGoals.length > 0) {
                const randomGoal = availableGoals[Math.floor(Math.random() * availableGoals.length)];
                cell.setGoal(randomGoal);
                
                // Animate appearance
                cell.setAlpha(0);
                cell.setScale(0.5);
                
                this.tweens.add({
                    targets: cell,
                    alpha: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut',
                    delay: index * 100
                });
            }
        });
        
        // Update game state
        this.updateGameState();
    }
    
    startNewGame() {
        this.clearGrid();
        this.populateGrid();
        this.winPatterns = [];
        this.isGameActive = true;
        this.updateGameStats();
    }
    
    repopulateGrid() {
        this.populateGrid();
    }
    
    updateGameStats() {
        if (!this.gameStats) return;
        
        const goals = this.game.appStateManager?.getGoals() || [];
        const gameState = this.game.appStateManager?.getGameState() || {};
        const completedGoals = goals.filter(g => g.state === 'completed').length;
        const inPlayGoals = goals.filter(g => g.state === 'in-play').length;
        
        const stats = [
            `Goals: ${goals.length} total | ${completedGoals} completed | ${inPlayGoals} in-play`,
            `Wins: ${gameState.totalWins || 0} | Streak: ${gameState.currentStreak || 0}`,
            `Grid: ${this.gridSize}x${this.gridSize} | Active: ${this.isGameActive ? 'Yes' : 'No'}`
        ].join('\n');
        
        this.gameStats.setText(stats);
    }
    
    updateGameState() {
        if (!this.game.appStateManager) return;
        
        // Update current grid state
        const currentGrid = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const goal = this.cells[row][col].getGoal();
                currentGrid.push(goal ? goal.id : null);
            }
        }
        
        this.game.appStateManager.updateGameState({
            gridSize: this.gridSize,
            currentGrid: currentGrid
        });
    }
    
    shutdown() {
        // Clean up event listeners
        this.game.events.off('goalsChanged', this.updateGameStats, this);
        this.game.events.off('gameStateChanged', this.updateGameStats, this);
        this.events.off('goalCompleted', this.onGoalCompleted, this);
        
        // Clear grid
        this.clearGrid();
        this.cells = [];
        
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}