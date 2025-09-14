// Test Scene - Simple scene for development testing
export default class TestScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'TestScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'testing',
                hasAnimations: true,
                hasInput: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        // TestScene initialized
        // Set up scene properties, validate data, etc.
    }

    preload() {
        // ============================================================================
        // PHASER ASSET LOADING: Initial scene asset setup
        // ============================================================================
        // PHASER PATTERN: Load assets needed for this scene
        // - this.load.image() loads image assets
        // - this.load.audio() loads audio assets
        // - this.load.json() loads JSON data
        // - Assets are cached and available in create()
        
        // Load initial assets for this scene
        // this.load.image('background', 'assets/background.png');
        // this.load.audio('theme', 'assets/theme.mp3');
    }

    create() {
        // TestScene created
        const { width, height } = this.cameras.main;
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        // ✅ REMOVED: Hardcoded viewport override - Phaser handles responsive scaling automatically
        
        // ============================================================================
        // PHASER SIMPLE UI PATTERN: Direct element addition to scene
        // ============================================================================
        // PHASER PATTERN: For simple scenes, add elements directly to scene
        // - this.add.rectangle() adds element to scene display list
        // - this.add.text() adds text to scene display list
        // - this.add.dom() adds DOM element to scene display list (avoid for UI)
        // - No containers needed for simple UI
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x00ff00);

        // Title
        this.add.text(width / 2, height / 2, 'Test Scene', {
            fontSize: '32px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create UI elements
        this.createUIElements(width, height);
        
        // Set up interactions
        this.setupInteractions();
    }

    createUIElements(width, height) {
        // Create all UI elements here
        // Use this.add.* methods for direct scene addition
        
        // Back button
        const backBtn = this.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x000000);
        backBtn.setInteractive();
        this.add.text(width / 2, height / 2 + 100, 'Back to Main', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    setupInteractions() {
        // Set up event listeners and interactions
        // Find the back button and set up its interaction
        const backBtn = this.children.list.find(child => child.type === 'Rectangle' && child.x === width / 2 && child.y === height / 2 + 100);
        if (backBtn) {
            backBtn.on('pointerdown', () => {
                // Transitioning back to MainMenuScene
                this.scene.transition({
                    target: 'MainMenuScene',
                    duration: 1000,
                    sleep: false,
                    remove: false,
                    allowInput: false
                });
            });
        }

        // Auto-return after 3 seconds
        this.time.delayedCall(3000, () => {
            // Auto-returning to MainMenuScene
            this.scene.transition({
                target: 'MainMenuScene',
                duration: 1000,
                sleep: false,
                remove: false,
                allowInput: false
            });
        });
    }

    shutdown() {
        // Clean up timers
        this.time.removeAllEvents();
        
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
