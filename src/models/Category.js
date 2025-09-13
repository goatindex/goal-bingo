/**
 * Category Model - Represents a category for goals and rewards
 * Integrates with Phaser's Data Manager for state management
 */
export class Category {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.color = data.color || '#667eea';
        this.isPredefined = data.isPredefined || false;
        this.createdAt = data.createdAt || new Date();
        this.goalCount = data.goalCount || 0;
    }

    generateId() {
        return 'category_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Update the goal count for this category
     */
    updateGoalCount(count) {
        this.goalCount = Math.max(0, count);
    }

    /**
     * Increment goal count
     */
    incrementGoalCount() {
        this.goalCount++;
    }

    /**
     * Decrement goal count
     */
    decrementGoalCount() {
        this.goalCount = Math.max(0, this.goalCount - 1);
    }

    /**
     * Check if category is in use
     */
    isInUse() {
        return this.goalCount > 0;
    }

    /**
     * Convert to plain object for Phaser data storage
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            isPredefined: this.isPredefined,
            createdAt: this.createdAt,
            goalCount: this.goalCount
        };
    }

    /**
     * Create Category from plain object
     */
    static fromObject(data) {
        return new Category(data);
    }

    /**
     * Get predefined categories
     */
    static getPredefinedCategories() {
        return [
            new Category({
                id: 'health',
                name: 'Health',
                color: '#4CAF50',
                isPredefined: true,
                goalCount: 0
            }),
            new Category({
                id: 'hobbies',
                name: 'Hobbies',
                color: '#2196F3',
                isPredefined: true,
                goalCount: 0
            }),
            new Category({
                id: 'study',
                name: 'Study',
                color: '#FFC107',
                isPredefined: true,
                goalCount: 0
            }),
            new Category({
                id: 'skills',
                name: 'Skills',
                color: '#9C27B0',
                isPredefined: true,
                goalCount: 0
            }),
            new Category({
                id: 'social',
                name: 'Social',
                color: '#FF5722',
                isPredefined: true,
                goalCount: 0
            })
        ];
    }
}

