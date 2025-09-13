// Boot Scene - Initialize game settings and load assets
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'BootScene',
            plugins: ['TweenManager', 'Clock'],
            data: {
                defaultData: 'value',
                sceneType: 'initialization',
                hasAnimations: false,
                isBootScene: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('BootScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    preload() {
        // Skip loading assets for now - we'll load them in PreloadScene
        console.log('BootScene: Skipping asset loading');
    }

    create() {
        // Set up game configuration
        this.cameras.main.setBackgroundColor('#f8f9fa');
        
        // Wait for StateManager to be ready before proceeding
        this.waitForStateManager();
    }

    waitForStateManager() {
        // Check if both StateManager and StorageManager are available
        if (this.game.stateManager && this.game.storageManager && 
            this.game.stateManager.isInitialized && this.game.storageManager.isInitialized) {
            this.proceedToPreload();
        } else {
            // Wait for both managers to be ready
            this.game.events.once('stateInitialized', () => {
                // Check if storage manager is also ready
                if (this.game.storageManager && this.game.storageManager.isInitialized) {
                    this.proceedToPreload();
                }
            });
            
            // Set a timeout to prevent infinite waiting
            this.time.delayedCall(5000, () => {
                console.warn('Manager initialization timeout, proceeding anyway');
                this.proceedToPreload();
            });
        }
    }

    proceedToPreload() {
        console.log('BootScene: Proceeding to PreloadScene');
        // Defer the scene transition slightly to allow current scene to complete
        this.time.delayedCall(100, () => {
            this.scene.start('PreloadScene');
        });
    }

    shutdown() {
        // Clean up event listeners
        this.game.events.off('stateInitialized');
        
        // Clean up timers
        this.time.removeAllEvents();
        
        // Fallback cleanup
        this.events.removeAllListeners();
    }
}
