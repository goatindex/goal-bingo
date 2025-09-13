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
     * This is safe at SYSTEM_READY timing as scene manager is available then
     * Scene events are accessed through game.events, not game.scene.events
     */
    async initialize() {
        if (this.logger) {
            this.logger.info('Scene state logging setup complete', {
                isMonitoring: this.isMonitoring
            }, 'SceneStateLogger');
        }
        
        // ARCHITECTURE NOTE: Scene monitoring requires game.scene to be available
        // This follows the Event-Driven Initialization Pattern from our timing architecture
        this.startMonitoring();
        
        this.isInitialized = true;
        
        return Promise.resolve();
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        // Check if scene manager is available
        if (!this.game.scene) {
            this.logger.warn('Scene manager not available during setup - will retry', {}, 'SceneStateLogger');
            // Retry after a short delay using setTimeout
            setTimeout(() => {
                this.startMonitoring();
            }, 100);
            return;
        }
        
        this.logger.info('Starting scene state monitoring', {}, 'SceneStateLogger');
        
        // ARCHITECTURE NOTE: Scene manager events are accessed through game.events, not game.scene.events
        // This is a fundamental Phaser 3 architecture constraint
        // Scene events are global and emitted by the game's event system
        this.game.events.on(Phaser.Scenes.Events.START, this.onSceneStart, this);
        this.game.events.on(Phaser.Scenes.Events.STOP, this.onSceneStop, this);
        this.game.events.on(Phaser.Scenes.Events.PAUSE, this.onScenePause, this);
        this.game.events.on(Phaser.Scenes.Events.RESUME, this.onSceneResume, this);
        this.game.events.on(Phaser.Scenes.Events.SLEEP, this.onSceneSleep, this);
        this.game.events.on(Phaser.Scenes.Events.WAKE, this.onSceneWake, this);
        this.game.events.on(Phaser.Scenes.Events.CREATE, this.onSceneCreate, this);
        this.game.events.on(Phaser.Scenes.Events.DESTROY, this.onSceneDestroy, this);

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
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('START', sceneKey, 'Scene started via scene manager');
        this.updateSceneState(sceneKey, 'STARTED');
        this.logTransition('START', sceneKey);
    }

    onSceneStop(scene) {
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('STOP', sceneKey, 'Scene stopped via scene manager');
        this.updateSceneState(sceneKey, 'STOPPED');
        this.logTransition('STOP', sceneKey);
    }

    onScenePause(scene) {
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('PAUSE', sceneKey, 'Scene paused via scene manager');
        this.updateSceneState(sceneKey, 'PAUSED');
    }

    onSceneResume(scene) {
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('RESUME', sceneKey, 'Scene resumed via scene manager');
        this.updateSceneState(sceneKey, 'RESUMED');
    }

    onSceneSleep(scene) {
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('SLEEP', sceneKey, 'Scene put to sleep via scene manager');
        this.updateSceneState(sceneKey, 'SLEEPING');
    }

    onSceneWake(scene) {
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('WAKE', sceneKey, 'Scene woken via scene manager');
        this.updateSceneState(sceneKey, 'WAKING');
    }

    onSceneCreate(scene) {
        const sceneKey = scene.scene.key;
        this.logSceneManagerEvent('CREATE', sceneKey, 'Scene created via scene manager');
        this.updateSceneState(sceneKey, 'CREATED');
        this.setupSceneMonitoring(scene);
    }

    onSceneDestroy(scene) {
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
        this.sceneStates.set(sceneKey, {
            state,
            previousState,
            timestamp: Date.now(),
            isActive: this.game.scene.isActive(sceneKey),
            isVisible: this.game.scene.isVisible(sceneKey),
            isSleeping: this.game.scene.isSleeping(sceneKey)
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
        return this.game.scene.scenes.filter(scene => scene.scene.isActive());
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
}
