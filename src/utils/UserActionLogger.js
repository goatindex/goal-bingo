/**
 * User Action Tracking System for Goal Bingo
 * Tracks user interactions and behavior patterns for debugging
 */

export class UserActionLogger {
    constructor(game, logger) {
        this.game = game;
        this.logger = logger;
        this.actions = [];
        this.maxActions = 1000; // Keep last 1000 actions
        this.isTracking = false;
        this.isInitialized = false;
    }

    /**
     * Initialize the user action logger
     * ARCHITECTURE NOTE: UserActionLogger has fundamental limitations in Phaser 3
     * Input events are scene-specific and cannot be tracked globally
     * This logger provides basic functionality but cannot track input events
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.logger) {
            this.logger.info('User action logging setup complete', {
                maxActions: this.maxActions,
                isTracking: this.isTracking
            }, 'UserActionLogger');
        }
        
        // ARCHITECTURE NOTE: setupUserActionLogging() is limited due to Phaser 3 architecture
        // Input events must be tracked within individual scenes, not globally
        this.setupUserActionLogging();
        
        // Start tracking automatically after initialization
        this.startTracking();
        
        this.isInitialized = true;
        
        return Promise.resolve();
    }

    /**
     * Start tracking user actions
     */
    startTracking() {
        if (this.isTracking) {
            this.logger.warn('User action tracking already started', null, 'UserActionLogger');
            return;
        }
        
        this.isTracking = true;
        this.logger.info('User action tracking started', {
            maxActions: this.maxActions
        }, 'UserActionLogger');
    }

    /**
     * Stop tracking user actions
     */
    stopTracking() {
        this.isTracking = false;
        this.logger.info('User action tracking stopped', {
            totalActions: this.actions.length
        }, 'UserActionLogger');
    }

    /**
     * Set up user action logging hooks
     */
    setupUserActionLogging() {
        // Check if game and scene manager are available
        // With READY event, this should always be available when called
        if (!this.game || !this.game.scene) {
            this.logger.warn('Scene manager not available during setup - will retry', null, 'UserActionLogger');
            // Retry after a short delay using setTimeout
            setTimeout(() => {
                this.setupUserActionLogging();
            }, 100);
            return;
        }

        // Note: Scene transition events (START, STOP) should be monitored
        // from within each individual scene using this.events.on(), not globally from the scene manager.
        // Global scene manager events are limited and don't include these lifecycle events.

        // Note: Input events are scene-specific and cannot be tracked globally
        // This logger will be initialized within each scene to track input events
        // Global input tracking is not possible in Phaser 3
        this.logger.info('UserActionLogger setup complete - input events will be tracked per scene', {}, 'UserActionLogger');

        // ARCHITECTURE NOTE: Keyboard events are also scene-specific in Phaser 3
        // The game.input.keyboard object exists globally but events must be listened to
        // within scene context. Global keyboard tracking is not supported.
        // This is a fundamental Phaser 3 architecture constraint.
        this.logger.info('Keyboard event tracking disabled - requires scene-specific implementation', {}, 'UserActionLogger');

        this.logger.info('User action logging setup complete', {
            maxActions: this.maxActions
        }, 'UserActionLogger');
    }

    /**
     * Log a custom user action
     */
    logAction(action, data) {
        if (!this.isTracking) return;
        
        const actionEntry = {
            action,
            data: {
                ...data,
                sessionId: this.game.sessionId || 'unknown'
            },
            timestamp: this.game.time.now,
            gameTime: this.game.time.now
        };
        
        this.actions.push(actionEntry);
        
        // Keep only the most recent actions
        if (this.actions.length > this.maxActions) {
            this.actions = this.actions.slice(-this.maxActions);
        }
        
        this.logger.debug(`User action: ${action}`, data, 'UserActionLogger');
    }

    /**
     * Log goal-related actions
     */
    logGoalAction(action, goalData) {
        this.logAction(`goal_${action}`, {
            goalId: goalData.id,
            goalText: goalData.text,
            goalState: goalData.state,
            category: goalData.category,
            timestamp: this.game.time.now
        });
    }

    /**
     * Log win-related actions
     */
    logWinAction(action, winData) {
        this.logAction(`win_${action}`, {
            pattern: winData.pattern,
            patternIndex: winData.patternIndex,
            cells: winData.cells,
            timestamp: this.game.time.now
        });
    }

    /**
     * Log reward-related actions
     */
    logRewardAction(action, rewardData) {
        this.logAction(`reward_${action}`, {
            rewardId: rewardData.id,
            rewardText: rewardData.text,
            rewardValue: rewardData.value,
            timestamp: this.game.time.now
        });
    }

    /**
     * Log data management actions
     */
    logDataAction(action, dataInfo) {
        this.logAction(`data_${action}`, {
            dataType: dataInfo.type,
            dataKey: dataInfo.key,
            dataSize: dataInfo.size,
            timestamp: this.game.time.now
        });
    }

    /**
     * Get all actions or actions filtered by criteria
     */
    getActions(filter = {}) {
        let filteredActions = [...this.actions];
        
        if (filter.action) {
            filteredActions = filteredActions.filter(action => action.action === filter.action);
        }
        
        if (filter.since) {
            filteredActions = filteredActions.filter(action => action.timestamp >= filter.since);
        }
        
        if (filter.until) {
            filteredActions = filteredActions.filter(action => action.timestamp <= filter.until);
        }
        
        if (filter.limit) {
            filteredActions = filteredActions.slice(-filter.limit);
        }
        
        return filteredActions;
    }

    /**
     * Get action statistics
     */
    getActionStats() {
        const stats = {
            totalActions: this.actions.length,
            isTracking: this.isTracking,
            actionTypes: {},
            recentActions: this.actions.slice(-10),
            timeRange: {
                first: this.actions.length > 0 ? this.actions[0].timestamp : null,
                last: this.actions.length > 0 ? this.actions[this.actions.length - 1].timestamp : null
            }
        };
        
        // Count action types
        this.actions.forEach(action => {
            stats.actionTypes[action.action] = (stats.actionTypes[action.action] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Get user behavior patterns
     */
    getUserBehaviorPatterns() {
        const patterns = {
            sceneTransitions: this.getActions({ action: 'scene_transition' }),
            goalInteractions: this.getActions({ action: /^goal_/ }),
            winEvents: this.getActions({ action: /^win_/ }),
            rewardEvents: this.getActions({ action: /^reward_/ }),
            inputEvents: this.getActions({ action: /^(pointer_|key_|gameobject_)/ })
        };
        
        return patterns;
    }

    /**
     * Clear all actions
     */
    clearActions() {
        this.actions = [];
        this.logger.info('User actions cleared', null, 'UserActionLogger');
    }

    /**
     * Export actions for debugging
     */
    exportActions() {
        const exportData = {
            sessionId: this.game.sessionId || 'unknown',
            exportedAt: new Date().toISOString(),
            phaserVersion: Phaser.VERSION,
            totalActions: this.actions.length,
            isTracking: this.isTracking,
            actions: this.actions
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goal-bingo-actions-${this.game.sessionId || 'unknown'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.logger.info('User actions exported', { actionCount: this.actions.length }, 'UserActionLogger');
    }

    /**
     * Update max actions limit
     */
    setMaxActions(maxActions) {
        this.maxActions = maxActions;
        this.logger.info('Max actions limit updated', { maxActions }, 'UserActionLogger');
    }

    /**
     * Shutdown user action logging
     */
    shutdown() {
        this.stopTracking();
        this.clearActions();
        this.logger.info('User action logging shutdown', null, 'UserActionLogger');
    }

    /**
     * ARCHITECTURE NOTE: UserActionLogger Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * Ensures all user action tracking is stopped and resources cleaned up
     */
    async destroy() {
        console.log('UserActionLogger: Starting cleanup...');
        
        try {
            // CLEANUP: Stop tracking
            this.stopTracking();
            
            // CLEANUP: Clear actions array
            this.actions = [];
            
            // CLEANUP: Reset state flags
            this.isTracking = false;
            this.isInitialized = false;
            
            // CLEANUP: Clear timeout if exists
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
                this.retryTimeout = null;
            }
            
            // LOGGING: Track cleanup completion
            console.log('UserActionLogger: Cleanup completed successfully');
            
        } catch (error) {
            console.error('UserActionLogger: Error during cleanup:', error);
            throw error;
        }
    }
}
