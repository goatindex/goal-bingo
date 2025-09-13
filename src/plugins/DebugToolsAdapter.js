/**
 * DebugToolsAdapter - Compatibility layer for DebugTools → DebugPlugin migration
 * 
 * This adapter provides backward compatibility for existing DebugTools usage
 * while the migration to DebugPlugin is in progress. It wraps the
 * DebugPlugin and provides the same API as the original DebugTools.
 * 
 * @since 1.0.0
 */
export class DebugToolsAdapter {
    
    /**
     * Creates an instance of DebugToolsAdapter
     * 
     * @param {Phaser.Game} game - The game instance
     * @param {Logger} logger - The logger instance
     */
    constructor(game, logger) {
        this.game = game;
        this.logger = logger;
        this.debugPlugin = null;
        this.isInitialized = false;
        
        // Initialize the adapter
        this.initialize();
    }
    
    /**
     * Initialize the adapter
     */
    initialize() {
        // The DebugPlugin will be set when the game is initialized
        this.isInitialized = true;
        
        console.log('DebugToolsAdapter initialized');
    }
    
    /**
     * Set the DebugPlugin reference
     * 
     * @param {DebugPlugin} debugPlugin - The DebugPlugin instance
     */
    setDebugPlugin(debugPlugin) {
        this.debugPlugin = debugPlugin;
        
        if (this.debugPlugin) {
            console.log('DebugToolsAdapter: DebugPlugin reference set');
        } else {
            console.warn('DebugToolsAdapter: DebugPlugin reference is null');
        }
    }
    
    /**
     * Initialize the debug tools
     * 
     * @returns {Promise<void>}
     */
    async initialize() {
        // Get references to other systems
        this.performanceLogger = this.game.performanceLogger;
        this.userActionLogger = this.game.userActionLogger;
        
        this.setupDebugTools();
        
        if (this.logger) {
            this.logger.info('Debug tools initialized', {
                performanceLogger: !!this.performanceLogger,
                userActionLogger: !!this.userActionLogger,
                debugPlugin: !!this.debugPlugin
            }, 'DebugToolsAdapter');
        }
        
        return Promise.resolve();
    }
    
    /**
     * Set up debug tools accessible via window.debugTools
     */
    setupDebugTools() {
        // Add debug commands to window for console access
        window.debugTools = {
            // Game state inspection
            getGameState: () => this.getGameState(),
            getActiveScenes: () => this.getActiveScenes(),
            getGameInfo: () => this.getGameInfo(),
            
            // Logging tools
            getLogs: (filter) => this.getLogs(filter),
            clearLogs: () => this.clearLogs(),
            exportLogs: () => this.exportLogs(),
            setLogLevel: (level) => this.setLogLevel(level),
            
            // Performance tools
            getPerformance: () => this.getPerformance(),
            getPerformanceSummary: () => this.getPerformanceSummary(),
            startPerformanceMonitoring: () => this.startPerformanceMonitoring(),
            stopPerformanceMonitoring: () => this.stopPerformanceMonitoring(),
            clearPerformanceMetrics: () => this.clearPerformanceMetrics(),
            
            // User action tools
            getActions: (filter) => this.getActions(filter),
            getActionStats: () => this.getActionStats(),
            getBehaviorPatterns: () => this.getBehaviorPatterns(),
            clearActions: () => this.clearActions(),
            exportActions: () => this.exportActions(),
            
            // Data management tools
            getDataManager: () => this.getDataManagerInfo(),
            getStorageInfo: () => this.getStorageInfo(),
            
            // Scene management tools
            transitionToScene: (sceneKey) => this.transitionToScene(sceneKey),
            getSceneInfo: () => this.getSceneInfo(),
            
            // Utility tools
            exportDebugData: () => this.exportDebugData(),
            simulateError: () => this.simulateError(),
            getSystemInfo: () => this.getSystemInfo(),
            
            // Help
            help: () => this.showHelp()
        };
        
        this.logger.info('Debug tools initialized', {
            availableCommands: Object.keys(window.debugTools)
        }, 'DebugToolsAdapter');
    }
    
    // ===== PROXY METHODS TO DEBUGPLUGIN =====
    
    /**
     * Get current game state
     */
    getGameState() {
        if (this.debugPlugin) {
            return this.debugPlugin.getGameState();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get active scenes
     */
    getActiveScenes() {
        if (this.debugPlugin) {
            return this.debugPlugin.getActiveScenes();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get comprehensive game information
     */
    getGameInfo() {
        if (this.debugPlugin) {
            return this.debugPlugin.getGameInfo();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get logs with optional filter
     */
    getLogs(filter = {}) {
        if (this.debugPlugin) {
            return this.debugPlugin.getLogs(filter);
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Clear logs
     */
    clearLogs() {
        if (this.debugPlugin) {
            return this.debugPlugin.clearLogs();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Export logs
     */
    exportLogs() {
        if (this.debugPlugin) {
            return this.debugPlugin.exportLogs();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Set log level
     */
    setLogLevel(level) {
        if (this.debugPlugin) {
            return this.debugPlugin.setLogLevel(level);
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get performance metrics
     */
    getPerformance() {
        if (this.debugPlugin) {
            return this.debugPlugin.getPerformance();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        if (this.debugPlugin) {
            return this.debugPlugin.getPerformanceSummary();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.debugPlugin) {
            return this.debugPlugin.startPerformanceMonitoring();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.debugPlugin) {
            return this.debugPlugin.stopPerformanceMonitoring();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Clear performance metrics
     */
    clearPerformanceMetrics() {
        if (this.debugPlugin) {
            return this.debugPlugin.clearPerformanceMetrics();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get user actions with optional filter
     */
    getActions(filter = {}) {
        if (this.debugPlugin) {
            return this.debugPlugin.getActions(filter);
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get user action statistics
     */
    getActionStats() {
        if (this.debugPlugin) {
            return this.debugPlugin.getActionStats();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get user behavior patterns
     */
    getBehaviorPatterns() {
        if (this.debugPlugin) {
            return this.debugPlugin.getBehaviorPatterns();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Clear user actions
     */
    clearActions() {
        if (this.debugPlugin) {
            return this.debugPlugin.clearActions();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Export user actions
     */
    exportActions() {
        if (this.debugPlugin) {
            return this.debugPlugin.exportActions();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get data manager information
     */
    getDataManagerInfo() {
        if (this.debugPlugin) {
            return this.debugPlugin.getDataManagerInfo();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get storage information
     */
    getStorageInfo() {
        if (this.debugPlugin) {
            return this.debugPlugin.getStorageInfo();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Transition to a specific scene
     */
    transitionToScene(sceneKey) {
        if (this.debugPlugin) {
            return this.debugPlugin.transitionToScene(sceneKey);
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get detailed scene information
     */
    getSceneInfo() {
        if (this.debugPlugin) {
            return this.debugPlugin.getSceneInfo();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Get system information
     */
    getSystemInfo() {
        if (this.debugPlugin) {
            return this.debugPlugin.getSystemInfo();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Export comprehensive debug data
     */
    exportDebugData() {
        if (this.debugPlugin) {
            return this.debugPlugin.exportDebugData();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Simulate an error for testing
     */
    simulateError() {
        if (this.debugPlugin) {
            return this.debugPlugin.simulateError();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Show help information
     */
    showHelp() {
        if (this.debugPlugin) {
            return this.debugPlugin.showHelp();
        }
        return { error: 'DebugPlugin not available' };
    }
    
    /**
     * Shutdown debug tools
     */
    shutdown() {
        if (window.debugTools) {
            delete window.debugTools;
        }
        this.logger.info('Debug tools shutdown', null, 'DebugToolsAdapter');
    }
    
    /**
     * ARCHITECTURE NOTE: DebugToolsAdapter Cleanup Method
     * This follows the Adapter Pattern for backward compatibility
     * 
     * PHASER ARCHITECTURE CLARIFICATION:
     * - DebugToolsAdapter is just a wrapper around DebugPlugin
     * - We don't need to clean up resources as the plugin handles this
     * - This method is kept for backward compatibility but does nothing
     * - The actual cleanup is handled by the DebugPlugin's destroy method
     */
    async destroy() {
        console.log('DebugToolsAdapter: destroy() called - no cleanup needed (plugin handles this)');
        
        // Clear references
        this.debugPlugin = null;
        this.isInitialized = false;
        
        console.log('DebugToolsAdapter: References cleared');
    }
}

export default DebugToolsAdapter;
