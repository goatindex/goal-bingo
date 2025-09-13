/**
 * Centralized Logging System for Goal Bingo
 * Integrates with Phaser's event system for comprehensive debugging and monitoring
 */

export class Logger {
    constructor(game, config = {}) {
        this.game = game;
        this.config = {
            level: config.level || 'info',
            enablePhaserEvents: config.enablePhaserEvents || false,
            enablePerformance: config.enablePerformance || false,
            enableUserActions: config.enableUserActions || false,
            maxLogEntries: config.maxLogEntries || 1000,
            ...config
        };
        
        this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
        this.logs = [];
        this.sessionId = this.generateSessionId();
        this.isInitialized = false;
        
        console.log(`[Logger] Initialized with level: ${this.config.level}, session: ${this.sessionId}`);
    }

    /**
     * Initialize the logger after game systems are ready
     * ARCHITECTURE NOTE: Logger can be initialized at READY because it only needs game.events
     * This follows the Lazy Initialization Pattern from our timing architecture
     * Logger is a core system with minimal dependencies
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.logger) {
            this.logger.info('Logger setup complete', {
                isInitialized: this.isInitialized
            }, 'Logger');
        }
        
        // ARCHITECTURE NOTE: Phaser event logging requires game.events to be available
        // This is safe at READY timing as game.events is available
        if (this.config.enablePhaserEvents) {
            this.setupPhaserEventLogging();
        }
        
        this.isInitialized = true;
        
        return Promise.resolve();
    }

    /**
     * Generate a unique session ID for this game session
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Main logging method with structured format
     */
    log(level, message, data = null, source = 'Unknown') {
        if (this.levels[level] <= this.levels[this.config.level]) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level: level.toUpperCase(),
                source,
                message,
                data,
                sessionId: this.sessionId,
                phaserVersion: Phaser.VERSION
            };
            
            // Add to internal log storage
            this.logs.push(logEntry);
            
            // Keep only the most recent logs
            if (this.logs.length > this.config.maxLogEntries) {
                this.logs = this.logs.slice(-this.config.maxLogEntries);
            }
            
            // Output to console with appropriate method
            const consoleMethod = console[level] || console.log;
            consoleMethod(`[${timestamp}] [${level.toUpperCase()}] [${source}] ${message}`, data || '');
            
            // Emit to Phaser events for debugging
            this.game.events.emit('log', logEntry);
        }
    }

    /**
     * Convenience methods for different log levels
     */
    error(message, data, source) { 
        this.log('error', message, data, source); 
    }
    
    warn(message, data, source) { 
        this.log('warn', message, data, source); 
    }
    
    info(message, data, source) { 
        this.log('info', message, data, source); 
    }
    
    debug(message, data, source) { 
        this.log('debug', message, data, source); 
    }

    /**
     * Set up Phaser event logging for comprehensive debugging
     */
    setupPhaserEventLogging() {
        // Check if game and scene manager are available
        // With READY event, this should always be available when called
        if (!this.game || !this.game.scene || !this.game.scene.events) {
            this.error('Scene manager not available during setup - this should not happen with READY timing', null, 'Logger');
            return;
        }

        // Note: Scene lifecycle events (CREATE, DESTROY, START, STOP) should be monitored
        // from within each individual scene using this.events.on(), not globally from the scene manager.
        // Global scene manager events are limited and don't include these lifecycle events.

        // Log game events using proper Phaser constants
        this.game.events.on(Phaser.Core.Events.READY, () => {
            this.info('Game ready', { phaserVersion: Phaser.VERSION }, 'Game');
        });

        this.game.events.on(Phaser.Core.Events.BLUR, () => {
            this.info('Game blurred', { timestamp: Date.now() }, 'Game');
        });

        this.game.events.on(Phaser.Core.Events.FOCUS, () => {
            this.info('Game focused', { timestamp: Date.now() }, 'Game');
        });

        this.game.events.on(Phaser.Core.Events.HIDDEN, () => {
            this.info('Game hidden', { timestamp: Date.now() }, 'Game');
        });

        this.debug('Phaser event logging enabled', null, 'Logger');
    }

    /**
     * Get all logs or logs filtered by level/source
     */
    getLogs(filter = {}) {
        let filteredLogs = [...this.logs];
        
        if (filter.level) {
            filteredLogs = filteredLogs.filter(log => log.level === filter.level.toUpperCase());
        }
        
        if (filter.source) {
            filteredLogs = filteredLogs.filter(log => log.source === filter.source);
        }
        
        if (filter.since) {
            const sinceTime = new Date(filter.since).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= sinceTime);
        }
        
        return filteredLogs;
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        this.info('Logs cleared', null, 'Logger');
    }

    /**
     * Export logs for debugging
     */
    exportLogs() {
        const exportData = {
            sessionId: this.sessionId,
            exportedAt: new Date().toISOString(),
            phaserVersion: Phaser.VERSION,
            config: this.config,
            logs: this.logs
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goal-bingo-logs-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.info('Logs exported', { logCount: this.logs.length }, 'Logger');
    }

    /**
     * Update log level at runtime
     */
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.config.level = level;
            this.info(`Log level changed to: ${level}`, null, 'Logger');
        } else {
            this.warn(`Invalid log level: ${level}`, { validLevels: Object.keys(this.levels) }, 'Logger');
        }
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Shutdown logger and clean up
     */
    shutdown() {
        this.game.events.removeAllListeners('log');
        this.logs = [];
        this.info('Logger shutdown', null, 'Logger');
    }

    /**
     * ARCHITECTURE NOTE: Logger Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * 
     * PHASER ARCHITECTURE CLARIFICATION:
     * - Logger uses this.game.events (Phaser's built-in event system)
     * - Phaser automatically handles cleanup of its own event system
     * - We should NOT call this.events.removeAllListeners() because this.events doesn't exist
     * - We should NOT call this.game.events.removeAllListeners() because that would break other systems
     * - Only clean up resources we explicitly created (logs array, state flags)
     */
    async destroy() {
        console.log('Logger: Starting cleanup...');
        
        try {
            // CLEANUP: Clear logs array to free memory
            // This is the only resource we explicitly created that needs cleanup
            this.logs = [];
            
            // CLEANUP: Reset state flags
            this.isInitialized = false;
            this.sessionId = null;
            
            // ARCHITECTURE NOTE: We do NOT clean up this.game.events because:
            // 1. Logger uses Phaser's built-in event system (this.game.events)
            // 2. Phaser handles its own event cleanup automatically
            // 3. Other systems may still be using this.game.events
            // 4. We never created our own EventEmitter instance (this.events doesn't exist)
            
            // LOGGING: Track cleanup completion
            console.log('Logger: Cleanup completed successfully - destroy() method called');
            
        } catch (error) {
            console.error('Logger: Error during cleanup:', error);
            throw error;
        }
    }
}
