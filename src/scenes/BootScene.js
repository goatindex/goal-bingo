/**
 * BootScene - Initialize game settings and load assets
 * 
 * ARCHITECTURE NOTES:
 * - Uses game.appStateManager for state management (domain logic)
 * - Uses game.registry for data persistence (Phaser native)
 * - Uses game.events for application events (Phaser native)
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * KEY DEPENDENCIES:
 * - game.appStateManager: ApplicationStateManager instance for domain logic
 * - game.registry: Phaser's built-in data management system
 * - game.events: Phaser's built-in event system
 */
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
        console.log('BootScene: create() called');
        
        // Set up game configuration
        this.cameras.main.setBackgroundColor('#f8f9fa');
        
        // PHASER STANDARD: Transition immediately to next scene
        // Let Phaser handle the scene lifecycle naturally
        console.log('BootScene: Proceeding to PreloadScene');
        this.scene.start('PreloadScene');
    }


    shutdown() {
        // Clean up timers
        this.time.removeAllEvents();
        
        // Clean up scene events
        this.events.removeAllListeners();
    }
}
