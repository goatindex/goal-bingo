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
            const stateManager = this.game.stateManager;
            if (stateManager && stateManager.getApplicationState) {
                return stateManager.getApplicationState();
            }
            return { error: 'StateManager not available' };
        } catch (error) {
            this.logger.error('Error getting game state', { error: error.message }, 'DebugTools');
            return { error: error.message };
        }
    }

    /**
     * Get active scenes
     */
    getActiveScenes() {
        try {
            const activeScenes = this.game.scene.scenes
                .filter(scene => scene.scene.isActive())
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
            const stateManager = this.game.stateManager;
            if (stateManager && stateManager.dataManager) {
                const dataManager = stateManager.dataManager;
                return {
                    hasDataManager: true,
                    dataKeys: Object.keys(dataManager.list),
                    dataCount: Object.keys(dataManager.list).length,
                    hasAppState: dataManager.has('appState'),
                    hasGoals: dataManager.has('goals'),
                    hasRewards: dataManager.has('rewards'),
                    hasCategories: dataManager.has('categories'),
                    hasGameState: dataManager.has('gameState')
                };
            }
            return { hasDataManager: false, error: 'DataManager not available' };
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
                'exportDebugData()': 'Export comprehensive debug data',
                'simulateError()': 'Simulate an error for testing',
                'getSystemInfo()': 'Get system information',
                'help()': 'Show this help information'
            },
            examples: {
                'debugTools.getLogs({ level: "error" })': 'Get only error logs',
                'debugTools.getActions({ action: "scene_transition" })': 'Get scene transition actions',
                'debugTools.setLogLevel("debug")': 'Set log level to debug',
                'debugTools.transitionToScene("MainMenuScene")': 'Go to main menu'
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
