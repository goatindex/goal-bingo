// Rewards Scene - Manage rewards and achievements
export default class RewardsScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'RewardsScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'rewards',
                hasAnimations: true,
                hasInput: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('RewardsScene: init() called with data:', data);
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
        console.log('RewardsScene: create() called');
        const { width, height } = this.cameras.main;
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        this.cameras.main.setViewport(0, 0, 1200, 800);
        
        // ============================================================================
        // PHASER SIMPLE UI PATTERN: Direct element addition to scene
        // ============================================================================
        // PHASER PATTERN: For simple scenes, add elements directly to scene
        // - this.add.rectangle() adds element to scene display list
        // - this.add.text() adds text to scene display list
        // - this.add.dom() adds DOM element to scene display list (avoid for UI)
        // - No containers needed for simple UI
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);

        // Header
        this.add.text(width / 2, 50, '🏆 Rewards', {
            fontSize: '32px',
            fill: '#333333',
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
        const backBtn = this.add.rectangle(100, 50, 120, 40, 0x6c757d);
        backBtn.setInteractive();
        this.add.text(100, 50, '← Back', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Placeholder content
        this.add.text(width / 2, height / 2, 'Rewards - Coming Soon!', {
            fontSize: '24px',
            fill: '#666666'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 40, 'This will contain your reward management interface', {
            fontSize: '16px',
            fill: '#999999'
        }).setOrigin(0.5);
    }

    setupInteractions() {
        // Set up event listeners and interactions
        // Find the back button and set up its interaction
        const backBtn = this.children.list.find(child => child.type === 'Rectangle' && child.x === 100 && child.y === 50);
        if (backBtn) {
            backBtn.on('pointerdown', () => {
                this.scene.start('MainMenuScene');
            });
        }
    }

    shutdown() {
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
