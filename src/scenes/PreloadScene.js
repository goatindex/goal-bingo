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
        // ============================================================================
        // PHASER SCENE LIFECYCLE: Preload phase for asset loading
        // ============================================================================
        // PHASER PATTERN: preload() method is called before create() in scene lifecycle
        // - This is where all assets (images, audio, data) should be loaded
        // - Phaser's Loader system handles asynchronous loading automatically
        // - create() is only called after all assets are successfully loaded
        // - This ensures assets are available when scene content is created
        
        console.log('PreloadScene: preload() called - starting asset loading');
        
        // Create visual loading feedback for user
        this.createLoadingBar();

        // Load all game assets (images, audio, data files)
        this.loadAssets();
        
        console.log('PreloadScene: preload() completed - assets queued for loading');
        
        // ============================================================================
        // PHASER LOADER CONTROL: Start the asset loading process
        // ============================================================================
        // PHASER PATTERN: Explicitly start the loader to begin processing queued assets
        // - this.load.start() begins processing the loading queue
        // - Phaser automatically calls create() when all assets are loaded
        // - Loading progress is tracked via this.load.on('progress') events
        // - Loading completion triggers this.load.on('complete') event
        
        this.load.start();
    }

    create() {
        console.log('PreloadScene: create() called - all assets loaded');
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        // ✅ REMOVED: Hardcoded viewport override - Phaser handles responsive scaling automatically
        
        // PHASER STANDARD: create() is only called after loading is complete
        // According to Phaser documentation, create() is called after all assets are loaded
        // Transition to main menu immediately since assets are ready
        console.log('PreloadScene: All assets loaded, transitioning to MainMenuScene');
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
        // ============================================================================
        // PHASER AUDIO LOADING SYSTEM: Complete audio asset management
        // ============================================================================
        // 
        // PHASER AUDIO ARCHITECTURE OVERVIEW:
        // 1. Audio files are loaded in preload() method using this.load.audio()
        // 2. Phaser automatically caches loaded audio in game.cache.audio
        // 3. Audio can be accessed in create() and update() methods via this.cache.audio
        // 4. Audio instances are created using this.sound.add() in scenes
        // 5. Phaser handles Web Audio API and HTML5 Audio fallback automatically
        //
        // PHASER AUDIO LOADING PATTERN:
        // - this.load.audio(key, url) queues audio for loading
        // - key: unique identifier for the audio asset (used later with this.sound.add())
        // - url: path to the audio file (supports .mp3, .wav, .ogg, .m4a)
        // - Phaser automatically detects browser capabilities and chooses best format
        // - All audio loading is asynchronous and handled by Phaser's Loader system
        //
        // PHASER AUDIO CACHE SYSTEM:
        // - Loaded audio is stored in game.cache.audio
        // - Check if audio exists: this.cache.audio.exists(key)
        // - Get audio data: this.cache.audio.get(key)
        // - List all audio keys: this.cache.audio.getKeys()
        //
        // PHASER AUDIO PLAYBACK:
        // - Create audio instance: this.sound.add(key)
        // - Play audio: audioInstance.play()
        // - Stop audio: audioInstance.stop()
        // - Set volume: audioInstance.setVolume(0.5)
        // - Loop audio: audioInstance.setLoop(true)
        
        console.log('PreloadScene: Loading audio assets...');
        
        // ============================================================================
        // PHASER AUDIO LOADING: Load all game audio assets
        // ============================================================================
        // Each this.load.audio() call:
        // 1. Queues the audio file for loading
        // 2. Assigns a unique key for later reference
        // 3. Phaser handles format detection and browser compatibility
        // 4. Audio is cached and available in subsequent scenes
        
        // UI Interaction Sounds
        this.load.audio('buttonClick', 'assets/audio/button-click.mp3');     // Button click feedback
        this.load.audio('buttonHover', 'assets/audio/button-hover.mp3');    // Button hover feedback
        this.load.audio('modalOpen', 'assets/audio/modal-open.mp3');        // Modal open sound
        this.load.audio('modalClose', 'assets/audio/modal-close.mp3');      // Modal close sound
        
        // Game Action Sounds
        this.load.audio('goalComplete', 'assets/audio/goal-complete.mp3');  // Goal completion sound
        this.load.audio('bingoWin', 'assets/audio/bingo-win.mp3');          // Bingo win celebration
        this.load.audio('newGame', 'assets/audio/new-game.mp3');            // New game start sound
        this.load.audio('gridRepopulate', 'assets/audio/grid-repopulate.mp3'); // Grid repopulation sound
        
        // Background Audio
        this.load.audio('backgroundMusic', 'assets/audio/background-music.mp3'); // Background music loop
        
        console.log('PreloadScene: Audio assets queued for loading');
        console.log('PreloadScene: Loader queue length:', this.load.list.size);
        
        // ============================================================================
        // PHASER LOADER CONTROL: Ensure loading starts
        // ============================================================================
        // PHASER PATTERN: Explicitly start the loader if items are queued
        // - this.load.start() begins processing the loading queue
        // - Phaser automatically calls create() when all assets are loaded
        // - This ensures audio is available before scene transitions
        
        if (this.load.list.size > 0) {
            this.load.start();
        }
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
