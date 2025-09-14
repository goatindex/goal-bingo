import Phaser from 'phaser';

export class SceneStateLogger {
    constructor(game, logger) {
        this.game = game;
        this.logger = logger;
        this.sceneStates = new Map();
        this.transitionHistory = [];
        this.isMonitoring = false;
        this.isInitialized = false;
    }

    /**
     * Initialize the scene state logger
     * @returns {Promise<void>}
     */
    /**
     * ARCHITECTURE NOTE: SceneStateLogger requires game.scene to be available
     * This is safe at SYSTEM_READY timing as scene manager is fully available
     * Scene events are accessed through game.events, not game.scene.events
     * SYSTEM_READY fires when Scene Manager has created the System Scene (Phaser 3.70.0+)
     */
    async initialize() {
        if (this.logger) {
            this.logger.info('Scene state logging setup complete', {
                isMonitoring: this.isMonitoring
            }, 'SceneStateLogger');
        }
        
        // ARCHITECTURE NOTE: Scene monitoring requires game.scene to be available
        // Delay monitoring start to ensure scene manager is fully ready
        // Use requestAnimationFrame to ensure it runs after the current event cycle
        requestAnimationFrame(() => {
            this.startMonitoring();
        });
        
        this.isInitialized = true;
        
        return Promise.resolve();
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        // PHASER STANDARD: Check if scene manager is available
        // Even with SYSTEM_READY event, there might be a brief delay
        if (!this.game.scene || !this.game.scene.scenes) {
            this.logger.warn('Scene manager not available during setup - retrying...', {}, 'SceneStateLogger');
            // PHASER STANDARD: Use requestAnimationFrame for next frame check
            // This is more Phaser-compliant than setTimeout
            requestAnimationFrame(() => {
                this.startMonitoring();
            });
            return;
        }
        
        this.logger.info('Starting scene state monitoring', {}, 'SceneStateLogger');
        
        // PHASER STANDARD: Use game.events for scene manager events
        // This follows Phaser's documented approach for global scene events
        this.game.events.on(Phaser.Scenes.Events.START, this.onSceneStart, this);
        this.game.events.on(Phaser.Scenes.Events.STOP, this.onSceneStop, this);
        this.game.events.on(Phaser.Scenes.Events.PAUSE, this.onScenePause, this);
        this.game.events.on(Phaser.Scenes.Events.RESUME, this.onSceneResume, this);
        this.game.events.on(Phaser.Scenes.Events.SLEEP, this.onSceneSleep, this);
        this.game.events.on(Phaser.Scenes.Events.WAKE, this.onSceneWake, this);
        this.game.events.on(Phaser.Scenes.Events.CREATE, this.onSceneCreate, this);
        this.game.events.on(Phaser.Scenes.Events.DESTROY, this.onSceneDestroy, this);

        // PHASER STANDARD: Register shutdown and destroy event handlers
        this.game.events.once('shutdown', this.handleShutdown, this);
        this.game.events.once('destroy', this.handleDestroy, this);

        // Monitor individual scene events
        this.monitorIndividualScenes();
        
        this.isMonitoring = true;
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.logger.info('Stopping scene state monitoring', {}, 'SceneStateLogger');
        
        // Remove scene manager event listeners
        // ARCHITECTURE NOTE: Scene manager events are accessed through game.events, not game.scene.events
        this.game.events.off(Phaser.Scenes.Events.START, this.onSceneStart, this);
        this.game.events.off(Phaser.Scenes.Events.STOP, this.onSceneStop, this);
        this.game.events.off(Phaser.Scenes.Events.PAUSE, this.onScenePause, this);
        this.game.events.off(Phaser.Scenes.Events.RESUME, this.onSceneResume, this);
        this.game.events.off(Phaser.Scenes.Events.SLEEP, this.onSceneSleep, this);
        this.game.events.off(Phaser.Scenes.Events.WAKE, this.onSceneWake, this);
        this.game.events.off(Phaser.Scenes.Events.CREATE, this.onSceneCreate, this);
        this.game.events.off(Phaser.Scenes.Events.DESTROY, this.onSceneDestroy, this);
        
        this.isMonitoring = false;
    }

    monitorIndividualScenes() {
        // Monitor all existing scenes
        this.game.scene.scenes.forEach(scene => {
            this.setupSceneMonitoring(scene);
        });
    }

    setupSceneMonitoring(scene) {
        if (!scene || !scene.events) return;
        
        const sceneKey = scene.scene.key;
        
        // Monitor scene lifecycle events
        scene.events.on(Phaser.Scenes.Events.CREATE, () => {
            this.logSceneEvent(sceneKey, 'CREATE', 'Scene created');
        });
        
        scene.events.on(Phaser.Scenes.Events.DESTROY, () => {
            this.logSceneEvent(sceneKey, 'DESTROY', 'Scene destroyed');
        });
        
        scene.events.on(Phaser.Scenes.Events.START, () => {
            this.logSceneEvent(sceneKey, 'START', 'Scene started');
        });
        
        scene.events.on(Phaser.Scenes.Events.STOP, () => {
            this.logSceneEvent(sceneKey, 'STOP', 'Scene stopped');
        });
    }

    onSceneStart(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('START', sceneKey, 'Scene started via scene manager');
        this.updateSceneState(sceneKey, 'STARTED');
        this.logTransition('START', sceneKey);
    }

    onSceneStop(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('STOP', sceneKey, 'Scene stopped via scene manager');
        this.updateSceneState(sceneKey, 'STOPPED');
        this.logTransition('STOP', sceneKey);
    }

    onScenePause(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('PAUSE', sceneKey, 'Scene paused via scene manager');
        this.updateSceneState(sceneKey, 'PAUSED');
    }

    onSceneResume(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('RESUME', sceneKey, 'Scene resumed via scene manager');
        this.updateSceneState(sceneKey, 'RESUMED');
    }

    onSceneSleep(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('SLEEP', sceneKey, 'Scene put to sleep via scene manager');
        this.updateSceneState(sceneKey, 'SLEEPING');
    }

    onSceneWake(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('WAKE', sceneKey, 'Scene woken via scene manager');
        this.updateSceneState(sceneKey, 'WAKING');
    }

    onSceneCreate(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('CREATE', sceneKey, 'Scene created via scene manager');
        this.updateSceneState(sceneKey, 'CREATED');
        this.setupSceneMonitoring(scene);
    }

    onSceneDestroy(scene) {
        // PHASER STANDARD: Validate scene object before accessing properties
        if (!scene || !scene.scene || !scene.scene.key) {
            // Silently return during destruction - this is expected behavior
            return;
        }
        
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('DESTROY', sceneKey, 'Scene destroyed via scene manager');
        this.updateSceneState(sceneKey, 'DESTROYED');
        this.sceneStates.delete(sceneKey);
    }

    logSceneManagerEvent(event, sceneKey, message) {
        this.logger.debug(`Scene Manager Event: ${event}`, {
            sceneKey,
            message,
            timestamp: Date.now(),
            activeScenes: this.getActiveScenes().length,
            totalScenes: this.game.scene.scenes.length
        }, 'SceneStateLogger');
    }

    logSceneEvent(sceneKey, event, message) {
        this.logger.debug(`Scene Event: ${event}`, {
            sceneKey,
            message,
            timestamp: Date.now(),
            activeScenes: this.getActiveScenes().length
        }, 'SceneStateLogger');
    }

    updateSceneState(sceneKey, state) {
        const previousState = this.sceneStates.get(sceneKey);
        
        // PHASER STANDARD: Add null safety checks during scene destruction
        let isActive = false;
        let isVisible = false;
        
        try {
            if (this.game && this.game.scene) {
                isActive = this.game.scene.isActive(sceneKey);
                isVisible = this.game.scene.isVisible(sceneKey);
            }
        } catch (error) {
            // PHASER STANDARD: Silently handle errors during scene destruction
            // This is expected behavior when scenes are being destroyed
            // Documentation confirms this pattern for handling destroyed game instances
        }
        
        this.sceneStates.set(sceneKey, {
            state,
            previousState,
            timestamp: Date.now(),
            isActive,
            isVisible,
            isSleeping: this.game && this.game.scene ? this.game.scene.isSleeping(sceneKey) : false
        });
    }

    logTransition(type, sceneKey) {
        this.transitionHistory.push({
            type,
            sceneKey,
            timestamp: Date.now(),
            activeScenes: this.getActiveScenes().map(s => s.scene.key),
            totalScenes: this.game.scene.scenes.length
        });
        
        // Keep only last 50 transitions
        if (this.transitionHistory.length > 50) {
            this.transitionHistory.shift();
        }
    }

    getActiveScenes() {
        // PHASER STANDARD: Use proper null safety checks during scene destruction
        if (!this.game || !this.game.scene || !this.game.scene.scenes) {
            return [];
        }
        
        return this.game.scene.scenes.filter(scene => {
            // Check if scene exists and has the required properties before calling isActive()
            return scene && 
                   scene.scene && 
                   typeof scene.scene.isActive === 'function' && 
                   scene.scene.isActive();
        });
    }

    getSceneStates() {
        const states = {};
        this.sceneStates.forEach((state, key) => {
            states[key] = state;
        });
        return states;
    }

    getTransitionHistory() {
        return this.transitionHistory;
    }

    logCurrentState() {
        const activeScenes = this.getActiveScenes();
        const sceneStates = this.getSceneStates();
        
        this.logger.info('Current Scene State', {
            activeScenes: activeScenes.map(s => s.scene.key),
            totalScenes: this.game.scene.scenes.length,
            sceneStates,
            recentTransitions: this.transitionHistory.slice(-10)
        }, 'SceneStateLogger');
    }

    // Method to be called from scenes during transitions
    logSceneTransition(fromScene, toScene, method) {
        this.logger.info('Scene Transition', {
            from: fromScene,
            to: toScene,
            method,
            timestamp: Date.now(),
            activeScenes: this.getActiveScenes().map(s => s.scene.key)
        }, 'SceneStateLogger');
    }

    /**
     * ARCHITECTURE NOTE: SceneStateLogger Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * Ensures all scene state monitoring is stopped and resources cleaned up
     */
    async destroy() {
        console.log('SceneStateLogger: Starting cleanup...');
        
        try {
            // CLEANUP: Stop monitoring
            this.stopMonitoring();
            
            // CLEANUP: Clear scene events array
            this.sceneEvents = [];
            
            // CLEANUP: Clear data structures
            this.sceneStates.clear();
            this.transitionHistory = [];
            
            // CLEANUP: Remove any remaining event listeners from individual scenes
            this.cleanupIndividualSceneListeners();
            
            // CLEANUP: Reset state flags
            this.isMonitoring = false;
            this.isInitialized = false;
            
            // CLEANUP: Clear timeout if exists
            if (this.retryTimeout) {
                clearTimeout(this.retryTimeout);
                this.retryTimeout = null;
            }
            
            // LOGGING: Track cleanup completion
            console.log('SceneStateLogger: Cleanup completed successfully');
            
        } catch (error) {
            console.error('SceneStateLogger: Error during cleanup:', error);
            throw error;
        }
    }

    /**
     * PHASER STANDARD: Handle shutdown event
     * This follows Phaser's documented approach for cleanup during shutdown
     */
    handleShutdown() {
        console.log('SceneStateLogger: Handling shutdown event');
        this.stopMonitoring();
        this.cleanupIndividualSceneListeners();
    }

    /**
     * PHASER STANDARD: Handle destroy event
     * This follows Phaser's documented approach for final cleanup
     */
    handleDestroy() {
        console.log('SceneStateLogger: Handling destroy event');
        this.destroy();
    }

    /**
     * PHASER STANDARD: Clean up individual scene event listeners
     * This follows Phaser's recommended cleanup patterns for scene destruction
     */
    cleanupIndividualSceneListeners() {
        // PHASER STANDARD: Check if game and scene manager are still available
        if (!this.game || !this.game.scene || !this.game.scene.scenes) {
            return;
        }
        
        // PHASER STANDARD: Safely iterate through scenes during destruction
        this.game.scene.scenes.forEach(scene => {
            // PHASER STANDARD: Check for null scenes and valid event objects
            if (scene && scene.events && typeof scene.events.off === 'function') {
                try {
                    // PHASER STANDARD: Remove event listeners safely
                    scene.events.off(Phaser.Scenes.Events.CREATE);
                    scene.events.off(Phaser.Scenes.Events.DESTROY);
                    scene.events.off(Phaser.Scenes.Events.START);
                    scene.events.off(Phaser.Scenes.Events.STOP);
                } catch (error) {
                    // PHASER STANDARD: Silently handle cleanup errors during destruction
                    // This is expected behavior when scenes are being destroyed
                }
            }
        });
    }
}
