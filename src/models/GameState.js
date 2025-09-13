/**
 * GameState Model - Represents the current game state
 * Integrates with Phaser's Data Manager for state management
 */
import { Goal } from './Goal.js';

export class GameState {
    constructor(data = {}) {
        this.gridSize = data.gridSize || 5;
        this.currentGrid = data.currentGrid || [];
        this.activeGoals = data.activeGoals || []; // Goals currently in the grid
        this.totalWins = data.totalWins || 0;
        this.currentStreak = data.currentStreak || 0;
        this.lastWinAt = data.lastWinAt || null;
        this.gameStartedAt = data.gameStartedAt || new Date();
        this.preferredGridSize = data.preferredGridSize || 5;
        this.lastSaveTime = data.lastSaveTime || null;
        this.sessionId = data.sessionId || this.generateSessionId();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Set grid size and validate
     */
    setGridSize(size) {
        if (size >= 2 && size <= 10) {
            this.gridSize = size;
            this.preferredGridSize = size;
            return true;
        }
        return false;
    }

    /**
     * Add a goal to the current grid
     */
    addGoalToGrid(goal, position) {
        if (position >= 0 && position < this.gridSize * this.gridSize) {
            this.currentGrid[position] = goal;
            this.activeGoals.push(goal);
            return true;
        }
        return false;
    }

    /**
     * Remove a goal from the current grid
     */
    removeGoalFromGrid(position) {
        if (position >= 0 && position < this.gridSize * this.gridSize) {
            const goal = this.currentGrid[position];
            if (goal) {
                this.currentGrid[position] = null;
                this.activeGoals = this.activeGoals.filter(g => g.id !== goal.id);
                return goal;
            }
        }
        return null;
    }

    /**
     * Clear completed row/column/diagonal
     */
    clearCompletedPattern(positions) {
        const clearedGoals = [];
        positions.forEach(position => {
            const goal = this.removeGoalFromGrid(position);
            if (goal) {
                clearedGoals.push(goal);
            }
        });
        return clearedGoals;
    }

    /**
     * Record a win
     */
    recordWin() {
        this.totalWins++;
        this.currentStreak++;
        this.lastWinAt = new Date();
    }

    /**
     * Reset current streak
     */
    resetStreak() {
        this.currentStreak = 0;
    }

    /**
     * Get empty grid positions
     */
    getEmptyPositions() {
        const emptyPositions = [];
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            if (!this.currentGrid[i]) {
                emptyPositions.push(i);
            }
        }
        return emptyPositions;
    }

    /**
     * Check if grid is full
     */
    isGridFull() {
        return this.getEmptyPositions().length === 0;
    }

    /**
     * Check if grid is empty
     */
    isGridEmpty() {
        return this.activeGoals.length === 0;
    }

    /**
     * Get grid position from row/column
     */
    getPositionFromRowCol(row, col) {
        return row * this.gridSize + col;
    }

    /**
     * Get row/column from position
     */
    getRowColFromPosition(position) {
        return {
            row: Math.floor(position / this.gridSize),
            col: position % this.gridSize
        };
    }

    /**
     * Convert to plain object for Phaser data storage
     */
    toObject() {
        return {
            gridSize: this.gridSize,
            currentGrid: this.currentGrid.map(goal => goal ? goal.toObject() : null),
            activeGoals: this.activeGoals.map(goal => goal.toObject()),
            totalWins: this.totalWins,
            currentStreak: this.currentStreak,
            lastWinAt: this.lastWinAt,
            gameStartedAt: this.gameStartedAt,
            preferredGridSize: this.preferredGridSize,
            lastSaveTime: this.lastSaveTime,
            sessionId: this.sessionId
        };
    }

    /**
     * Create GameState from plain object
     */
    static fromObject(data) {
        const gameState = new GameState(data);
        
        // Reconstruct goal objects
        if (data.currentGrid) {
            gameState.currentGrid = data.currentGrid.map(goalData => 
                goalData ? Goal.fromObject(goalData) : null
            );
        }
        
        if (data.activeGoals) {
            gameState.activeGoals = data.activeGoals.map(goalData => 
                Goal.fromObject(goalData)
            );
        }
        
        return gameState;
    }
}
