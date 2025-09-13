/**
 * Event Manager for Phaser Game Events
 * ARCHITECTURE NOTE: This follows the Event Listener Management Pattern
 * Provides centralized event listener registration and cleanup
 * Prevents memory leaks and duplicate event listeners during hot reload
 */
export class EventManager {
    constructor() {
        this.listeners = new Map();
        this.isInitialized = false;
    }
    
    /**
     * Register event listener with automatic cleanup tracking
     * ARCHITECTURE NOTE: All event listeners are tracked for cleanup
     * This ensures no orphaned listeners remain after game destruction
     * 
     * @param {Phaser.Game} game - The game instance
     * @param {string} event - The event name
     * @param {Function} callback - The event callback
     * @param {Object} context - The callback context
     */
    addListener(game, event, callback, context = null) {
        if (!game || !game.events) {
            console.warn('EventManager: Game or game.events not available');
            return;
        }
        
        // Register the event listener
        if (context) {
            game.events.once(event, callback, context);
        } else {
            game.events.once(event, callback);
        }
        
        // Track for cleanup
        if (!this.listeners.has(game)) {
            this.listeners.set(game, []);
        }
        this.listeners.get(game).push({ event, callback, context });
        
        // LOGGING: Track event registration for debugging
        if (window.logger) {
            window.logger.debug('Event listener registered', { 
                event, 
                hasContext: !!context,
                totalListeners: this.listeners.get(game).length
            }, 'EventManager');
        }
    }
    
    /**
     * Clean up all event listeners for a specific game instance
     * ARCHITECTURE NOTE: This method ensures complete cleanup of event listeners
     * Prevents memory leaks and duplicate event handling
     * 
     * @param {Phaser.Game} game - The game instance to clean up
     */
    cleanup(game) {
        if (!this.listeners.has(game)) {
            return;
        }
        
        const gameListeners = this.listeners.get(game);
        console.log(`Cleaning up ${gameListeners.length} event listeners...`);
        
        gameListeners.forEach(({ event, callback, context }) => {
            try {
                if (context) {
                    game.events.off(event, callback, context);
                } else {
                    game.events.off(event, callback);
                }
            } catch (error) {
                console.error(`Error removing event listener for ${event}:`, error);
            }
        });
        
        this.listeners.delete(game);
        
        // LOGGING: Track cleanup completion
        if (window.logger) {
            window.logger.debug('Event listeners cleaned up', { 
                listenersRemoved: gameListeners.length,
                remainingGames: this.listeners.size
            }, 'EventManager');
        }
    }
    
    /**
     * Clean up all event listeners for all game instances
     * ARCHITECTURE NOTE: Nuclear option for complete cleanup
     * Use when shutting down the entire application
     */
    cleanupAll() {
        console.log('Cleaning up all event listeners...');
        
        for (const [game, listeners] of this.listeners) {
            this.cleanup(game);
        }
        
        this.listeners.clear();
    }
}

// Singleton instance
export const eventManager = new EventManager();
