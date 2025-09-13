/**
 * Debug Tools for Goal Bingo
 * Production-ready debugging tools accessible via console
 */

export class DebugTools {
    constructor(game, logger) {
        this.game = game;
        this.logger = logger;
        this.performanceLogger = null;
        this.userActionLogger = null;
        
        // Don't call setupDebugTools here - wait for initialize()
    }

    /**
     * Initialize the debug tools
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
                userActionLogger: !!this.userActionLogger
            }, 'DebugTools');
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
            getLogs: (filter) => this.logger.getLogs(filter),
            clearLogs: () => this.logger.clearLogs(),
            exportLogs: () => this.logger.exportLogs(),
            setLogLevel: (level) => this.logger.setLevel(level),
            
            // Performance tools
            getPerformance: () => this.performanceLogger ? this.performanceLogger.getMetrics() : { error: 'PerformanceLogger not available' },
            getPerformanceSummary: () => this.performanceLogger ? this.performanceLogger.getPerformanceSummary() : { error: 'PerformanceLogger not available' },
            startPerformanceMonitoring: () => this.performanceLogger ? this.performanceLogger.startMonitoring() : { error: 'PerformanceLogger not available' },
            stopPerformanceMonitoring: () => this.performanceLogger ? this.performanceLogger.stopMonitoring() : { error: 'PerformanceLogger not available' },
            clearPerformanceMetrics: () => this.performanceLogger ? this.performanceLogger.clearMetrics() : { error: 'PerformanceLogger not available' },
            
            // User action tools
            getActions: (filter) => this.userActionLogger ? this.userActionLogger.getActions(filter) : { error: 'UserActionLogger not available' },
            getActionStats: () => this.userActionLogger ? this.userActionLogger.getActionStats() : { error: 'UserActionLogger not available' },
            getBehaviorPatterns: () => this.userActionLogger ? this.userActionLogger.getUserBehaviorPatterns() : { error: 'UserActionLogger not available' },
            clearActions: () => this.userActionLogger ? this.userActionLogger.clearActions() : { error: 'UserActionLogger not available' },
            exportActions: () => this.userActionLogger ? this.userActionLogger.exportActions() : { error: 'UserActionLogger not available' },
            
            // Data management tools
            getDataManager: () => this.getDataManagerInfo(),
            getStorageInfo: () => this.getStorageInfo(),
            
            // Scene management tools
            transitionToScene: (sceneKey) => this.transitionToScene(sceneKey),
            getSceneInfo: () => this.getSceneInfo(),
            getSceneInstance: (sceneKey) => this.getSceneInstance(sceneKey),
            callSceneMethod: (sceneKey, methodName, ...args) => this.callSceneMethod(sceneKey, methodName, ...args),
            
            // Utility tools
            exportDebugData: () => this.exportDebugData(),
            simulateError: () => this.simulateError(),
            getSystemInfo: () => this.getSystemInfo(),
            
            // Help
            help: () => this.showHelp()
        };
        
        this.logger.info('Debug tools initialized', {
            availableCommands: Object.keys(window.debugTools)
        }, 'DebugTools');
    }

    /**
     * Get current game state
     */
    getGameState() {
        try {
            const appStateManager = this.game.appStateManager;
            if (appStateManager && appStateManager.getApplicationState) {
                return appStateManager.getApplicationState();
            }
            return { error: 'ApplicationStateManager not available' };
        } catch (error) {
            this.logger.error('Error getting game state', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get active scenes
     * 
     * PHASER SCENE ACCESS PATTERN:
     * - game.scene.scenes returns array of Scene Systems objects
     * - Each Scene Systems object has a 'scene' property that references the actual Scene class instance
     * - Scene class instance has methods like create(), init(), preload(), etc.
     * - Scene Systems object has methods like isActive(), isPaused(), isVisible(), etc.
     */
    getActiveScenes() {
        try {
            // PHASER STANDARD: Add null safety checks during scene destruction
            if (!this.game || !this.game.scene || !this.game.scene.scenes) {
                return [];
            }
            
            const activeScenes = this.game.scene.scenes
                .filter(scene => {
                    // PHASER STANDARD: Check for null scenes and valid methods
                    // scene.scene is the Scene Systems object, not the Scene class instance
                    return scene && 
                           scene.scene && 
                           typeof scene.scene.isActive === 'function' && 
                           scene.scene.isActive();
                })
                .map(scene => ({
                    key: scene.scene.key,
                    isRunning: scene.scene.isActive(),
                    isPaused: scene.scene.isPaused(),
                    isVisible: scene.scene.isVisible()
                }));
            
            return {
                activeScenes,
                totalScenes: this.game.scene.scenes.length,
                sceneManager: this.game.scene.scenes.map(s => s.scene.key)
            };
        } catch (error) {
            this.logger.error('Error getting active scenes', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get comprehensive game information
     */
    getGameInfo() {
        try {
            return {
                phaserVersion: Phaser.VERSION,
                gameConfig: {
                    width: this.game.config.width,
                    height: this.game.config.height,
                    type: this.game.config.type,
                    backgroundColor: this.game.config.backgroundColor
                },
                renderer: {
                    type: this.game.renderer.type,
                    webGLVersion: this.game.renderer.webGLVersion,
                    maxTextures: this.game.renderer.maxTextures
                },
                time: {
                    now: this.game.time.now,
                    delta: this.game.loop.delta,
                    actualFps: this.game.loop.actualFps
                },
                input: {
                    activePointer: this.game.input.activePointer ? {
                        x: this.game.input.activePointer.x,
                        y: this.game.input.activePointer.y,
                        isDown: this.game.input.activePointer.isDown
                    } : null,
                    keyboardEnabled: this.game.input.keyboard.enabled
                }
            };
        } catch (error) {
            this.logger.error('Error getting game info', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get data manager information
     */
    getDataManagerInfo() {
        try {
            const appStateManager = this.game.appStateManager;
            if (appStateManager) {
                return {
                    hasAppStateManager: true,
                    isInitialized: appStateManager.isInitialized,
                    dataKeys: Object.keys(this.game.registry.list),
                    dataCount: Object.keys(this.game.registry.list).length,
                    hasGoals: this.game.registry.has('goals'),
                    hasRewards: this.game.registry.has('rewards'),
                    hasCategories: this.game.registry.has('categories'),
                    hasGameState: this.game.registry.has('gameState')
                };
            }
            return { hasAppStateManager: false, error: 'ApplicationStateManager not available' };
        } catch (error) {
            this.logger.error('Error getting data manager info', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get storage information
     */
    getStorageInfo() {
        try {
            const storageManager = this.game.storageManager;
            if (storageManager) {
                return {
                    hasStorageManager: true,
                    isDirty: storageManager.isDirty,
                    saveInProgress: storageManager.saveInProgress,
                    lastSave: storageManager.lastSave,
                    autosaveInterval: storageManager.autosaveInterval
                };
            }
            return { hasStorageManager: false, error: 'StorageManager not available' };
        } catch (error) {
            this.logger.error('Error getting storage info', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Transition to a specific scene
     */
    transitionToScene(sceneKey) {
        try {
            if (this.game.scene.isActive(sceneKey)) {
                this.logger.warn(`Scene ${sceneKey} is already active`, null, 'DebugTools');
                return { success: false, message: `Scene ${sceneKey} is already active` };
            }
            
            this.game.scene.start(sceneKey);
            this.logger.info(`Transitioned to scene: ${sceneKey}`, null, 'DebugTools');
            return { success: true, message: `Transitioned to ${sceneKey}` };
        } catch (error) {
            this.logger.error(`Error transitioning to scene ${sceneKey}`, { error: error.message }, 'DebugTools');
            return { success: false, error: error.message };
        }
    }

    /**
     * Get detailed scene information
     */
    getSceneInfo() {
        try {
            const scenes = this.game.scene.scenes.map(scene => ({
                key: scene.scene.key,
                isActive: scene.scene.isActive(),
                isPaused: scene.scene.isPaused(),
                isVisible: scene.scene.isVisible(),
                isSleeping: scene.scene.isSleeping(),
                isTransitioning: scene.scene.isTransitioning(),
                hasStarted: scene.scene.isActive(),
                gameObjects: scene.scene.children.list.length
            }));
            
            return {
                scenes,
                totalScenes: scenes.length,
                activeScenes: scenes.filter(s => s.isActive).length
            };
        } catch (error) {
            this.logger.error('Error getting scene info', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get Scene class instance for a specific scene key
     * 
     * PHASER SCENE ACCESS PATTERN:
     * - This method provides access to the actual Scene class instance
     * - Scene class instance has methods like create(), init(), preload(), update(), etc.
     * - Use this when you need to call Scene lifecycle methods directly
     * 
     * @param {string} sceneKey - The scene key to get the instance for
     * @returns {Phaser.Scene|null} The Scene class instance or null if not found
     */
    getSceneInstance(sceneKey) {
        try {
            if (!this.game || !this.game.scene || !this.game.scene.scenes) {
                return null;
            }
            
            const sceneSystems = this.game.scene.scenes.find(scene => 
                scene && scene.scene && scene.scene.key === sceneKey
            );
            
            if (!sceneSystems || !sceneSystems.scene) {
                return null;
            }
            
            // PHASER STANDARD: Return the actual Scene class instance
            // This is the object that has create(), init(), preload(), etc. methods
            return sceneSystems.scene;
        } catch (error) {
            this.logger.error('Error getting scene instance', { error: error.message, sceneKey }, 'DebugTools');
            return null;
        }
    }

    /**
     * Call a method on a Scene class instance
     * 
     * PHASER SCENE ACCESS PATTERN:
     * - This method safely calls methods on the actual Scene class instance
     * - Use this for calling Scene lifecycle methods like create(), init(), etc.
     * 
     * @param {string} sceneKey - The scene key
     * @param {string} methodName - The method name to call
     * @param {...any} args - Arguments to pass to the method
     * @returns {any} The result of the method call or error information
     */
    callSceneMethod(sceneKey, methodName, ...args) {
        try {
            const sceneInstance = this.getSceneInstance(sceneKey);
            
            if (!sceneInstance) {
                return { error: `Scene instance not found for key: ${sceneKey}` };
            }
            
            if (typeof sceneInstance[methodName] !== 'function') {
                return { error: `Method ${methodName} not found on scene ${sceneKey}` };
            }
            
            const result = sceneInstance[methodName](...args);
            return { success: true, result };
        } catch (error) {
            this.logger.error('Error calling scene method', { 
                error: error.message, 
                sceneKey, 
                methodName 
            }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get system information
     */
    getSystemInfo() {
        try {
            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : 'Not available',
                timing: performance.timing ? {
                    loadEventEnd: performance.timing.loadEventEnd,
                    domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
                    navigationStart: performance.timing.navigationStart
                } : 'Not available'
            };
        } catch (error) {
            this.logger.error('Error getting system info', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Export comprehensive debug data
     */
    exportDebugData() {
        try {
            const debugData = {
                exportedAt: new Date().toISOString(),
                sessionId: this.game.sessionId || 'unknown',
                phaserVersion: Phaser.VERSION,
                gameInfo: this.getGameInfo(),
                gameState: this.getGameState(),
                activeScenes: this.getActiveScenes(),
                dataManager: this.getDataManagerInfo(),
                storage: this.getStorageInfo(),
                performance: this.performanceLogger.getMetrics(),
                userActions: this.userActionLogger.getActionStats(),
                logs: this.logger.getLogs({ limit: 100 }), // Last 100 logs
                systemInfo: this.getSystemInfo()
            };
            
            const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `goal-bingo-debug-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.logger.info('Debug data exported', { dataSize: JSON.stringify(debugData).length }, 'DebugTools');
            return { success: true, message: 'Debug data exported successfully' };
        } catch (error) {
            this.logger.error('Error exporting debug data', { error: error.message }, 'DebugTools');
            return { success: false, error: error.message };
        }
    }

    /**
     * Simulate an error for testing
     */
    simulateError() {
        try {
            this.logger.error('Simulated error for testing', { 
                timestamp: Date.now(),
                source: 'DebugTools'
            }, 'DebugTools');
            
            // Throw a test error
            throw new Error('Simulated error for debugging purposes');
        } catch (error) {
            this.logger.error('Simulated error caught', { error: error.message }, 'DebugTools');
            return { success: true, message: 'Error simulated and logged' };
        }
    }

    /**
     * Show help information
     */
    showHelp() {
        const help = {
            availableCommands: {
                'getGameState()': 'Get current game state',
                'getActiveScenes()': 'Get information about active scenes',
                'getGameInfo()': 'Get comprehensive game information',
                'getLogs(filter)': 'Get logs with optional filter',
                'clearLogs()': 'Clear all logs',
                'exportLogs()': 'Export logs to file',
                'setLogLevel(level)': 'Set log level (error, warn, info, debug)',
                'getPerformance()': 'Get performance metrics',
                'getPerformanceSummary()': 'Get performance summary',
                'startPerformanceMonitoring()': 'Start performance monitoring',
                'stopPerformanceMonitoring()': 'Stop performance monitoring',
                'getActions(filter)': 'Get user actions with optional filter',
                'getActionStats()': 'Get user action statistics',
                'getBehaviorPatterns()': 'Get user behavior patterns',
                'exportActions()': 'Export user actions to file',
                'getDataManager()': 'Get data manager information',
                'getStorageInfo()': 'Get storage information',
                'transitionToScene(sceneKey)': 'Transition to specific scene',
                'getSceneInfo()': 'Get detailed scene information',
                'getSceneInstance(sceneKey)': 'Get Scene class instance for direct method access',
                'callSceneMethod(sceneKey, methodName, ...args)': 'Call a method on a Scene class instance',
                'exportDebugData()': 'Export comprehensive debug data',
                'simulateError()': 'Simulate an error for testing',
                'getSystemInfo()': 'Get system information',
                'help()': 'Show this help information'
            },
            examples: {
                'debugTools.getLogs({ level: "error" })': 'Get only error logs',
                'debugTools.getActions({ action: "scene_transition" })': 'Get scene transition actions',
                'debugTools.setLogLevel("debug")': 'Set log level to debug',
                'debugTools.transitionToScene("MainMenuScene")': 'Go to main menu',
                'debugTools.getSceneInstance("GoalLibraryScene")': 'Get GoalLibraryScene class instance',
                'debugTools.callSceneMethod("GoalLibraryScene", "create")': 'Call create() on GoalLibraryScene'
            }
        };
        
        console.log('Goal Bingo Debug Tools Help:', help);
        return help;
    }

    /**
     * Shutdown debug tools
     */
    shutdown() {
        if (window.debugTools) {
            delete window.debugTools;
        }
        this.logger.info('Debug tools shutdown', null, 'DebugTools');
    }

    /**
     * ARCHITECTURE NOTE: DebugTools Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * Ensures all debug tools are properly cleaned up
     */
    async destroy() {
        console.log('DebugTools: Starting cleanup...');
        
        try {
            // CLEANUP: Remove global reference
            if (window.debugTools) {
                delete window.debugTools;
            }
            
            // CLEANUP: Reset state flags
            this.isInitialized = false;
            
            // LOGGING: Track cleanup completion
            console.log('DebugTools: Cleanup completed successfully');
            
        } catch (error) {
            console.error('DebugTools: Error during cleanup:', error);
            throw error;
        }
    }
}
