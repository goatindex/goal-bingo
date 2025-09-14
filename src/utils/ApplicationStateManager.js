/**
 * ApplicationStateManager - Domain logic utility class that works with Phaser's built-in data system
 * 
 * This utility class provides domain-specific methods for managing application state
 * using Phaser's built-in game.registry DataManager. It replaces the DataManagerPlugin
 * by working directly with Phaser's core data management capabilities.
 * 
 * @since 1.0.0
 */
import { ApplicationState } from '../models/ApplicationState.js';

export class ApplicationStateManager {
    
    /**
     * Creates an instance of ApplicationStateManager
     * 
     * @param {Phaser.Game} game - Reference to the Phaser game instance
     */
    constructor(game) {
        this.game = game;
        this.appState = null;
        this.isInitialized = false;
        
        // Data keys for the application state
        this.dataKeys = {
            appState: 'appState',
            goals: 'goals',
            rewards: 'rewards',
            categories: 'categories',
            gameState: 'gameState',
            settings: 'settings',
            metadata: 'metadata'
        };
    }
    
    /**
     * Initialize the application state with default or loaded data
     * 
     * @param {Object} loadedData - Optional loaded data to initialize with
     */
    async initialize(loadedData = null) {
        try {
            if (loadedData) {
                this.appState = ApplicationState.fromObject(loadedData);
            } else {
                this.appState = new ApplicationState();
                this.appState.initializeDefaults();
            }

            // Store the application state in Phaser's game.registry
            this.game.registry.set(this.dataKeys.appState, this.appState);
            this.game.registry.set(this.dataKeys.goals, this.appState.goalLibrary);
            this.game.registry.set(this.dataKeys.rewards, this.appState.rewards);
            this.game.registry.set(this.dataKeys.categories, this.appState.categories);
            this.game.registry.set(this.dataKeys.gameState, this.appState.gameState);
            this.game.registry.set(this.dataKeys.settings, this.appState.settings);
            this.game.registry.set(this.dataKeys.metadata, this.appState.metadata);

            // Set up data change event handling
            this.setupDataIntegration();

            this.isInitialized = true;
            
            // Emit initialization complete event
            this.game.events.emit('stateInitialized', this.appState);
            
            console.log('ApplicationStateManager initialized successfully', {
                hasAppState: !!this.appState,
                dataKeys: Object.keys(this.game.registry.list)
            });
            
        } catch (error) {
            console.error('Failed to initialize ApplicationStateManager:', error);
            throw error;
        }
    }
    
    /**
     * Set up data change event handling with Phaser's game.registry
     */
    setupDataIntegration() {
        // Listen to data changes and emit application events
        this.game.registry.events.on('changedata', (parent, key, value, previousValue) => {
            console.log(`Data changed: ${key}`, value);
            
            // Update the application state
            this.updateApplicationState(key, value);
            
            // Emit specific events based on what changed
            switch (key) {
                case this.dataKeys.goals:
                    this.game.events.emit('goalsChanged', value, previousValue);
                    break;
                case this.dataKeys.rewards:
                    this.game.events.emit('rewardsChanged', value, previousValue);
                    break;
                case this.dataKeys.categories:
                    this.game.events.emit('categoriesChanged', value, previousValue);
                    break;
                case this.dataKeys.gameState:
                    this.game.events.emit('gameStateChanged', value, previousValue);
                    break;
                case this.dataKeys.settings:
                    this.game.events.emit('settingsChanged', value, previousValue);
                    break;
            }
            
            // Emit general data changed event
            this.game.events.emit('dataChanged', key, value, previousValue);
        });
    }
    
    /**
     * Update the application state when Phaser data changes
     * 
     * @param {string} key - The data key
     * @param {any} value - The new value
     */
    updateApplicationState(key, value) {
        if (!this.appState) return;

        switch (key) {
            case this.dataKeys.goals:
                this.appState.goalLibrary = value;
                break;
            case this.dataKeys.rewards:
                this.appState.rewards = value;
                break;
            case this.dataKeys.categories:
                this.appState.categories = value;
                break;
            case this.dataKeys.gameState:
                this.appState.gameState = value;
                break;
            case this.dataKeys.settings:
                this.appState.settings = value;
                break;
            case this.dataKeys.metadata:
                this.appState.metadata = value;
                break;
        }
        
        this.appState.lastModified = new Date();
    }
    
    // ===== PUBLIC API METHODS =====
    
    /**
     * Get the complete application state
     * 
     * @returns {ApplicationState} The application state
     */
    getApplicationState() {
        return this.appState;
    }
    
    /**
     * Get goals
     * 
     * @returns {Array} Array of goals
     */
    getGoals() {
        return this.game.registry.get(this.dataKeys.goals) || [];
    }
    
    /**
     * Get rewards
     * 
     * @returns {Array} Array of rewards
     */
    getRewards() {
        return this.game.registry.get(this.dataKeys.rewards) || [];
    }
    
    /**
     * Get categories
     * 
     * @returns {Array} Array of categories
     */
    getCategories() {
        return this.game.registry.get(this.dataKeys.categories) || [];
    }
    
    /**
     * Get game state
     * 
     * @returns {Object} Game state object
     */
    getGameState() {
        return this.game.registry.get(this.dataKeys.gameState) || {};
    }
    
    /**
     * Get settings
     * 
     * @returns {Object} Settings object
     */
    getSettings() {
        return this.game.registry.get(this.dataKeys.settings) || {};
    }
    
    /**
     * Get metadata
     * 
     * @returns {Object} Metadata object
     */
    getMetadata() {
        return this.game.registry.get(this.dataKeys.metadata) || {};
    }
    
    /**
     * Update goals and trigger events
     * 
     * @param {Array} goals - New goals array
     */
    updateGoals(goals) {
        this.game.registry.set(this.dataKeys.goals, goals);
    }
    
    /**
     * Update rewards and trigger events
     * 
     * @param {Array} rewards - New rewards array
     */
    updateRewards(rewards) {
        this.game.registry.set(this.dataKeys.rewards, rewards);
    }
    
    /**
     * Update categories and trigger events
     * 
     * @param {Array} categories - New categories array
     */
    updateCategories(categories) {
        this.game.registry.set(this.dataKeys.categories, categories);
    }
    
    /**
     * Update game state and trigger events
     * 
     * @param {Object} gameState - New game state object
     */
    updateGameState(gameState) {
        try {
            console.log('ApplicationStateManager: updateGameState() called with:', gameState);
            console.log('ApplicationStateManager: Game registry available:', !!this.game.registry);
            console.log('ApplicationStateManager: Data key for gameState:', this.dataKeys.gameState);
            
            this.game.registry.set(this.dataKeys.gameState, gameState);
            console.log('ApplicationStateManager: Game state updated successfully');
        } catch (error) {
            console.error('ApplicationStateManager: Error in updateGameState():', error);
            console.error('ApplicationStateManager: Error stack:', error.stack);
            throw error;
        }
    }
    
    /**
     * Update settings and trigger events
     * 
     * @param {Object} settings - New settings object
     */
    updateSettings(settings) {
        this.game.registry.set(this.dataKeys.settings, settings);
    }
    
    /**
     * Add a goal
     * 
     * @param {Object} goalData - Goal data
     * @returns {Object} The created goal
     */
    addGoal(goalData) {
        const goal = this.appState.addGoal(goalData);
        this.updateGoals(this.appState.goalLibrary);
        return goal;
    }
    
    /**
     * Remove a goal
     * 
     * @param {string} goalId - Goal ID to remove
     * @returns {Object|null} The removed goal or null
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
     * 
     * @param {string} goalId - Goal ID to update
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} The updated goal or null
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
     * 
     * @param {Object} rewardData - Reward data
     * @returns {Object} The created reward
     */
    addReward(rewardData) {
        const reward = this.appState.addReward(rewardData);
        this.updateRewards(this.appState.rewards);
        return reward;
    }
    
    /**
     * Remove a reward
     * 
     * @param {string} rewardId - Reward ID to remove
     * @returns {Object|null} The removed reward or null
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
     * 
     * @returns {Array} Array of available goals
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
     * 
     * @param {string} state - Goal state to filter by
     * @returns {Array} Array of goals in the specified state
     */
    getGoalsByState(state) {
        return this.appState.getGoalsByState(state);
    }
    
    /**
     * Get available rewards
     * 
     * @returns {Array} Array of available rewards
     */
    getAvailableRewards() {
        return this.appState.getAvailableRewards();
    }
    
    /**
     * Export current state for persistence
     * 
     * @returns {Object} Exported state data
     */
    exportState() {
        return this.appState.toObject();
    }
    
    /**
     * Import state from persistence
     * 
     * @param {Object} stateData - State data to import
     */
    importState(stateData) {
        this.appState = ApplicationState.fromObject(stateData);
        this.game.registry.set(this.dataKeys.appState, this.appState);
        this.game.registry.set(this.dataKeys.goals, this.appState.goalLibrary);
        this.game.registry.set(this.dataKeys.rewards, this.appState.rewards);
        this.game.registry.set(this.dataKeys.categories, this.appState.categories);
        this.game.registry.set(this.dataKeys.gameState, this.appState.gameState);
        this.game.registry.set(this.dataKeys.settings, this.appState.settings);
        this.game.registry.set(this.dataKeys.metadata, this.appState.metadata);
        
        this.game.events.emit('stateImported', this.appState);
    }
    
    /**
     * Get data from Phaser's game.registry
     * 
     * @param {string} key - Data key
     * @returns {any} Data value
     */
    getData(key) {
        return this.game.registry.get(key);
    }
    
    /**
     * Set data in Phaser's game.registry
     * 
     * @param {string|Object} key - Data key or object of key-value pairs
     * @param {any} value - Data value (ignored if key is an object)
     */
    setData(key, value) {
        this.game.registry.set(key, value);
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.game && this.game.registry) {
            this.game.registry.events.off('changedata');
        }
        
        this.appState = null;
        this.isInitialized = false;
    }
}

export default ApplicationStateManager;
