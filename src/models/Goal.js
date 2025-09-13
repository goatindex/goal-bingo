/**
 * Goal Model - Represents a goal in the Goal Bingo system
 * Integrates with Phaser's Data Manager for state management
 */
export class Goal {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.text = data.text || '';
        this.categories = data.categories || [];
        this.state = data.state || 'to-do'; // 'to-do', 'in-play', 'completed'
        this.isRenewable = data.isRenewable !== undefined ? data.isRenewable : true;
        this.cooldownPeriod = data.cooldownPeriod || (this.isRenewable ? 24 : null); // hours
        this.lastCompletedAt = data.lastCompletedAt || null;
        this.difficulty = data.difficulty || 'medium'; // 'easy', 'medium', 'hard'
        this.createdAt = data.createdAt || new Date();
        this.movedToInPlayAt = data.movedToInPlayAt || null;
        this.completedAt = data.completedAt || null;
        this.gridPosition = data.gridPosition || null; // Position in current grid (if in-play)
    }

    generateId() {
        return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Move goal to in-play state
     */
    moveToInPlay(gridPosition = null) {
        this.state = 'in-play';
        this.movedToInPlayAt = new Date();
        this.gridPosition = gridPosition;
    }

    /**
     * Mark goal as completed
     */
    complete() {
        this.state = 'completed';
        this.completedAt = new Date();
        this.lastCompletedAt = new Date();
        this.gridPosition = null;
    }

    /**
     * Reset goal to to-do state (for renewable goals)
     */
    reset() {
        this.state = 'to-do';
        this.movedToInPlayAt = null;
        this.completedAt = null;
        this.gridPosition = null;
    }

    /**
     * Check if goal is available for grid population
     */
    isAvailable() {
        if (!this.isRenewable) {
            return this.state === 'to-do';
        }

        if (this.state === 'to-do') {
            return true;
        }

        if (this.state === 'completed' && this.cooldownPeriod) {
            const hoursSinceCompletion = (new Date() - this.lastCompletedAt) / (1000 * 60 * 60);
            return hoursSinceCompletion >= this.cooldownPeriod;
        }

        return false;
    }

    /**
     * Get time remaining in cooldown (in hours)
     */
    getCooldownRemaining() {
        if (!this.isRenewable || this.state !== 'completed' || !this.cooldownPeriod) {
            return 0;
        }

        const hoursSinceCompletion = (new Date() - this.lastCompletedAt) / (1000 * 60 * 60);
        const remaining = this.cooldownPeriod - hoursSinceCompletion;
        return Math.max(0, remaining);
    }

    /**
     * Convert to plain object for Phaser data storage
     */
    toObject() {
        return {
            id: this.id,
            text: this.text,
            categories: [...this.categories],
            state: this.state,
            isRenewable: this.isRenewable,
            cooldownPeriod: this.cooldownPeriod,
            lastCompletedAt: this.lastCompletedAt,
            difficulty: this.difficulty,
            createdAt: this.createdAt,
            movedToInPlayAt: this.movedToInPlayAt,
            completedAt: this.completedAt,
            gridPosition: this.gridPosition
        };
    }

    /**
     * Create Goal from plain object
     */
    static fromObject(data) {
        return new Goal(data);
    }
}

