/**
 * StateManager - Centralized state management using Phaser's Data Manager
 * Integrates with Phaser's built-in event system for state updates
 */
import { ApplicationState } from '../models/ApplicationState.js';

export class StateManager {
    constructor(game, logger = null) {
        this.game = game;
        this.logger = logger;
        this.appState = null;
        this.isInitialized = false;
        
        // Create a custom data manager for global game data
        this.dataManager = new Phaser.Data.DataManager(this.game, this.game.events);
        
        // Set up event listeners for Phaser data events
        this.setupDataEventListeners();
        
        if (this.logger) {
            this.logger.info('StateManager created', { hasLogger: !!this.logger }, 'StateManager');
        }
    }

    /**
     * Initialize the state manager with default or loaded data
     */
    async initialize(loadedData = null) {
        try {
            if (loadedData) {
                this.appState = ApplicationState.fromObject(loadedData);
            } else {
                this.appState = new ApplicationState();
                this.appState.initializeDefaults();
            }

            // Store the application state in our custom Data Manager
            this.dataManager.set('appState', this.appState);
            this.dataManager.set('goals', this.appState.goalLibrary);
            this.dataManager.set('rewards', this.appState.rewards);
            this.dataManager.set('categories', this.appState.categories);
            this.dataManager.set('gameState', this.appState.gameState);
            this.dataManager.set('settings', this.appState.settings);
            this.dataManager.set('metadata', this.appState.metadata);

            if (this.logger) {
                this.logger.info('Application state initialized and stored in Phaser Data Manager', {
                    hasAppState: !!this.appState,
                    dataKeys: Object.keys(this.dataManager.list)
                }, 'StateManager');
            }

            this.isInitialized = true;
            
            // Emit initialization complete event
            this.game.events.emit('stateInitialized', this.appState);
            
            if (this.logger) {
                this.logger.info('StateManager initialized successfully', {
                    isInitialized: this.isInitialized
                }, 'StateManager');
            }
            return this.appState;
        } catch (error) {
            if (this.logger) {
                this.logger.error('Failed to initialize StateManager', { error: error.message }, 'StateManager');
            }
            throw error;
        }
    }

    /**
     * Set up Phaser data event listeners
     */
    setupDataEventListeners() {
        // Listen for Phaser data events on our custom data manager's event emitter
        this.dataManager.events.on(Phaser.Data.Events.SET_DATA, (parent, key, data) => {
            console.log(`StateManager: Data set - ${key}:`, data);
            this.handleDataSet(key, data);
        });

        this.dataManager.events.on(Phaser.Data.Events.CHANGE_DATA, (parent, key, data, previousData) => {
            console.log(`StateManager: Data changed - ${key}:`, data, 'Previous:', previousData);
            this.handleDataChange(key, data, previousData);
        });

        this.dataManager.events.on(Phaser.Data.Events.REMOVE_DATA, (parent, key, data) => {
            console.log(`StateManager: Data removed - ${key}:`, data);
            this.handleDataRemove(key, data);
        });

        console.log('StateManager: Phaser data event listeners setup');
    }

    /**
     * Handle data changes and emit custom events
     */
    handleDataChange(key, value, previousValue) {
        if (!this.isInitialized) return;

        // Update the application state
        this.updateApplicationState(key, value);

        // Emit specific events based on what changed
        switch (key) {
            case 'goals':
                this.game.events.emit('goalsChanged', value, previousValue);
                break;
            case 'rewards':
                this.game.events.emit('rewardsChanged', value, previousValue);
                break;
            case 'categories':
                this.game.events.emit('categoriesChanged', value, previousValue);
                break;
            case 'gameState':
                this.game.events.emit('gameStateChanged', value, previousValue);
                break;
            case 'settings':
                this.game.events.emit('settingsChanged', value, previousValue);
                break;
        }

        // Emit general data changed event
        this.game.events.emit('dataChanged', key, value, previousValue);
    }

    /**
     * Handle new data being set
     */
    handleDataSet(key, value) {
        if (!this.isInitialized) return;
        this.game.events.emit('dataSet', key, value);
    }

    /**
     * Handle data being removed
     */
    handleDataRemove(key, data) {
        if (!this.isInitialized) return;
        this.game.events.emit('dataRemoved', key, data);
    }

    /**
     * Update the application state when Phaser data changes
     */
    updateApplicationState(key, value) {
        if (!this.appState) return;

        switch (key) {
            case 'goals':
                this.appState.goalLibrary = value;
                break;
            case 'rewards':
                this.appState.rewards = value;
                break;
            case 'categories':
                this.appState.categories = value;
                break;
            case 'gameState':
                this.appState.gameState = value;
                break;
            case 'settings':
                this.appState.settings = value;
                break;
            case 'metadata':
                this.appState.metadata = value;
                break;
        }
        
        this.appState.lastModified = new Date();
    }

    /**
     * Get the complete application state
     */
    getApplicationState() {
        return this.appState;
    }

    /**
     * Get goals
     */
    getGoals() {
        return this.appState?.goalLibrary || [];
    }

    /**
     * Get rewards
     */
    getRewards() {
        return this.appState?.rewards || [];
    }

    /**
     * Get categories
     */
    getCategories() {
        return this.appState?.categories || [];
    }

    /**
     * Get game state
     */
    getGameState() {
        return this.appState?.gameState || {};
    }

    /**
     * Get settings
     */
    getSettings() {
        return this.appState?.settings || {};
    }

    /**
     * Get metadata
     */
    getMetadata() {
        return this.appState?.metadata || {};
    }

    /**
     * Update goals and trigger events
     */
    updateGoals(goals) {
        this.dataManager.set('goals', goals);
    }

    /**
     * Update rewards and trigger events
     */
    updateRewards(rewards) {
        this.dataManager.set('rewards', rewards);
    }

    /**
     * Update categories and trigger events
     */
    updateCategories(categories) {
        this.dataManager.set('categories', categories);
    }

    /**
     * Update game state and trigger events
     */
    updateGameState(gameState) {
        this.dataManager.set('gameState', gameState);
    }

    /**
     * Update settings and trigger events
     */
    updateSettings(settings) {
        this.dataManager.set('settings', settings);
    }

    /**
     * Add a goal
     */
    addGoal(goalData) {
        const goal = this.appState.addGoal(goalData);
        this.updateGoals(this.appState.goalLibrary);
        return goal;
    }

    /**
     * Remove a goal
     */
    removeGoal(goalId) {
        const goal = this.appState.removeGoal(goalId);
        if (goal) {
            this.updateGoals(this.appState.goalLibrary);
        }
        return goal;
    }

    /**
     * Update a goal
     */
    updateGoal(goalId, updates) {
        const goal = this.appState.updateGoal(goalId, updates);
        if (goal) {
            this.updateGoals(this.appState.goalLibrary);
        }
        return goal;
    }

    /**
     * Add a reward
     */
    addReward(rewardData) {
        const reward = this.appState.addReward(rewardData);
        this.updateRewards(this.appState.rewards);
        return reward;
    }

    /**
     * Remove a reward
     */
    removeReward(rewardId) {
        const reward = this.appState.removeReward(rewardId);
        if (reward) {
            this.updateRewards(this.appState.rewards);
        }
        return reward;
    }

    /**
     * Get available goals for grid population
     */
    getAvailableGoals() {
        if (!this.appState) return [];
        
        // Get goals that are in 'to-do' state and available for use
        const goals = this.getGoals();
        return goals.filter(goal => {
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

    /**
     * Get goals by state
     */
    getGoalsByState(state) {
        return this.appState.getGoalsByState(state);
    }

    /**
     * Get available rewards
     */
    getAvailableRewards() {
        return this.appState.getAvailableRewards();
    }

    /**
     * Export current state for persistence
     */
    exportState() {
        return this.appState.toObject();
    }

    /**
     * Import state from persistence
     */
    importState(stateData) {
        this.appState = ApplicationState.fromObject(stateData);
        this.dataManager.set('appState', this.appState);
        this.dataManager.set('goals', this.appState.goalLibrary);
        this.dataManager.set('rewards', this.appState.rewards);
        this.dataManager.set('categories', this.appState.categories);
        this.dataManager.set('gameState', this.appState.gameState);
        this.dataManager.set('settings', this.appState.settings);
        this.dataManager.set('metadata', this.appState.metadata);
        
        this.game.events.emit('stateImported', this.appState);
    }

    /**
     * Cleanup and shutdown
     */
    shutdown() {
        this.dataManager.events.removeAllListeners();
        this.game.events.removeAllListeners();
        this.appState = null;
        this.isInitialized = false;
    }

    /**
     * ARCHITECTURE NOTE: StateManager Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * 
     * PHASER ARCHITECTURE CLARIFICATION:
     * - StateManager uses this.dataManager.events (Phaser's Data Manager event system)
     * - We created this.dataManager ourselves, so we must clean it up
     * - We should NOT call this.events.removeAllListeners() because this.events doesn't exist
     * - We should clean up this.dataManager.events because we created the dataManager
     * - Only clean up resources we explicitly created (dataManager, appState, state flags)
     */
    async destroy() {
        console.log('StateManager: Starting cleanup...');
        
        try {
            // CLEANUP: Clear data manager (we created this, so we clean it up)
            if (this.dataManager) {
                // Clean up the data manager's event listeners
                this.dataManager.events.removeAllListeners();
                this.dataManager = null;
            }
            
            // CLEANUP: Clear application state
            this.appState = null;
            
            // CLEANUP: Reset state flags
            this.isInitialized = false;
            
            // ARCHITECTURE NOTE: We do NOT clean up this.game.events because:
            // 1. StateManager uses this.dataManager.events (which we clean up above)
            // 2. We never created our own EventEmitter instance (this.events doesn't exist)
            // 3. Other systems may still be using this.game.events
            // 4. Phaser handles its own event cleanup automatically
            
            // LOGGING: Track cleanup completion
            console.log('StateManager: Cleanup completed successfully');
            
        } catch (error) {
            console.error('StateManager: Error during cleanup:', error);
            throw error;
        }
    }
}
