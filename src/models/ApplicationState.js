/**
 * ApplicationState Model - Represents the complete application state
 * Integrates with Phaser's Data Manager for state management
 */
import { Goal } from './Goal.js';
import { Reward } from './Reward.js';
import { Category } from './Category.js';
import { GameState } from './GameState.js';

export class ApplicationState {
    constructor(data = {}) {
        this.version = data.version || '1.0.0';
        this.lastModified = data.lastModified || new Date();
        this.gameState = data.gameState ? GameState.fromObject(data.gameState) : new GameState();
        this.goalLibrary = data.goalLibrary || [];
        this.rewards = data.rewards || [];
        this.categories = data.categories || [];
        this.settings = {
            autosaveEnabled: data.settings?.autosaveEnabled !== undefined ? data.settings.autosaveEnabled : true,
            autosaveInterval: data.settings?.autosaveInterval || 30000, // 30 seconds
            showSaveIndicator: data.settings?.showSaveIndicator !== undefined ? data.settings.showSaveIndicator : true,
            backupEnabled: data.settings?.backupEnabled !== undefined ? data.settings.backupEnabled : true
        };
        this.metadata = {
            totalPlayTime: data.metadata?.totalPlayTime || 0,
            totalGoalsCompleted: data.metadata?.totalGoalsCompleted || 0,
            totalRewardsClaimed: data.metadata?.totalRewardsClaimed || 0,
            lastBackup: data.metadata?.lastBackup || null
        };
    }

    /**
     * Initialize with default data
     */
    initializeDefaults() {
        // Initialize predefined categories
        this.categories = Category.getPredefinedCategories();

        // Initialize default goals
        this.goalLibrary = [
            new Goal({
                text: "Exercise for 30 minutes",
                categories: ['health'],
                state: 'to-do',
                isRenewable: true,
                cooldownPeriod: 24,
                difficulty: 'medium'
            }),
            new Goal({
                text: "Read for 20 minutes",
                categories: ['hobbies', 'study'],
                state: 'to-do',
                isRenewable: true,
                cooldownPeriod: 24,
                difficulty: 'easy'
            }),
            new Goal({
                text: "Learn a new word",
                categories: ['skills', 'study'],
                state: 'to-do',
                isRenewable: true,
                cooldownPeriod: 12,
                difficulty: 'easy'
            }),
            new Goal({
                text: "Plan next week's meals",
                categories: ['health'],
                state: 'to-do',
                isRenewable: false,
                difficulty: 'medium'
            }),
            new Goal({
                text: "Call a friend or family member",
                categories: ['social'],
                state: 'to-do',
                isRenewable: true,
                cooldownPeriod: 48,
                difficulty: 'easy'
            })
        ];

        // Initialize default rewards
        this.rewards = [
            new Reward({
                description: "Buy a coffee",
                category: 'treat'
            }),
            new Reward({
                description: "Watch an episode of a show",
                category: 'entertainment'
            }),
            new Reward({
                description: "Take a 15-minute break",
                category: 'rest'
            })
        ];
    }

    /**
     * Add a goal to the library
     */
    addGoal(goalData) {
        const goal = new Goal(goalData);
        this.goalLibrary.push(goal);
        this.updateCategoryGoalCounts();
        this.lastModified = new Date();
        return goal;
    }

    /**
     * Remove a goal from the library
     */
    removeGoal(goalId) {
        const index = this.goalLibrary.findIndex(g => g.id === goalId);
        if (index !== -1) {
            const goal = this.goalLibrary[index];
            this.goalLibrary.splice(index, 1);
            this.updateCategoryGoalCounts();
            this.lastModified = new Date();
            return goal;
        }
        return null;
    }

    /**
     * Update a goal in the library
     */
    updateGoal(goalId, updates) {
        const goal = this.goalLibrary.find(g => g.id === goalId);
        if (goal) {
            Object.assign(goal, updates);
            this.updateCategoryGoalCounts();
            this.lastModified = new Date();
            return goal;
        }
        return null;
    }

    /**
     * Add a reward
     */
    addReward(rewardData) {
        const reward = new Reward(rewardData);
        this.rewards.push(reward);
        this.lastModified = new Date();
        return reward;
    }

    /**
     * Remove a reward
     */
    removeReward(rewardId) {
        const index = this.rewards.findIndex(r => r.id === rewardId);
        if (index !== -1) {
            const reward = this.rewards[index];
            this.rewards.splice(index, 1);
            this.lastModified = new Date();
            return reward;
        }
        return null;
    }

    /**
     * Add a category
     */
    addCategory(categoryData) {
        const category = new Category(categoryData);
        this.categories.push(category);
        this.lastModified = new Date();
        return category;
    }

    /**
     * Remove a category
     */
    removeCategory(categoryId) {
        const index = this.categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
            const category = this.categories[index];
            if (!category.isInUse()) {
                this.categories.splice(index, 1);
                this.lastModified = new Date();
                return category;
            }
        }
        return null;
    }

    /**
     * Update category goal counts
     */
    updateCategoryGoalCounts() {
        // Reset all counts
        this.categories.forEach(category => {
            category.goalCount = 0;
        });

        // Count goals per category
        this.goalLibrary.forEach(goal => {
            goal.categories.forEach(categoryId => {
                const category = this.categories.find(c => c.id === categoryId);
                if (category) {
                    category.incrementGoalCount();
                }
            });
        });
    }

    /**
     * Get available goals for grid population
     */
    getAvailableGoals() {
        return this.goalLibrary.filter(goal => goal.isAvailable());
    }

    /**
     * Get goals by state
     */
    getGoalsByState(state) {
        return this.goalLibrary.filter(goal => goal.state === state);
    }

    /**
     * Get available rewards
     */
    getAvailableRewards() {
        return this.rewards.filter(reward => reward.isAvailable());
    }

    /**
     * Convert to plain object for Phaser data storage
     */
    toObject() {
        return {
            version: this.version,
            lastModified: this.lastModified,
            gameState: this.gameState.toObject(),
            goalLibrary: this.goalLibrary.map(goal => goal.toObject()),
            rewards: this.rewards.map(reward => reward.toObject()),
            categories: this.categories.map(category => category.toObject()),
            settings: { ...this.settings },
            metadata: { ...this.metadata }
        };
    }

    /**
     * Create ApplicationState from plain object
     */
    static fromObject(data) {
        const appState = new ApplicationState(data);
        
        // Reconstruct goal objects
        if (data.goalLibrary) {
            appState.goalLibrary = data.goalLibrary.map(goalData => 
                Goal.fromObject(goalData)
            );
        }
        
        // Reconstruct reward objects
        if (data.rewards) {
            appState.rewards = data.rewards.map(rewardData => 
                Reward.fromObject(rewardData)
            );
        }
        
        // Reconstruct category objects
        if (data.categories) {
            appState.categories = data.categories.map(categoryData => 
                Category.fromObject(categoryData)
            );
        }
        
        return appState;
    }

    // Get available goals for grid population
    getAvailableGoals() {
        return this.goalLibrary.filter(goal => {
            // Must be in 'to-do' state
            if (goal.state !== 'to-do') return false;
            
            // If renewable, check cooldown
            if (goal.isRenewable && goal.lastCompletedAt) {
                const cooldownMs = goal.cooldownPeriod * 60 * 60 * 1000; // Convert hours to ms
                const timeSinceCompletion = Date.now() - goal.lastCompletedAt.getTime();
                return timeSinceCompletion >= cooldownMs;
            }
            
            // If not renewable, check if it hasn't been completed yet
            if (!goal.isRenewable) {
                return !goal.completedAt;
            }
            
            return true;
        });
    }

    // Get goals by state
    getGoalsByState(state) {
        return this.goalLibrary.filter(goal => goal.state === state);
    }

    // Get available rewards
    getAvailableRewards() {
        return this.rewards.filter(reward => !reward.claimed);
    }
}
