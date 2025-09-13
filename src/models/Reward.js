/**
 * Reward Model - Represents a reward in the Goal Bingo system
 * Integrates with Phaser's Data Manager for state management
 */
export class Reward {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.description = data.description || '';
        this.category = data.category || 'general';
        this.claimed = data.claimed || false;
        this.createdAt = data.createdAt || new Date();
        this.claimedAt = data.claimedAt || null;
        this.claimedFor = data.claimedFor || null; // Which bingo completion this was claimed for
    }

    generateId() {
        return 'reward_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Claim this reward for a specific bingo completion
     */
    claim(bingoWinId) {
        this.claimed = true;
        this.claimedAt = new Date();
        this.claimedFor = bingoWinId;
    }

    /**
     * Unclaim this reward (for management purposes)
     */
    unclaim() {
        this.claimed = false;
        this.claimedAt = null;
        this.claimedFor = null;
    }

    /**
     * Check if reward is available to be claimed
     */
    isAvailable() {
        return !this.claimed;
    }

    /**
     * Get time since claimed (in hours)
     */
    getTimeSinceClaimed() {
        if (!this.claimed || !this.claimedAt) {
            return null;
        }
        return (new Date() - this.claimedAt) / (1000 * 60 * 60);
    }

    /**
     * Convert to plain object for Phaser data storage
     */
    toObject() {
        return {
            id: this.id,
            description: this.description,
            category: this.category,
            claimed: this.claimed,
            createdAt: this.createdAt,
            claimedAt: this.claimedAt,
            claimedFor: this.claimedFor
        };
    }

    /**
     * Create Reward from plain object
     */
    static fromObject(data) {
        return new Reward(data);
    }
}

