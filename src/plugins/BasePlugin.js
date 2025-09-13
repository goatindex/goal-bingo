/**
 * BasePlugin - Foundation for all custom plugins in the project
 * 
 * This class extends Phaser.Plugins.BasePlugin and provides a foundation
 * for all custom plugins in the Goal Bingo project. It includes common
 * functionality and patterns that all plugins should follow.
 * 
 * @extends Phaser.Plugins.BasePlugin
 * @since 1.0.0
 */
export class BasePlugin extends Phaser.Plugins.BasePlugin {
    
    /**
     * Creates an instance of BasePlugin
     * 
     * @param {Phaser.Plugins.PluginManager} pluginManager - A reference to the Plugin Manager
     */
    constructor(pluginManager) {
        super(pluginManager);
        
        // Plugin state tracking
        this.isInitialized = false;
        this.isStarted = false;
        this.isDestroyed = false;
        
        // Plugin metadata
        this.pluginName = this.constructor.name;
        this.version = '1.0.0';
        
        // Plugin dependencies (to be overridden by subclasses)
        this.dependencies = [];
        
        // Plugin configuration (to be set during init)
        this.config = {};
        
        console.log(`[${this.pluginName}] Plugin constructor called`);
    }
    
    /**
     * Plugin initialization
     * Called by the PluginManager when the plugin is first instantiated.
     * This happens after the plugin has been created but before it has been started.
     * 
     * @param {any} [data] - Optional data to pass to the plugin during initialization
     */
    init(data = {}) {
        console.log(`[${this.pluginName}] Plugin init called with data:`, data);
        
        // Store configuration data
        this.config = { ...this.getDefaultConfig(), ...data };
        
        // Mark as initialized
        this.isInitialized = true;
        
        // Call subclass initialization if it exists
        if (typeof this.onInit === 'function') {
            this.onInit(data);
        }
        
        console.log(`[${this.pluginName}] Plugin initialized successfully`);
    }
    
    /**
     * Plugin startup
     * Called by the PluginManager when the plugin is started.
     * This happens after the plugin has been initialized and is now considered 'active'.
     */
    start() {
        console.log(`[${this.pluginName}] Plugin start called`);
        
        // Mark as started
        this.isStarted = true;
        
        // Call subclass startup if it exists
        if (typeof this.onStart === 'function') {
            this.onStart();
        }
        
        console.log(`[${this.pluginName}] Plugin started successfully`);
    }
    
    /**
     * Plugin stop
     * Called by the PluginManager when the plugin is stopped.
     * The game code has requested that your plugin stop doing whatever it does.
     * It is now considered as 'inactive' by the PluginManager.
     */
    stop() {
        console.log(`[${this.pluginName}] Plugin stop called`);
        
        // Mark as stopped
        this.isStarted = false;
        
        // Call subclass stop if it exists
        if (typeof this.onStop === 'function') {
            this.onStop();
        }
        
        console.log(`[${this.pluginName}] Plugin stopped successfully`);
    }
    
    /**
     * Plugin destruction
     * Called by the PluginManager when the plugin is destroyed.
     * This happens when the game is shut down or when the plugin is explicitly removed.
     * You should use this method to clean up any resources or listeners that your plugin has allocated.
     */
    destroy() {
        console.log(`[${this.pluginName}] Plugin destroy called`);
        
        // Mark as destroyed
        this.isDestroyed = true;
        this.isStarted = false;
        this.isInitialized = false;
        
        // Call subclass destruction if it exists
        if (typeof this.onDestroy === 'function') {
            this.onDestroy();
        }
        
        // Call parent destroy
        super.destroy();
        
        console.log(`[${this.pluginName}] Plugin destroyed successfully`);
    }
    
    /**
     * Get default configuration for the plugin
     * Override this method in subclasses to provide default configuration
     * 
     * @returns {Object} Default configuration object
     */
    getDefaultConfig() {
        return {
            enabled: true,
            debug: false
        };
    }
    
    /**
     * Check if plugin is ready for use
     * A plugin is ready when it's initialized and started
     * 
     * @returns {boolean} True if plugin is ready
     */
    isReady() {
        return this.isInitialized && this.isStarted && !this.isDestroyed;
    }
    
    /**
     * Get plugin status information
     * Useful for debugging and monitoring
     * 
     * @returns {Object} Plugin status information
     */
    getStatus() {
        return {
            name: this.pluginName,
            version: this.version,
            isInitialized: this.isInitialized,
            isStarted: this.isStarted,
            isDestroyed: this.isDestroyed,
            isReady: this.isReady(),
            dependencies: this.dependencies,
            config: this.config
        };
    }
    
    /**
     * Validate plugin dependencies
     * Checks if all required dependencies are available
     * 
     * @returns {boolean} True if all dependencies are satisfied
     */
    validateDependencies() {
        if (!this.dependencies || this.dependencies.length === 0) {
            return true;
        }
        
        for (const dependency of this.dependencies) {
            if (!this.pluginManager.get(dependency)) {
                console.error(`[${this.pluginName}] Missing required dependency: ${dependency}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Log a message with plugin context
     * Provides consistent logging format for all plugins
     * 
     * @param {string} level - Log level (info, warn, error, debug)
     * @param {string} message - Log message
     * @param {any} [data] - Optional data to include in log
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${this.pluginName}] ${message}`;
        
        if (data) {
            console[level](logMessage, data);
        } else {
            console[level](logMessage);
        }
    }
    
    /**
     * Debug log (only if debug is enabled)
     * 
     * @param {string} message - Debug message
     * @param {any} [data] - Optional data to include in log
     */
    debug(message, data = null) {
        if (this.config.debug) {
            this.log('debug', message, data);
        }
    }
    
    /**
     * Error handling wrapper
     * Provides consistent error handling for plugin operations
     * 
     * @param {Function} operation - Operation to execute
     * @param {string} operationName - Name of the operation for error context
     * @returns {any} Result of the operation or null if error occurred
     */
    safeExecute(operation, operationName = 'operation') {
        try {
            return operation();
        } catch (error) {
            this.log('error', `Error in ${operationName}:`, error);
            return null;
        }
    }
    
    /**
     * Async error handling wrapper
     * Provides consistent error handling for async plugin operations
     * 
     * @param {Function} operation - Async operation to execute
     * @param {string} operationName - Name of the operation for error context
     * @returns {Promise<any>} Result of the operation or null if error occurred
     */
    async safeExecuteAsync(operation, operationName = 'async operation') {
        try {
            return await operation();
        } catch (error) {
            this.log('error', `Error in ${operationName}:`, error);
            return null;
        }
    }
}

/**
 * Plugin lifecycle hook methods
 * These methods can be overridden by subclasses to implement custom behavior
 * at different stages of the plugin lifecycle
 */

/**
 * Called during plugin initialization
 * Override this method in subclasses to implement custom initialization logic
 * 
 * @param {any} data - Initialization data
 */
// BasePlugin.prototype.onInit = function(data) {};

/**
 * Called when plugin is started
 * Override this method in subclasses to implement custom startup logic
 */
// BasePlugin.prototype.onStart = function() {};

/**
 * Called when plugin is stopped
 * Override this method in subclasses to implement custom stop logic
 */
// BasePlugin.prototype.onStop = function() {};

/**
 * Called when plugin is destroyed
 * Override this method in subclasses to implement custom cleanup logic
 */
// BasePlugin.prototype.onDestroy = function() {};

export default BasePlugin;
