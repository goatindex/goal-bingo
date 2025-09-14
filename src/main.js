/**
 * Main Phaser Game Configuration and Initialization
 * 
 * ARCHITECTURE NOTES:
 * - Uses Phaser's built-in game.registry for data persistence (100% native)
 * - Uses Phaser's built-in game.events for event management (100% native)
 * - Uses ApplicationStateManager utility class for domain logic
 * - Only custom plugins are for legitimate extensions (DebugPlugin)
 * - No reinvention of Phaser core functionality
 * 
 * KEY SYSTEMS:
 * - game.registry: Phaser's built-in data management system
 * - game.events: Phaser's built-in event system
 * - game.appStateManager: ApplicationStateManager instance for domain logic
 * - StorageManager: Handles localStorage persistence
 */
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GoalLibraryScene from './scenes/GoalLibraryScene.js';
import BingoGridScene from './scenes/BingoGridScene.js';
import RewardsScene from './scenes/RewardsScene.js';
import TestScene from './scenes/TestScene.js';
// Using Phaser's built-in game.registry and game.events for data and event management
import { StorageManager } from './StorageManager.js';
import { Logger } from './utils/Logger.js';
import { PerformanceLogger } from './utils/PerformanceLogger.js';
import { UserActionLogger } from './utils/UserActionLogger.js';
import { DebugTools } from './utils/DebugTools.js';
import { SceneStateLogger } from './utils/SceneStateLogger.js';
import { ApplicationStateManager } from './utils/ApplicationStateManager.js';
import { pluginRegistry } from './plugins/PluginRegistry.js';

// ARCHITECTURE NOTE: Game Instance Management Pattern
// This follows the Singleton Pattern to ensure only one game instance exists
// Prevents memory leaks and duplicate initialization during hot reload
let activeGame = null;

// Register plugins with the plugin registry (only custom plugins)
// Note: TestPlugin removed - not a legitimate edge case per archived strategy

// Using Phaser's built-in game.registry and game.events for data and event management

// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#e9ecef',
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GoalLibraryScene,
        BingoGridScene,
        RewardsScene,
        TestScene
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 320, height: 240 },
        max: { width: 1920, height: 1080 }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    input: {
        activePointers: 3
    },
    // PHASER DOM SUPPORT: Enable DOM elements for modals and forms
    dom: {
        createContainer: true  // Required for this.add.dom() elements in modals
    },
    render: {
        antialias: true,
        pixelArt: false
    },
    // Debug configuration
    debug: {
        enabled: process.env.NODE_ENV === 'development',
        showFPS: process.env.NODE_ENV === 'development',
        showMemory: process.env.NODE_ENV === 'development',
        showSceneGraph: process.env.NODE_ENV === 'development'
    },
    // Custom debug header (disable default)
    banner: {
        hidePhaser: false,
        hideVersion: false,
        hideURL: false,
        hideCopyright: false
    },
    // Plugin system configuration
    plugins: pluginRegistry.getPhaserPluginConfig(),
    // PHASER STANDARD: Use postBoot for core systems initialization
    callbacks: {
        postBoot: async (game) => {
            try {
                console.log('=== PHASER POSTBOOT CALLBACK TRIGGERED ===');
                
                // Initialize core systems (don't need scene manager)
                await initializeCoreSystems(game);
                
                console.log('Core systems initialized');
            } catch (error) {
                console.error('Failed to initialize core systems in postBoot:', error);
            }
        }
    }
};

/**
 * Initialize the plugin system
 * This function sets up the plugin registry and initializes all registered plugins
 * 
 * @param {Phaser.Game} game - The Phaser game instance
 * @returns {Promise<void>}
 */
async function initializePluginSystem(game) {
    console.log('[PluginSystem] Initializing plugin system...');
    
    try {
        // Initialize all registered plugins
        const success = await pluginRegistry.initializePlugins(game);
        
        if (success) {
            console.log('[PluginSystem] Plugin system initialized successfully');
            
            // Make plugin registry globally accessible for debugging
            window.pluginRegistry = pluginRegistry;
            
            // Log plugin status
            const pluginStatus = pluginRegistry.getAllPluginStatus();
            console.log('[PluginSystem] Plugin status:', pluginStatus);
        } else {
            console.error('[PluginSystem] Failed to initialize plugin system');
        }
    } catch (error) {
        console.error('[PluginSystem] Error initializing plugin system:', error);
    }
}

/**
 * ARCHITECTURE NOTE: Game Creation with Cleanup
 * Always destroy previous game before creating new one
 * This prevents memory leaks and duplicate event listeners
 * 
 * @returns {Promise<Phaser.Game>} The new game instance
 */
async function createGame() {
    // CLEANUP: Destroy previous game instance if it exists
    if (activeGame) {
        console.log('Cleaning up previous game instance...');
        cleanupGame(activeGame);
        activeGame.destroy();
        activeGame = null;
    }
    
    // Create new game instance
    const game = new Phaser.Game(config);
    activeGame = game;
    
    // Initialize plugin system
    await initializePluginSystem(game);
    
    // LOGGING: Track game creation for debugging
    if (window.logger) {
        window.logger.info('New game instance created', { 
            timestamp: Date.now(),
            previousGameDestroyed: true 
        }, 'GameManager');
    } else {
        console.log('New game instance created at', new Date().toISOString());
    }
    
    return game;
}

/**
 * ARCHITECTURE NOTE: Comprehensive Game Cleanup
 * This method ensures all resources are properly cleaned up
 * Follows Phaser's recommended cleanup patterns
 * 
 * PHASER ARCHITECTURE CLARIFICATION:
 * - Each system's destroy() method should only clean up resources it explicitly created
 * - Systems using Phaser's built-in events (this.game.events) should NOT clean them up
 * - Systems using custom EventEmitter instances should clean up their own events
 * - Phaser handles its own event system cleanup automatically
 * - We only clean up custom resources: timers, data arrays, custom event listeners, etc.
 *
 * @param {Phaser.Game} game - The game instance to clean up
 */
function cleanupGame(game) {
    if (!game) return;

    console.log('Starting comprehensive game cleanup...');

    // CLEANUP: All systems that have destroy methods
    // Each system's destroy() method follows the Phaser architecture:
    // - Logger: Cleans up logs array and state flags (uses this.game.events - Phaser handles cleanup)
    // - ApplicationStateManager: Handled by Phaser's data system cleanup
    // - PerformanceLogger: Cleans up metrics and timers (uses this.game.events - Phaser handles cleanup)
    // - UserActionLogger: Cleans up actions array and timers (no custom events)
    // - SceneStateLogger: Cleans up scene events array and timers (uses this.game.events - Phaser handles cleanup)
    // - DebugTools: Cleans up global references (no custom events)
    // - StorageManager: Cleans up autosave timers and data (no custom events)
    const systems = [
        'logger', 'storageManager', 'performanceLogger',
        'userActionLogger', 'sceneStateLogger', 'debugTools'
    ];

    systems.forEach(systemName => {
        if (game[systemName] && typeof game[systemName].destroy === 'function') {
            console.log(`Cleaning up ${systemName}...`);
            try {
                game[systemName].destroy();
            } catch (error) {
                console.error(`Error cleaning up ${systemName}:`, error);
            }
        }
    });

    // CLEANUP: Event listeners (handled by Phaser's built-in game.events)
    // Phaser's game.events handles its own cleanup automatically

    // CLEANUP: Plugin system
    if (window.pluginRegistry) {
        console.log('Cleaning up plugin system...');
        window.pluginRegistry.cleanup();
        window.pluginRegistry = null;
    }

    // CLEANUP: Global references
    window.game = null;
    systems.forEach(systemName => {
        window[systemName] = null;
    });

    console.log('Game cleanup completed');
}

/**
 * Core Systems Initialization
 * ARCHITECTURE NOTE: These systems initialize in Phaser's postBoot callback
 * This follows Phaser's documented initialization pattern for systems that don't need scene manager
 * postBoot runs after all game systems have started and plugins are loaded
 * 
 * Systems included:
 * - Logger: Centralized logging system
 * - PerformanceLogger: Performance monitoring
 * - ApplicationStateManager: Application state management using Phaser's game.registry
 * - StorageManager: Data persistence with Phaser event integration
 * 
 * @param {Phaser.Game} game - The Phaser game instance
 * @returns {Promise<void>}
 */
async function initializeCoreSystems(game) {
    console.log('Initializing core systems...');
    
    // Initialize Logger first (foundation for all other systems)
    const logger = new Logger(game, {
        level: 'debug',
        enablePhaserEvents: true,
        enablePerformance: true,
        enableUserActions: true
    });
    await logger.initialize();
    
    // Initialize ApplicationStateManager (uses Phaser's built-in game.registry)
    // Initialize ApplicationStateManager (domain logic utility class)
    const appStateManager = new ApplicationStateManager(game);
    await appStateManager.initialize();
    
    // Initialize StorageManager (uses Phaser's built-in game.registry.events for change detection)
    const storageManager = new StorageManager(game, appStateManager, logger);
    await storageManager.initialize();
    
    // Initialize PerformanceLogger (needs game.events for performance monitoring)
    const performanceLogger = new PerformanceLogger(game, logger);
    await performanceLogger.initialize();
    
    // Make core systems globally accessible
    window.appStateManager = appStateManager;
    window.storageManager = storageManager;
    window.logger = logger;
    window.performanceLogger = performanceLogger;
    
    // Attach core systems to game object for easy access
    game.appStateManager = appStateManager;
    game.storageManager = storageManager;
    game.logger = logger;
    game.performanceLogger = performanceLogger;
    
    console.log('Core systems initialized:', {
        logger: !!logger,
        appStateManager: !!appStateManager,
        storageManager: !!storageManager,
        performanceLogger: !!performanceLogger
    });
}

/**
 * Scene-Dependent Systems Initialization
 * ARCHITECTURE NOTE: These systems initialize on Phaser's SYSTEM_READY event
 * This follows Phaser's documented initialization pattern for systems that need scene manager
 * SYSTEM_READY fires when Scene Manager has created the System Scene (Phaser 3.70.0+)
 * 
 * Systems included:
 * - UserActionLogger: User interaction tracking (scene-specific input)
 * - SceneStateLogger: Scene state monitoring (needs scene manager events)
 * - DebugTools: Debug utilities (needs other systems to be initialized first)
 * 
 * @param {Phaser.Game} game - The Phaser game instance
 * @returns {Promise<void>}
 */
async function initializeSceneSystems(game) {
    console.log('Initializing scene-dependent systems...');
    
    // Get references to core systems (initialized first)
    const logger = game.logger;
    const appStateManager = game.appStateManager;
    const storageManager = game.storageManager;
    const performanceLogger = game.performanceLogger;
    
    // Initialize UserActionLogger (needs game.scene for scene-specific input tracking)
    const userActionLogger = new UserActionLogger(game, logger);
    await userActionLogger.initialize();
    
    // Initialize SceneStateLogger (needs game.scene for scene manager events)
    const sceneStateLogger = new SceneStateLogger(game, logger);
    await sceneStateLogger.initialize();
    
    // Initialize DebugTools (needs other systems to be initialized first)
    const debugTools = new DebugTools(game, logger);
    await debugTools.initialize();
    
    // Make scene-dependent systems globally accessible
    window.userActionLogger = userActionLogger;
    window.debugTools = debugTools;
    window.sceneStateLogger = sceneStateLogger;
    
    // Attach scene-dependent systems to game object for easy access
    game.userActionLogger = userActionLogger;
    game.debugTools = debugTools;
    game.sceneStateLogger = sceneStateLogger;
    
    console.log('Scene-dependent systems initialized:', {
        userActionLogger: !!userActionLogger,
        sceneStateLogger: !!sceneStateLogger,
        debugTools: !!debugTools
    });
    
    // Set up global error handling (requires logger from core systems)
    setupGlobalErrorHandling();
    
    // Set up final system validation
    validateSystemInitialization(game);
}

/**
 * Set up global error handling
 * ARCHITECTURE NOTE: This requires logger to be available
 * Global error handling is set up after all systems are initialized
 */
function setupGlobalErrorHandling() {
    // Set up global error handling
    window.addEventListener('error', (event) => {
        if (window.logger) {
            window.logger.error('Global error:', event.error);
        } else {
            console.error('Global error (logger not available):', event.error);
        }
    });
    
    // Set up unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
        if (window.logger) {
            window.logger.error('Unhandled promise rejection:', event.reason);
        } else {
            console.error('Unhandled promise rejection (logger not available):', event.reason);
        }
    });
    
    // Handle beforeunload (for final save)
    window.addEventListener('beforeunload', (e) => {
        if (window.storageManager) {
            console.log('Page unloading - triggering final save');
            window.storageManager.performAutosave();
        }
    });
}

/**
 * Validate that all systems are properly initialized
 * ARCHITECTURE NOTE: This provides runtime validation of system initialization
 * Helps ensure the Phaser standard timing system is working correctly
 * 
 * @param {Phaser.Game} game - The Phaser game instance
 */
function validateSystemInitialization(game) {
    console.log('=== SYSTEM INITIALIZATION VALIDATION ===');
    
    const coreSystems = {
        'Logger': !!game.logger,
        'ApplicationStateManager': !!game.appStateManager,
        'StorageManager': !!game.storageManager,
        'PerformanceLogger': !!game.performanceLogger
    };
    
    const sceneSystems = {
        'UserActionLogger': !!game.userActionLogger,
        'SceneStateLogger': !!game.sceneStateLogger,
        'DebugTools': !!game.debugTools
    };
    
    console.log('Core systems:', coreSystems);
    console.log('Scene-dependent systems:', sceneSystems);
    
    const allSystemsValid = Object.values(coreSystems).every(Boolean) && 
                           Object.values(sceneSystems).every(Boolean);
    
    if (allSystemsValid) {
        console.log('✅ All systems initialized successfully');
    } else {
        console.error('❌ Some systems failed to initialize');
    }
    
    console.log('Game object:', !!game);
    console.log('=== VALIDATION COMPLETE ===');
}

// PHASER STANDARD: Single initialization function
// This follows Phaser's documented initialization pattern
async function initializeGame() {
    try {
        // ARCHITECTURE NOTE: Game Creation with Cleanup Management
        // Use createGame() to ensure proper cleanup of previous instances
        const game = await createGame();
        
        // Make game globally accessible for debugging
        window.game = game;
        
        // ARCHITECTURE NOTE: Phaser Standard Initialization Pattern
        // This follows Phaser's documented initialization lifecycle:
        // 1. postBoot callback (in config) - initializes core systems
        // 2. SYSTEM_READY event (after game creation) - initializes scene-dependent systems
        // This ensures proper timing and follows Phaser's documented patterns
        game.events.once(Phaser.Core.Events.SYSTEM_READY, async (sys) => {
            try {
                console.log('=== PHASER SYSTEM_READY EVENT TRIGGERED ===');
                
                // Initialize scene-dependent systems (needs scene manager)
                await initializeSceneSystems(game);
                
                console.log('=== ALL SYSTEMS INITIALIZATION COMPLETE ===');
            } catch (error) {
                console.error('Failed to initialize scene systems:', error);
            }
        });
        
        console.log('Game initialization completed');
    } catch (error) {
        console.error('Failed to create game:', error);
    }
}

// PHASER STANDARD: Initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log('DOM still loading - waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    console.log('DOM already loaded - initializing game immediately');
    initializeGame();
}

// ARCHITECTURE NOTE: Hot Reload Integration
// This ensures proper cleanup when Vite hot reloads the module
// Prevents memory leaks and duplicate game instances during development
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        console.log('Hot reload detected - cleaning up...');
        if (activeGame) {
            cleanupGame(activeGame);
            activeGame.destroy();
            activeGame = null;
        }
        // CLEANUP: All event listeners for complete cleanup
        // Phaser handles its own event system cleanup automatically
        console.log('Hot reload cleanup completed');
    });
}

// ARCHITECTURE NOTE: Manual Cleanup Testing
// This provides a way to manually test the destroy() methods
// Use this to validate that all systems are properly cleaned up
window.testCleanup = () => {
    console.log('=== MANUAL CLEANUP TEST TRIGGERED ===');
    console.log('Active game exists:', !!activeGame);
    
    if (activeGame) {
        console.log('Game systems available:', {
            logger: !!activeGame.logger,
            appStateManager: !!activeGame.appStateManager,
            storageManager: !!activeGame.storageManager,
            performanceLogger: !!activeGame.performanceLogger,
            userActionLogger: !!activeGame.userActionLogger,
            sceneStateLogger: !!activeGame.sceneStateLogger,
            debugTools: !!activeGame.debugTools
        });
        
        console.log('Starting manual cleanup...');
        cleanupGame(activeGame);
        
        console.log('Destroying game instance...');
        activeGame.destroy();
        activeGame = null;
        
        console.log('=== MANUAL CLEANUP TEST COMPLETED ===');
    } else {
        console.log('No active game to clean up');
    }
};

// ARCHITECTURE NOTE: Manual Game Recreation Testing
// This provides a way to test the full cleanup and recreation cycle
window.testRecreation = () => {
    console.log('=== MANUAL RECREATION TEST TRIGGERED ===');
    
    // First cleanup existing game
    if (activeGame) {
        console.log('Cleaning up existing game...');
        window.testCleanup();
    }
    
    // Wait a moment then create new game
    setTimeout(async () => {
        console.log('Creating new game...');
        const game = await createGame();
        window.game = game;
        console.log('=== MANUAL RECREATION TEST COMPLETED ===');
    }, 1000);
};