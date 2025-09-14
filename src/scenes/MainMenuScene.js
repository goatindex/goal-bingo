/**
 * MainMenuScene - Navigation between different game sections
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
 * 
 * ============================================================================
 * AI DEVELOPMENT NOTES - CRITICAL TIMING ISSUE RESOLVED
 * ============================================================================
 * 
 * ISSUE: this.time.addEvent() fails during scene creation
 * ERROR: "TypeError: Cannot read properties of undefined (reading 'addEvent')"
 * 
 * ROOT CAUSE: Phaser's Time system (this.time) is not available during the
 * initial create() phase of scene lifecycle. It becomes available later.
 * 
 * SYMPTOMS: Scene creation fails, buttons don't appear, only background shows
 * 
 * SOLUTION IMPLEMENTED: Manual timer in update() method instead of this.time.addEvent()
 * 
 * FILES AFFECTED: MainMenuScene.js (createSaveIndicator method)
 * 
 * PREVENTION: Always check if this.time exists before using it, or use manual
 * timers in update() method for time-based operations during scene creation.
 * 
 * ============================================================================
 */
export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'MainMenuScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'navigation',
                hasAnimations: true,
                hasInput: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('MainMenuScene: init() called with data:', data);
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
        console.log('MainMenuScene: create() called');
        // Use camera dimensions for Game Objects with RESIZE scaling mode
        // RESIZE mode makes the canvas fill all available parent space
        const { width, height } = this.cameras.main;
        
        // ✅ DELETE - DOM container not needed for Game Objects
        // this.ensureDOMContainer();
        
        // ============================================================================
        // PHASER INITIAL SCENE CONFIG: Common initial scene setup patterns
        // ============================================================================
        // PHASER PATTERN: These patterns are commonly used in initial scene setup
        // - Camera configuration for proper viewport setup
        // - Input configuration for initial interaction setup
        // - Event setup for initial scene communication
        
        // Configure camera
        // ✅ Let body gradient show through - remove background override
        // this.cameras.main.setBackgroundColor('#ffffff');
        // Remove viewport override - let Phaser handle scaling automatically
        // this.cameras.main.setViewport(0, 0, 1200, 800);
        this.cameras.main.setZoom(1);
        
        // Configure input
        this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.handleClick, this);
        
        // Set up initial event listeners
        this.events.on('shutdown', this.onShutdown, this);
        this.events.on('pause', this.onPause, this);
        this.events.on('resume', this.onResume, this);
        
        // ============================================================================
        // PHASER SIMPLE UI PATTERN: Direct element addition to scene
        // ============================================================================
        // PHASER PATTERN: For simple scenes, add Game Objects directly to scene
        // - this.add.rectangle() adds rectangle Game Object to scene display list
        // - this.add.text() adds text Game Object to scene display list
        // - this.add.dom() adds DOM element to scene display list (avoid for UI)
        // - No containers needed for simple UI - Game Objects are self-contained
        
        // ✅ Let body gradient show through - remove background rectangle
        // this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);

        // Title
        this.add.text(width / 2, 100, '🎯 Goal Bingo', {
            fontSize: '48px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, 150, 'Turn your goals into a fun bingo game!', {
            fontSize: '18px',
            fill: '#666666'
        }).setOrigin(0.5);

        // Create UI elements
        this.createUIElements(width, height);
        
        // Set up interactions
        this.setupInteractions();
        
        // Debug: Check if objects are properly rendered
        // Scene initialization complete
        
        // Ensure objects are added to display list
        this.children.bringToTop();
        
        // PHASER COMPLIANT: Scene creation complete
        
        // ============================================================================
        // AI NOTE: TIMER INITIALIZATION TIMING
        // ============================================================================
        // WHY HERE: This is the last line of create() method, ensuring all scene
        // systems are fully initialized before starting the manual timer.
        //
        // TIMING SEQUENCE:
        // 1. Scene create() starts
        // 2. All Game Objects created (buttons, text, etc.)
        // 3. UI elements initialized
        // 4. Timer variables set up (this line)
        // 5. Scene becomes active, update() method starts running
        // 6. Manual timer begins counting in update()
        // ============================================================================
        
        // PHASER FIX: Start save indicator timer after scene is fully created
        this.saveIndicatorTimer = 0;
    }

    createUIElements(width, height) {
        // Create all UI elements here
        // Use this.add.* methods for direct scene addition
        
        // State info display
        this.createStateInfoDisplay(width, height);

        // Navigation buttons
        this.createNavigationButtons(width, height);

        // Save indicator
        this.createSaveIndicator(width, height);
    }

    setupInteractions() {
        // Set up event listeners and interactions
        this.setupStateEventListeners();
    }

    // ============================================================================
    // REMOVED DOM METHODS - NO LONGER NEEDED
    // ============================================================================
    // ensureDOMContainer() - REMOVED: Not needed for Game Object-based UI
    // positionDOMElement() - REMOVED: Not needed for Game Object-based UI
    // 
    // REASON: Game Objects handle their own positioning and don't need DOM containers
    // ============================================================================

    createNavigationButtons(width, height) {
        // Goal Library Button - Game Object
        this.createButton(width / 2, height / 2 - 60, '📚 Goal Library', () => {
            this.scene.start('GoalLibraryScene');
        });
        
        // Bingo Grid Button - Game Object
        this.createButton(width / 2, height / 2 + 20, '🎲 Play Bingo', () => {
            this.scene.start('BingoGridScene');
        });
        
        // Rewards Button - Game Object
        this.createButton(width / 2, height / 2 + 100, '🏆 Rewards', () => {
            this.scene.start('RewardsScene');
        });
    }

    // Enhanced method for creating Game Object buttons
    createButton(x, y, text, callback, options = {}) {
        const {
            width = 300,
            height = 60,
            backgroundColor = 0x667eea,
            hoverColor = 0x5a6fd8,
            textColor = '#ffffff',
            fontSize = '20px',
            fontStyle = 'bold'
        } = options;

        // Create button background with proper hit area
        const button = this.add.rectangle(x, y, width, height, backgroundColor);
        // PHASER STANDARD: Use default rectangle hit area (automatic for rectangles)
        button.setInteractive();
        // PHASER STANDARD: Set cursor separately
        button.input.cursor = 'pointer';
        
        // Add text with proper centering
        const buttonText = this.add.text(x, y, text, {
            fontSize: fontSize,
            fill: textColor,
            fontStyle: fontStyle
        }).setOrigin(0.5, 0.5);
        
        // Enhanced hover effects with proper event handling
        button.on('pointerover', () => {
            button.setTint(hoverColor);
            button.setScale(1.05); // Subtle scale effect
        });
        
        button.on('pointerout', () => {
            button.clearTint();
            button.setScale(1.0);
        });
        
        // PHASER STANDARD: Click handler with proper event data
        button.on('pointerdown', () => {
            // Button clicked
            // Add visual feedback
            button.setScale(0.95);
            // Execute callback
            if (callback) {
                // Execute callback
                callback();
            }
        });
        
        button.on('pointerup', () => {
            button.setScale(1.0);
        });
        
        // Add accessibility attributes
        button.setData('accessible', true);
        button.setData('accessibleLabel', text);
        button.setData('accessibleHint', `Button: ${text}`);
        
        // PHASER COMPLIANT: Store button references for cleanup
        if (!this.buttonGroup) {
            this.buttonGroup = [];
        }
        this.buttonGroup.push({ button, text: buttonText });
        
        return { button, text: buttonText };
    }

    createSaveIndicator(width, height) {
        // Save indicator in top right
        this.saveIndicator = this.add.text(width - 20, 20, 'Saved', {
            fontSize: '14px',
            fill: '#4CAF50'
        }).setOrigin(1, 0);

        // ============================================================================
        // AI NOTE: PHASER TIMING ISSUE FIX
        // ============================================================================
        // PROBLEM: this.time.addEvent() fails during scene creation with error:
        // "TypeError: Cannot read properties of undefined (reading 'addEvent')"
        // 
        // ROOT CAUSE: The Phaser Time system (this.time) is not available during the
        // initial create() phase. It becomes available later in the scene lifecycle.
        // 
        // ORIGINAL BROKEN CODE:
        // this.time.addEvent({
        //     delay: 1000,
        //     callback: this.updateSaveIndicator,
        //     callbackScope: this,
        //     loop: true
        // });
        //
        // SOLUTION: Use manual timer in update() method instead of this.time.addEvent()
        // This ensures the timer works regardless of when this.time becomes available.
        // ============================================================================
        
        // PHASER FIX: Initialize save indicator timer after scene is fully ready
        this.saveIndicatorTimer = 0;
        this.saveIndicatorInterval = 1000; // 1 second
    }

    createStateInfoDisplay(width, height) {
        // Display current state information
        this.stateInfoText = this.add.text(20, height - 100, '', {
            fontSize: '14px',
            fill: '#666666',
            wordWrap: { width: width - 40 }
        });

        this.updateStateInfo();
    }

    setupStateEventListeners() {
        // ============================================================================
        // PHASER EVENT MANAGEMENT: Proper event listener setup
        // ============================================================================
        // PHASER PATTERN: Always use the same context (this) for adding and removing listeners
        // - this.game.events for global game events
        // - this.events for scene-specific events
        // - this.input for input events
        // - Always store references for proper cleanup
        
        // Game-level events (global events)
        this.game.events.on('goalsChanged', this.updateStateInfo, this);
        this.game.events.on('rewardsChanged', this.updateStateInfo, this);
        this.game.events.on('gameStateChanged', this.updateStateInfo, this);
        this.game.events.on('dataChanged', this.updateSaveIndicator, this);
        this.game.events.on('dataSaved', this.updateSaveIndicator, this);
        
        // Scene-level events (local to this scene)
        this.events.on('shutdown', this.onShutdown, this);
        this.events.on('pause', this.onPause, this);
        this.events.on('resume', this.onResume, this);
    }

    onShutdown() {
        console.log('MainMenuScene: shutdown event received');
    }

    onPause() {
        console.log('MainMenuScene: pause event received');
    }

    onResume() {
        console.log('MainMenuScene: resume event received');
    }

    handleClick(pointer) {
        // Handle general click events
        console.log('MainMenuScene: Click detected at', pointer.x, pointer.y);
    }

    updateStateInfo() {
        if (!this.game.appStateManager) return;

        const goals = this.game.appStateManager.getGoals();
        const rewards = this.game.appStateManager.getRewards();
        const gameState = this.game.appStateManager.getGameState();

        const info = [
            `Goals: ${goals?.length || 0} total`,
            `Rewards: ${rewards?.length || 0} total`,
            `Wins: ${gameState?.totalWins || 0}`,
            `Streak: ${gameState?.currentStreak || 0}`
        ].join(' | ');

        this.stateInfoText.setText(info);
    }

    updateSaveIndicator() {
        // Update save indicator when data changes
        if (this.saveIndicator) {
            if (this.game.storageManager) {
                const lastSaveTime = this.game.storageManager.lastSaveTime;
                if (lastSaveTime) {
                    this.saveIndicator.setText(`Last saved: ${lastSaveTime.toLocaleTimeString()}`);
                } else {
                    this.saveIndicator.setText('Not saved yet');
                }
            } else {
                this.saveIndicator.setText('Storage not ready');
            }
        }
    }

    /**
     * Enhanced scene state management following Phaser best practices
     * Provides comprehensive scene state validation and management
     */
    validateSceneState() {
        // Check if scene exists and is active
        if (!this || !this.sys) {
            console.warn('MainMenuScene: Scene or scene.sys not available');
            return false;
        }

        // Check if scene is active
        if (!this.sys.isActive()) {
            console.warn('MainMenuScene: Scene is not active');
            return false;
        }

        // Check if scene is visible
        if (!this.sys.isVisible()) {
            console.warn('MainMenuScene: Scene is not visible');
            return false;
        }

        // Check if scene is shutting down
        if (this.sys.isShuttingDown()) {
            console.warn('MainMenuScene: Scene is shutting down');
            return false;
        }

        // Check if cameras are available
        if (!this.cameras || !this.cameras.main) {
            console.warn('MainMenuScene: Cameras not available');
            return false;
        }

        // Check if add method is available (scene is fully initialized)
        if (typeof this.add !== 'function') {
            console.warn('MainMenuScene: Scene.add method not available');
            return false;
        }

        // All checks passed - scene is ready
        return true;
    }

    /**
     * Get current scene state information
     * Following Phaser best practices for scene state debugging
     */
    getSceneState() {
        return {
            status: this.sys.getStatus(),
            isActive: this.sys.isActive(),
            isVisible: this.sys.isVisible(),
            isSleeping: this.sys.isSleeping(),
            isShuttingDown: this.sys.isShuttingDown(),
            childrenCount: this.children.list.length,
            camera: {
                x: this.cameras.main.x,
                y: this.cameras.main.y,
                width: this.cameras.main.width,
                height: this.cameras.main.height,
                zoom: this.cameras.main.zoom
            }
        };
    }

    update(time, delta) {
        // ============================================================================
        // AI NOTE: MANUAL TIMER IMPLEMENTATION (Alternative to this.time.addEvent)
        // ============================================================================
        // WHY THIS EXISTS: Phaser's this.time system is not available during scene
        // creation, causing "Cannot read properties of undefined" errors.
        //
        // HOW IT WORKS:
        // 1. this.saveIndicatorTimer accumulates delta time (milliseconds)
        // 2. When it reaches this.saveIndicatorInterval (1000ms), trigger callback
        // 3. Reset timer to 0 for next cycle
        //
        // ALTERNATIVES CONSIDERED:
        // - setTimeout(): Works but not integrated with Phaser's game loop
        // - this.time.addEvent() in scene 'ready' event: More complex, same result
        // - Manual timer in update(): Simple, reliable, Phaser-compatible
        // ============================================================================
        
        // PHASER FIX: Manual timer for save indicator updates
        if (this.saveIndicatorTimer !== undefined) {
            this.saveIndicatorTimer += delta;
            if (this.saveIndicatorTimer >= this.saveIndicatorInterval) {
                this.updateSaveIndicator();
                this.saveIndicatorTimer = 0;
            }
        }
    }

    shutdown() {
        // PHASER STANDARD: Clean up Game Object buttons
        if (this.buttonGroup) {
            this.buttonGroup.forEach(({ button, text }) => {
                // PHASER STANDARD: Remove interactive handling first
                button.removeInteractive();
                // PHASER STANDARD: Remove all event listeners
                button.removeAllListeners();
                // PHASER STANDARD: Destroy Game Objects
                button.destroy();
                text.destroy();
            });
            this.buttonGroup = [];
        }
        
        // Clean up event listeners
        this.game.events.off('goalsChanged', this.updateStateInfo, this);
        this.game.events.off('rewardsChanged', this.updateStateInfo, this);
        this.game.events.off('gameStateChanged', this.updateStateInfo, this);
        this.game.events.off('dataChanged', this.updateSaveIndicator, this);
        this.game.events.off('dataSaved', this.updateSaveIndicator, this);
        
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
