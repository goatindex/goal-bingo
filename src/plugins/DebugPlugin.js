/**
 * DebugPlugin - Comprehensive debugging tools using Phaser's Graphics system
 * 
 * This plugin extends BasePlugin and provides both console-based debugging tools
 * and visual graphics debugging capabilities for the Goal Bingo application.
 * It combines the functionality of the original DebugTools with enhanced
 * visual debugging features using Phaser's Graphics system.
 * 
 * ARCHITECTURE NOTES:
 * - Uses game.appStateManager for state access (domain logic)
 * - Uses game.registry for data access (Phaser native)
 * - Uses game.events for event management (Phaser native)
 * - Uses Phaser.Graphics for visual debugging (Phaser native)
 * - This is a legitimate custom plugin that extends Phaser functionality
 * 
 * KEY DEPENDENCIES:
 * - game.appStateManager: ApplicationStateManager instance for domain logic
 * - game.registry: Phaser's built-in data management system
 * - game.events: Phaser's built-in event system
 * - Phaser.Graphics: Phaser's built-in graphics system
 * 
 * @extends BasePlugin
 * @since 1.0.0
 */
import { BasePlugin } from './BasePlugin.js';

export class DebugPlugin extends BasePlugin {
    
    /**
     * Creates an instance of DebugPlugin
     * 
     * @param {Phaser.Plugins.PluginManager} pluginManager - A reference to the Plugin Manager
     */
    constructor(pluginManager) {
        super(pluginManager);
        
        // Plugin-specific properties
        this.debugGraphics = null;
        this.isEnabled = false;
        this.isInitialized = false;
        
        // Debug state management
        this.debugState = {
            showBounds: false,
            showGrid: false,
            showFPS: false,
            showMemory: false,
            showSceneInfo: false
        };
        
        // Performance tracking
        this.performanceMetrics = {
            frameCount: 0,
            lastFPSUpdate: 0,
            currentFPS: 0,
            frameTimes: []
        };
        
        // Debug text objects
        this.debugTexts = new Map();
        
        // Debug colors
        this.colors = {
            bounds: 0x00ff00,
            grid: 0x666666,
            fps: 0xffffff,
            memory: 0xffaa00,
            error: 0xff0000,
            warning: 0xffaa00,
            info: 0x00aaff
        };
    }
    
    /**
     * Get default configuration for the debug plugin
     * 
     * @returns {Object} Default configuration object
     */
    getDefaultConfig() {
        return {
            enabled: false, // Debug is disabled by default in production
            debug: false,
            showBounds: false,
            showGrid: false,
            showFPS: false,
            showMemory: false,
            showSceneInfo: false,
            gridSize: 32,
            boundsColor: 0x00ff00,
            gridColor: 0x666666,
            textColor: 0xffffff,
            fontSize: 16
        };
    }
    
    /**
     * Plugin initialization
     * 
     * @param {any} data - Initialization data
     */
    onInit(data) {
        this.log('info', 'DebugPlugin initializing with data:', data);
        
        // Initialize debug state from config
        this.isEnabled = data.enabled || false;
        this.debugState.showBounds = data.showBounds || false;
        this.debugState.showGrid = data.showGrid || false;
        this.debugState.showFPS = data.showFPS || false;
        this.debugState.showMemory = data.showMemory || false;
        this.debugState.showSceneInfo = data.showSceneInfo || false;
        
        // Set colors from config
        if (data.boundsColor) this.colors.bounds = data.boundsColor;
        if (data.gridColor) this.colors.grid = data.gridColor;
        if (data.textColor) this.colors.text = data.textColor;
        
        this.isInitialized = true;
        
        this.log('info', 'DebugPlugin initialized successfully', {
            enabled: this.isEnabled,
            debugState: this.debugState
        });
    }
    
    /**
     * Plugin startup
     */
    onStart() {
        this.log('info', 'DebugPlugin starting...');
        
        // Initialize debug graphics
        this.initializeDebugGraphics();
        
        // Set up debug tools
        this.setupDebugTools();
        
        this.log('info', 'DebugPlugin started successfully');
    }
    
    /**
     * Plugin stop
     */
    onStop() {
        this.log('info', 'DebugPlugin stopping...');
        
        // Clean up debug graphics
        this.cleanupDebugGraphics();
        
        this.log('info', 'DebugPlugin stopped');
    }
    
    /**
     * Plugin destruction
     */
    onDestroy() {
        this.log('info', 'DebugPlugin destroying...');
        
        // Clean up all resources
        this.cleanupDebugGraphics();
        this.cleanupDebugTexts();
        this.cleanupDebugTools();
        
        this.log('info', 'DebugPlugin destroyed');
    }
    
    /**
     * Initialize debug graphics
     */
    initializeDebugGraphics() {
        if (!this.scene) {
            this.log('warn', 'No scene available for debug graphics');
            return;
        }
        
        try {
            // Create debug graphics object
            this.debugGraphics = this.scene.add.graphics();
            this.debugGraphics.setDepth(1000); // Ensure it's on top
            
            this.log('info', 'Debug graphics initialized');
        } catch (error) {
            this.log('error', 'Error initializing debug graphics:', error);
        }
    }
    
    /**
     * Set up debug tools accessible via window.debugTools
     */
    setupDebugTools() {
        // Add debug commands to window for console access
        window.debugTools = {
            // Visual debugging
            toggle: () => this.toggle(),
            enable: () => this.enable(),
            disable: () => this.disable(),
            clear: () => this.clear(),
            
            // Graphics debugging
            drawRect: (x, y, width, height, color) => this.drawRect(x, y, width, height, color),
            drawCircle: (x, y, radius, color) => this.drawCircle(x, y, radius, color),
            drawLine: (x1, y1, x2, y2, color) => this.drawLine(x1, y1, x2, y2, color),
            drawBounds: (gameObject, color) => this.drawBounds(gameObject, color),
            drawGrid: (cellWidth, cellHeight, color) => this.drawGrid(cellWidth, cellHeight, color),
            
            // Text debugging
            drawText: (x, y, text, style) => this.drawText(x, y, text, style),
            clearText: (id) => this.clearText(id),
            clearAllText: () => this.clearAllText(),
            
            // State debugging
            showBounds: (enabled) => this.setShowBounds(enabled),
            showGrid: (enabled) => this.setShowGrid(enabled),
            showFPS: (enabled) => this.setShowFPS(enabled),
            showMemory: (enabled) => this.setShowMemory(enabled),
            showSceneInfo: (enabled) => this.setShowSceneInfo(enabled),
            
            // Game state inspection (from original DebugTools)
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
            getSceneInstance: (sceneKey) => this.getSceneInstance(sceneKey),
            callSceneMethod: (sceneKey, methodName, ...args) => this.callSceneMethod(sceneKey, methodName, ...args),
            
            // Utility tools
            exportDebugData: () => this.exportDebugData(),
            simulateError: () => this.simulateError(),
            getSystemInfo: () => this.getSystemInfo(),
            
            // Help
            help: () => this.showHelp()
        };
        
        this.log('info', 'Debug tools initialized', {
            availableCommands: Object.keys(window.debugTools)
        });
    }
    
    // ===== VISUAL DEBUGGING METHODS =====
    
    /**
     * Toggle debug mode
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        this.log('info', `Debug mode ${this.isEnabled ? 'enabled' : 'disabled'}`);
        
        if (!this.isEnabled) {
            this.clear();
        }
        
        return this.isEnabled;
    }
    
    /**
     * Enable debug mode
     */
    enable() {
        this.isEnabled = true;
        this.log('info', 'Debug mode enabled');
        return true;
    }
    
    /**
     * Disable debug mode
     */
    disable() {
        this.isEnabled = false;
        this.clear();
        this.log('info', 'Debug mode disabled');
        return false;
    }
    
    /**
     * Clear all debug graphics
     */
    clear() {
        if (this.debugGraphics) {
            this.debugGraphics.clear();
        }
        this.clearAllText();
        this.log('debug', 'Debug graphics cleared');
    }
    
    /**
     * Draw a rectangle
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} color - Color (default: bounds color)
     */
    drawRect(x, y, width, height, color = this.colors.bounds) {
        if (!this.isEnabled || !this.debugGraphics) return;
        
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeRect(x, y, width, height);
    }
    
    /**
     * Draw a circle
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Radius
     * @param {number} color - Color (default: bounds color)
     */
    drawCircle(x, y, radius, color = this.colors.bounds) {
        if (!this.isEnabled || !this.debugGraphics) return;
        
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.strokeCircle(x, y, radius);
    }
    
    /**
     * Draw a line
     * 
     * @param {number} x1 - Start X position
     * @param {number} y1 - Start Y position
     * @param {number} x2 - End X position
     * @param {number} y2 - End Y position
     * @param {number} color - Color (default: bounds color)
     */
    drawLine(x1, y1, x2, y2, color = this.colors.bounds) {
        if (!this.isEnabled || !this.debugGraphics) return;
        
        this.debugGraphics.lineStyle(2, color);
        this.debugGraphics.moveTo(x1, y1);
        this.debugGraphics.lineTo(x2, y2);
        this.debugGraphics.strokePath();
    }
    
    /**
     * Draw bounds of a game object
     * 
     * @param {Phaser.GameObjects.GameObject} gameObject - The game object
     * @param {number} color - Color (default: bounds color)
     */
    drawBounds(gameObject, color = this.colors.bounds) {
        if (!this.isEnabled || !this.debugGraphics || !gameObject) return;
        
        const bounds = gameObject.getBounds();
        this.drawRect(bounds.x, bounds.y, bounds.width, bounds.height, color);
    }
    
    /**
     * Draw a debug grid
     * 
     * @param {number} cellWidth - Grid cell width
     * @param {number} cellHeight - Grid cell height
     * @param {number} color - Color (default: grid color)
     */
    drawGrid(cellWidth, cellHeight, color = this.colors.grid) {
        if (!this.isEnabled || !this.debugGraphics || !this.scene) return;
        
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        this.debugGraphics.lineStyle(1, color, 0.5);
        
        // Vertical lines
        for (let x = 0; x <= width; x += cellWidth) {
            this.debugGraphics.moveTo(x, 0);
            this.debugGraphics.lineTo(x, height);
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += cellHeight) {
            this.debugGraphics.moveTo(0, y);
            this.debugGraphics.lineTo(width, y);
        }
        
        this.debugGraphics.strokePath();
    }
    
    /**
     * Draw debug text
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text to display
     * @param {Object} style - Text style options
     * @returns {string} Text ID for later removal
     */
    drawText(x, y, text, style = {}) {
        if (!this.isEnabled || !this.scene) return null;
        
        const textId = `debug_text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const defaultStyle = {
            fontSize: `${this.colors.fontSize || 16}px`,
            color: `#${this.colors.text.toString(16).padStart(6, '0')}`,
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        };
        
        const finalStyle = { ...defaultStyle, ...style };
        
        const textObject = this.scene.add.text(x, y, text, finalStyle);
        textObject.setDepth(1001); // Above debug graphics
        textObject.setScrollFactor(0); // Fixed to camera
        
        this.debugTexts.set(textId, textObject);
        
        return textId;
    }
    
    /**
     * Clear specific debug text
     * 
     * @param {string} textId - Text ID to remove
     */
    clearText(textId) {
        if (this.debugTexts.has(textId)) {
            this.debugTexts.get(textId).destroy();
            this.debugTexts.delete(textId);
        }
    }
    
    /**
     * Clear all debug text
     */
    clearAllText() {
        this.debugTexts.forEach(text => text.destroy());
        this.debugTexts.clear();
    }
    
    // ===== DEBUG STATE MANAGEMENT =====
    
    /**
     * Set show bounds state
     * 
     * @param {boolean} enabled - Whether to show bounds
     */
    setShowBounds(enabled) {
        this.debugState.showBounds = enabled;
        this.log('debug', `Show bounds: ${enabled}`);
    }
    
    /**
     * Set show grid state
     * 
     * @param {boolean} enabled - Whether to show grid
     */
    setShowGrid(enabled) {
        this.debugState.showGrid = enabled;
        this.log('debug', `Show grid: ${enabled}`);
    }
    
    /**
     * Set show FPS state
     * 
     * @param {boolean} enabled - Whether to show FPS
     */
    setShowFPS(enabled) {
        this.debugState.showFPS = enabled;
        this.log('debug', `Show FPS: ${enabled}`);
    }
    
    /**
     * Set show memory state
     * 
     * @param {boolean} enabled - Whether to show memory
     */
    setShowMemory(enabled) {
        this.debugState.showMemory = enabled;
        this.log('debug', `Show memory: ${enabled}`);
    }
    
    /**
     * Set show scene info state
     * 
     * @param {boolean} enabled - Whether to show scene info
     */
    setShowSceneInfo(enabled) {
        this.debugState.showSceneInfo = enabled;
        this.log('debug', `Show scene info: ${enabled}`);
    }
    
    // ===== CONSOLE DEBUGGING METHODS (from original DebugTools) =====
    
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
            this.log('error', 'Error getting game state', { error: error.message });
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
            this.log('error', 'Error getting active scenes', { error: error.message });
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
                    delta: this.game.time.delta,
                    fps: this.game.loop.actualFps
                },
                plugins: {
                    total: this.game.plugins.plugins.size,
                    active: Array.from(this.game.plugins.plugins.keys())
                }
            };
        } catch (error) {
            this.log('error', 'Error getting game info', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Get logs with optional filter
     */
    getLogs(filter = {}) {
        try {
            const logger = this.game.logger;
            if (logger && logger.getLogs) {
                return logger.getLogs(filter);
            }
            return { error: 'Logger not available' };
        } catch (error) {
            this.log('error', 'Error getting logs', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Clear logs
     */
    clearLogs() {
        try {
            const logger = this.game.logger;
            if (logger && logger.clearLogs) {
                logger.clearLogs();
                return { success: true };
            }
            return { error: 'Logger not available' };
        } catch (error) {
            this.log('error', 'Error clearing logs', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Export logs
     */
    exportLogs() {
        try {
            const logger = this.game.logger;
            if (logger && logger.exportLogs) {
                return logger.exportLogs();
            }
            return { error: 'Logger not available' };
        } catch (error) {
            this.log('error', 'Error exporting logs', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Set log level
     */
    setLogLevel(level) {
        try {
            const logger = this.game.logger;
            if (logger && logger.setLevel) {
                logger.setLevel(level);
                return { success: true, level };
            }
            return { error: 'Logger not available' };
        } catch (error) {
            this.log('error', 'Error setting log level', { error: error.message });
            return { error: error.message };
        }
    }
    
    // ===== PERFORMANCE METHODS =====
    
    /**
     * Get performance metrics
     */
    getPerformance() {
        try {
            const performanceLogger = this.game.performanceLogger;
            if (performanceLogger && performanceLogger.getMetrics) {
                return performanceLogger.getMetrics();
            }
            return { error: 'PerformanceLogger not available' };
        } catch (error) {
            this.log('error', 'Error getting performance metrics', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        try {
            const performanceLogger = this.game.performanceLogger;
            if (performanceLogger && performanceLogger.getPerformanceSummary) {
                return performanceLogger.getPerformanceSummary();
            }
            return { error: 'PerformanceLogger not available' };
        } catch (error) {
            this.log('error', 'Error getting performance summary', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        try {
            const performanceLogger = this.game.performanceLogger;
            if (performanceLogger && performanceLogger.startMonitoring) {
                performanceLogger.startMonitoring();
                return { success: true };
            }
            return { error: 'PerformanceLogger not available' };
        } catch (error) {
            this.log('error', 'Error starting performance monitoring', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        try {
            const performanceLogger = this.game.performanceLogger;
            if (performanceLogger && performanceLogger.stopMonitoring) {
                performanceLogger.stopMonitoring();
                return { success: true };
            }
            return { error: 'PerformanceLogger not available' };
        } catch (error) {
            this.log('error', 'Error stopping performance monitoring', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Clear performance metrics
     */
    clearPerformanceMetrics() {
        try {
            const performanceLogger = this.game.performanceLogger;
            if (performanceLogger && performanceLogger.clearMetrics) {
                performanceLogger.clearMetrics();
                return { success: true };
            }
            return { error: 'PerformanceLogger not available' };
        } catch (error) {
            this.log('error', 'Error clearing performance metrics', { error: error.message });
            return { error: error.message };
        }
    }
    
    // ===== USER ACTION METHODS =====
    
    /**
     * Get user actions with optional filter
     */
    getActions(filter = {}) {
        try {
            const userActionLogger = this.game.userActionLogger;
            if (userActionLogger && userActionLogger.getActions) {
                return userActionLogger.getActions(filter);
            }
            return { error: 'UserActionLogger not available' };
        } catch (error) {
            this.log('error', 'Error getting user actions', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Get user action statistics
     */
    getActionStats() {
        try {
            const userActionLogger = this.game.userActionLogger;
            if (userActionLogger && userActionLogger.getActionStats) {
                return userActionLogger.getActionStats();
            }
            return { error: 'UserActionLogger not available' };
        } catch (error) {
            this.log('error', 'Error getting action stats', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Get user behavior patterns
     */
    getBehaviorPatterns() {
        try {
            const userActionLogger = this.game.userActionLogger;
            if (userActionLogger && userActionLogger.getUserBehaviorPatterns) {
                return userActionLogger.getUserBehaviorPatterns();
            }
            return { error: 'UserActionLogger not available' };
        } catch (error) {
            this.log('error', 'Error getting behavior patterns', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Clear user actions
     */
    clearActions() {
        try {
            const userActionLogger = this.game.userActionLogger;
            if (userActionLogger && userActionLogger.clearActions) {
                userActionLogger.clearActions();
                return { success: true };
            }
            return { error: 'UserActionLogger not available' };
        } catch (error) {
            this.log('error', 'Error clearing actions', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Export user actions
     */
    exportActions() {
        try {
            const userActionLogger = this.game.userActionLogger;
            if (userActionLogger && userActionLogger.exportActions) {
                return userActionLogger.exportActions();
            }
            return { error: 'UserActionLogger not available' };
        } catch (error) {
            this.log('error', 'Error exporting actions', { error: error.message });
            return { error: error.message };
        }
    }
    
    // ===== DATA MANAGEMENT METHODS =====
    
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
                    dataKeys: Object.keys(this.game.registry.list || {})
                };
            }
            return { hasAppStateManager: false, error: 'ApplicationStateManager not available' };
        } catch (error) {
            this.log('error', 'Error getting data manager info', { error: error.message });
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
            this.log('error', 'Error getting storage info', { error: error.message });
            return { error: error.message };
        }
    }
    
    // ===== SCENE MANAGEMENT METHODS =====
    
    /**
     * Transition to a specific scene
     */
    transitionToScene(sceneKey) {
        try {
            if (this.game.scene.isActive(sceneKey)) {
                this.log('warn', `Scene ${sceneKey} is already active`);
                return { success: false, message: `Scene ${sceneKey} is already active` };
            }
            
            this.game.scene.start(sceneKey);
            this.log('info', `Transitioned to scene: ${sceneKey}`);
            return { success: true, message: `Transitioned to ${sceneKey}` };
        } catch (error) {
            this.log('error', `Error transitioning to scene ${sceneKey}`, { error: error.message });
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
            this.log('error', 'Error getting scene info', { error: error.message });
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
            this.log('error', 'Error getting scene instance', { error: error.message, sceneKey });
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
            this.log('error', 'Error calling scene method', { 
                error: error.message, 
                sceneKey, 
                methodName 
            });
            return { error: error.message };
        }
    }
    
    // ===== UTILITY METHODS =====
    
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
            this.log('error', 'Error getting system info', { error: error.message });
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
                sceneInfo: this.getSceneInfo(),
                systemInfo: this.getSystemInfo(),
                performance: this.getPerformance(),
                logs: this.getLogs(),
                actions: this.getActions()
            };
            
            // Create and download file
            const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `debug-data-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            return { success: true, filename: a.download };
        } catch (error) {
            this.log('error', 'Error exporting debug data', { error: error.message });
            return { error: error.message };
        }
    }
    
    /**
     * Simulate an error for testing
     */
    simulateError() {
        try {
            throw new Error('Simulated debug error for testing');
        } catch (error) {
            this.log('error', 'Simulated error', { error: error.message });
            return { success: true, error: error.message };
        }
    }
    
    /**
     * Show help information
     */
    showHelp() {
        const help = {
            title: 'Goal Bingo Debug Tools Help',
            version: '2.0.0',
            description: 'Enhanced debug tools with visual graphics debugging capabilities',
            availableCommands: {
                // Visual debugging
                'toggle()': 'Toggle debug mode on/off',
                'enable()': 'Enable debug mode',
                'disable()': 'Disable debug mode',
                'clear()': 'Clear all debug graphics',
                'drawRect(x, y, w, h, color)': 'Draw a rectangle',
                'drawCircle(x, y, radius, color)': 'Draw a circle',
                'drawLine(x1, y1, x2, y2, color)': 'Draw a line',
                'drawBounds(gameObject, color)': 'Draw object bounds',
                'drawGrid(cellWidth, cellHeight, color)': 'Draw debug grid',
                'drawText(x, y, text, style)': 'Draw debug text',
                'clearText(id)': 'Clear specific debug text',
                'clearAllText()': 'Clear all debug text',
                
                // State debugging
                'showBounds(enabled)': 'Show/hide object bounds',
                'showGrid(enabled)': 'Show/hide debug grid',
                'showFPS(enabled)': 'Show/hide FPS counter',
                'showMemory(enabled)': 'Show/hide memory usage',
                'showSceneInfo(enabled)': 'Show/hide scene information',
                
                // Console debugging (from original DebugTools)
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
                'debugTools.toggle()': 'Toggle debug mode',
                'debugTools.drawRect(100, 100, 50, 50, 0xff0000)': 'Draw red rectangle',
                'debugTools.drawGrid(32, 32)': 'Draw 32x32 grid',
                'debugTools.showBounds(true)': 'Show object bounds',
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
    
    // ===== CLEANUP METHODS =====
    
    /**
     * Clean up debug graphics
     */
    cleanupDebugGraphics() {
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
            this.debugGraphics = null;
        }
    }
    
    /**
     * Clean up debug texts
     */
    cleanupDebugTexts() {
        this.debugTexts.forEach(text => text.destroy());
        this.debugTexts.clear();
    }
    
    /**
     * Clean up debug tools
     */
    cleanupDebugTools() {
        if (window.debugTools) {
            delete window.debugTools;
        }
    }
}

export default DebugPlugin;
