// Preload Scene - Load all game assets
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'PreloadScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'loading',
                hasAnimations: true,
                hasInput: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('PreloadScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load game assets
        this.loadAssets();
    }

    create() {
        console.log('PreloadScene: create() called - all assets loaded');
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        this.cameras.main.setViewport(0, 0, 1200, 800);
        
        // PHASER STANDARD: create() is only called after loading is complete
        // Transition to main menu immediately
        console.log('PreloadScene: Transitioning to MainMenuScene');
        this.scene.start('MainMenuScene');
    }

    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff);

        // Loading text
        this.add.text(width / 2, height / 2 - 50, 'Loading Goal Bingo...', {
            fontSize: '32px',
            fill: '#333333'
        }).setOrigin(0.5);

        // Progress bar background
        const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0xcccccc);
        
        // Progress bar fill
        this.progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0x667eea);
        this.progressBar.setOrigin(0, 0.5);

        // Progress text
        this.progressText = this.add.text(width / 2, height / 2 + 30, '0%', {
            fontSize: '16px',
            fill: '#666666'
        }).setOrigin(0.5);

        // Update progress bar
        this.load.on('progress', (value) => {
            this.progressBar.width = 400 * value;
            this.progressText.setText(Math.round(value * 100) + '%');
        });
    }

    loadAssets() {
        console.log('PreloadScene: Loading game assets...');
        
        // Load placeholder assets and basic game resources
        this.loadBasicAssets();
        
        // Set up completion handler
        this.load.on('complete', () => {
            console.log('PreloadScene: All assets loaded successfully');
        });
        
        this.load.on('loaderror', (file) => {
            console.warn('PreloadScene: Failed to load asset:', file.key, file.url);
        });
    }
    
    loadBasicAssets() {
        // Load basic UI assets (using data URLs for now)
        this.loadBasicShapes();
        this.loadBasicTextures();
        this.loadBasicSounds();
    }
    
    loadBasicShapes() {
        // Create basic shapes as textures for UI elements
        // These will be generated programmatically rather than loaded from files
        
        // Create a simple button texture
        this.load.image('button-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Create a simple cell texture
        this.load.image('cell-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Create a simple grid texture
        this.load.image('grid-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
    
    loadBasicTextures() {
        // Load basic textures for the game
        // For now, we'll use simple colored rectangles
        
        // Create goal card texture
        this.load.image('goal-card', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Create reward button texture
        this.load.image('reward-button', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Create background texture
        this.load.image('background', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
    
    loadBasicSounds() {
        // Load basic sound effects (using data URLs for now)
        // For now, we'll skip actual sound loading and just log
        console.log('PreloadScene: Sound loading placeholder - no actual sounds loaded');
        
        // In a real implementation, you would load actual sound files:
        // this.load.audio('goal-complete', 'assets/audio/goal-complete.mp3');
        // this.load.audio('win-sound', 'assets/audio/win-sound.mp3');
        // this.load.audio('button-click', 'assets/audio/button-click.mp3');
    }

    shutdown() {
        // Clean up loader event listeners
        this.load.off('progress');
        this.load.off('complete');
        this.load.off('loaderror');
        
        // Fallback cleanup
        this.events.removeAllListeners();
    }
}
