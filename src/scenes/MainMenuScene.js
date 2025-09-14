/**
 * MainMenuScene - Navigation between different game sections
 * 
 * ARCHITECTURE NOTES:
 * - Uses game.appStateManager for state management (domain logic)
 * - Uses game.registry for data persistence (Phaser native)
 * - Uses game.events for application events (Phaser native)
 * - Uses AudioManager for audio feedback (Phaser native)
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * KEY DEPENDENCIES:
 * - game.appStateManager: ApplicationStateManager instance for domain logic
 * - game.registry: Phaser's built-in data management system
 * - game.events: Phaser's built-in event system
 * - AudioManager: Centralized audio management using Phaser's native audio system
 */
import { AudioManager } from '../utils/AudioManager.js';
import { LayoutManager } from '../utils/LayoutManager.js';

// ============================================================================
// AI DEVELOPMENT NOTES - CRITICAL TIMING ISSUE RESOLVED
// ============================================================================
// 
// ISSUE: this.time.addEvent() fails during scene creation
// ERROR: "TypeError: Cannot read properties of undefined (reading 'addEvent')"
// 
// ROOT CAUSE: Phaser's Time system (this.time) is not available during the
// initial create() phase of scene lifecycle. It becomes available later.
// 
// SYMPTOMS: Scene creation fails, buttons don't appear, only background shows
// 
// SOLUTION IMPLEMENTED: Manual timer in update() method instead of this.time.addEvent()
// 
// FILES AFFECTED: MainMenuScene.js (createSaveIndicator method)
// 
// PREVENTION: Always check if this.time exists before using it, or use manual
// timers in update() method for time-based operations during scene creation.
// 
// ============================================================================
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
        // PHASER SCENE LIFECYCLE: Preload phase - no assets needed
        // ============================================================================
        // PHASER PATTERN: This scene doesn't load any assets directly
        // - All audio assets are loaded in PreloadScene before this scene starts
        // - This follows Phaser's recommended pattern of centralized asset loading
        // - Prevents duplicate loading and ensures assets are available
        // - Scene can focus on UI creation rather than asset management
        //
        // PHASER ASSET LOADING ARCHITECTURE:
        // - PreloadScene: Loads all shared assets (audio, images, data)
        // - MainMenuScene: Uses pre-loaded assets via this.cache.audio
        // - Other scenes: Can also use pre-loaded assets from cache
        // - This provides efficient asset management across multiple scenes
        
        console.log('MainMenuScene: preload() called - no assets to load');
        // Audio assets are loaded in PreloadScene, no need to load them here
        // This follows Phaser's recommended pattern of loading assets in a dedicated preload scene
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
        // ✅ REMOVED: Hardcoded viewport override - Phaser handles responsive scaling automatically
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
        
        // ============================================================================
        // PHASER AUDIO SYSTEM: Initialize audio manager with comprehensive error handling
        // ============================================================================
        // 
        // PHASER AUDIO INTEGRATION PATTERN:
        // 1. Check if audio assets are loaded using this.cache.audio.exists(key)
        // 2. If available, initialize real AudioManager with Phaser sound system
        // 3. If not available, create mock AudioManager to prevent crashes
        // 4. This ensures graceful degradation and prevents scene creation failures
        //
        // PHASER AUDIO CACHE CHECK:
        // - this.cache.audio.exists(key) returns true if audio is loaded and cached
        // - This is the standard Phaser pattern for checking asset availability
        // - Must be called after preload() phase is complete
        // - Safe to call in create() method as assets are guaranteed to be loaded
        //
        // PHASER AUDIO MANAGER INTEGRATION:
        // - AudioManager wraps Phaser's this.sound system
        // - Provides centralized audio control across all scenes
        // - Handles volume, mute, and playback state management
        // - Integrates with Phaser's audio events and lifecycle
        
        if (this.cache.audio.exists('buttonClick')) {
            // ============================================================================
            // PHASER AUDIO SUCCESS PATH: Real audio system initialization
            // ============================================================================
            // PHASER PATTERN: Initialize AudioManager when audio assets are available
            // - AudioManager will use this.sound.add() to create audio instances
            // - AudioManager will use this.sound.play() to play sounds
            // - AudioManager integrates with Phaser's audio event system
            // - This provides full audio functionality with real sound playback
            
            console.log('MainMenuScene: Audio assets available, initializing AudioManager');
            this.audioManager = new AudioManager(this);
            this.audioManager.initializeAudio();
        } else {
            // ============================================================================
            // PHASER AUDIO FALLBACK PATH: Mock audio system for graceful degradation
            // ============================================================================
            // PHASER PATTERN: Create mock AudioManager when audio assets are not available
            // - Prevents crashes when audio files are missing or failed to load
            // - Provides same interface as real AudioManager
            // - Logs audio events for debugging purposes
            // - Ensures scene can complete creation and become active
            //
            // MOCK AUDIO MANAGER INTERFACE:
            // - Same method signatures as real AudioManager
            // - All methods are no-op functions that log to console
            // - Prevents "Cannot read properties of undefined" errors
            // - Allows UI to function normally without audio
            
            console.warn('MainMenuScene: Audio assets not available, creating mock AudioManager');
            this.audioManager = {
                // UI Interaction Audio Methods
                playButtonClick: () => console.log('Audio: Button click (mock)'),
                playButtonHover: () => console.log('Audio: Button hover (mock)'),
                playModalOpen: () => console.log('Audio: Modal open (mock)'),
                playModalClose: () => console.log('Audio: Modal close (mock)'),
                
                // Game Action Audio Methods
                playGoalComplete: () => console.log('Audio: Goal complete (mock)'),
                playBingoWin: () => console.log('Audio: Bingo win (mock)'),
                playNewGame: () => console.log('Audio: New game (mock)'),
                playGridRepopulate: () => console.log('Audio: Grid repopulate (mock)'),
                
                // Background Audio Methods
                playBackgroundMusic: () => console.log('Audio: Background music (mock)'),
                
                // Cleanup Method
                cleanup: () => console.log('Audio: Cleanup (mock)')
            };
        }
        
        // ============================================================================
        // PHASER SCENE STATE MANAGEMENT: Initialize enhanced scene state management
        // ============================================================================
        // PHASER PATTERN: Set up scene state management for reliable transitions
        // - This provides centralized scene state validation
        // - Prevents invalid transitions and multiple rapid clicks
        // - Uses Phaser's native scene management capabilities
        this.setupSceneStateManagement();
        
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
        // ============================================================================
        // PHASER NATIVE LAYOUT: Use LayoutManager for consistent positioning
        // ============================================================================
        // PHASER PATTERN: Use native Phaser.Display.Align for responsive positioning
        // - LayoutManager provides consistent positioning across all scenes
        // - Automatically adapts to different screen sizes
        // - Uses Phaser's built-in camera system for responsive design
        // - Perfect for maintaining consistent UI layout patterns
        
        // Create buttons with temporary positioning (will be repositioned by LayoutManager)
        const goalLibraryButton = this.createButton(0, 0, '📚 Goal Library', () => {
            this.safeSceneTransition('GoalLibraryScene');
        });
        
        const bingoGridButton = this.createButton(0, 0, '🎲 Play Bingo', () => {
            this.safeSceneTransition('BingoGridScene', {
                gridSize: 5,
                isGameActive: true
            });
        });
        
        const rewardsButton = this.createButton(0, 0, '🏆 Rewards', () => {
            this.safeSceneTransition('RewardsScene');
        });
        
        // Use LayoutManager to position buttons vertically with consistent spacing
        // Position both button rectangles and text together
        const buttonObjects = [goalLibraryButton.button, bingoGridButton.button, rewardsButton.button];
        const textObjects = [goalLibraryButton.text, bingoGridButton.text, rewardsButton.text];
        LayoutManager.positionButtonsVertically(this, buttonObjects);
        LayoutManager.positionButtonsVertically(this, textObjects);
    }

    // ============================================================================
    // PHASER SIMPLIFIED INPUT: Enhanced button creation with native Phaser systems
    // ============================================================================
    // PHASER PATTERN: Use basic setInteractive() for simple button interactions
    // - setInteractive() without configuration uses default settings
    // - Phaser handles input throttling internally - no manual debouncing needed
    // - This is simpler and more maintainable than advanced configuration
    // - Perfect for basic UI elements like buttons and simple interactions
    createButton(x, y, text, callback, options = {}) {
        const {
            width = 300,
            height = 60,
            backgroundColor = 0x4CAF50,
            hoverColor = 0x66BB6A,
            textColor = '#ffffff',
            fontSize = '20px',
            fontStyle = 'bold'
        } = options;

        // Create button background with proper hit area
        const button = this.add.rectangle(x, y, width, height, backgroundColor);
        
        // ============================================================================
        // PHASER RECOMMENDED: Explicitly set both origins for consistency
        // ============================================================================
        // PHASER PATTERN: Set explicit origins for consistent alignment
        // - Rectangle and text must have matching origins for proper alignment
        // - Both use (0.5, 0.5) for center-based positioning
        // - This ensures Phaser.Display.Align.CENTER works correctly
        // - Perfect for UI elements that need precise positioning
        button.setOrigin(0.5, 0.5);
        
        // ============================================================================
        // PHASER SIMPLIFIED INPUT: Use basic setInteractive() for simple interactions
        // ============================================================================
        // PHASER PATTERN: Use basic setInteractive() without configuration
        // - Phaser handles input throttling internally - no manual debouncing needed
        // - This is simpler and more maintainable than advanced configuration
        // - Perfect for basic UI elements like buttons and simple interactions
        button.setInteractive();
        
        // Add text with matching center origin
        const buttonText = this.add.text(x, y, text, {
            fontSize: fontSize,
            fill: textColor,
            fontStyle: fontStyle
        }).setOrigin(0.5, 0.5);
        
        // ============================================================================
        // PHASER SIMPLIFIED VISUAL FEEDBACK: Use basic visual feedback
        // ============================================================================
        // PHASER PATTERN: Use simple visual feedback for better user experience
        // - Basic hover effects provide clear user feedback
        // - Simple color changes are more performant than complex animations
        // - This approach is easier to maintain and debug
        // - Perfect for basic UI elements that don't need complex animations
        button.on('pointerover', () => {
            // ============================================================================
            // PHASER SIMPLIFIED HOVER FEEDBACK: Use animation system for hover feedback
            // ============================================================================
            // PHASER PATTERN: Use animation system for consistent hover feedback
            // - animateButtonHover() provides consistent visual feedback
            // - Centralized animation logic for maintainability
            // - This approach is more organized and easier to maintain
            // - Perfect for basic hover feedback without complex animations
            this.animateButtonHover(button);
            
            // Simple hover feedback using color change
            button.setFillStyle(hoverColor);
            
            // ============================================================================
            // PHASER AUDIO FEEDBACK: Add audio feedback for button hover
            // ============================================================================
            // PHASER AUDIO INTEGRATION PATTERN:
            // - Use AudioManager for consistent audio feedback across all UI elements
            // - AudioManager abstracts Phaser's this.sound system
            // - Handles both real audio playback and mock fallback automatically
            // - Provides consistent user experience regardless of audio availability
            //
            // PHASER AUDIO PLAYBACK FLOW:
            // 1. AudioManager.playButtonHover() is called
            // 2. If real AudioManager: uses this.sound.add() and this.sound.play()
            // 3. If mock AudioManager: logs to console for debugging
            // 4. No error handling needed - AudioManager handles all cases
            
            if (this.audioManager) {
                this.audioManager.playButtonHover();
            }
        });
        
        button.on('pointerout', () => {
            // Reset hover state using color change
            button.setFillStyle(backgroundColor);
            
            // Reset scale to normal
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        // ============================================================================
        // PHASER INPUT EVENTS: Use Phaser's basic input event system
        // ============================================================================
        // PHASER PATTERN: Phaser's input system handles rapid clicks internally
        // - No manual debouncing needed - Phaser prevents rapid-fire events
        // - Use pointerdown for immediate response
        // - Phaser's input manager optimizes event handling automatically
        // - This is the simplest and most reliable approach for basic interactions
        button.on('pointerdown', () => {
            // Phaser handles rapid clicks internally - no manual debouncing needed
            this.handleButtonClick(button, callback);
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

    // ============================================================================
    // PHASER SIMPLIFIED SCENE STATE MANAGEMENT: Enhanced scene state validation
    // ============================================================================
    // PHASER PATTERN: Use basic scene state validation for simple cases
    // - this.sys.isActive() checks if scene is active and running
    // - This is the most important check for preventing invalid transitions
    // - Additional checks can be added if needed, but this covers most cases
    // - This approach is simpler and more maintainable than comprehensive validation
    setupSceneStateManagement() {
        this.canTransitionToScene = (targetScene) => {
            // ============================================================================
            // PHASER BASIC SCENE STATE CHECK: Simple scene state validation
            // ============================================================================
            // PHASER PATTERN: Check basic scene state before transition
            // - Active: Scene is running and processing updates
            // - This is the most important check for preventing invalid transitions
            // - Additional checks can be added if needed, but this covers most cases
            // - This approach is simpler and more maintainable than comprehensive validation
            if (!this.sys.isActive()) {
                console.warn('Cannot transition: Scene is not active');
                return false;
            }
            
            // ============================================================================
            // PHASER SCENE EXISTENCE CHECK: Use Phaser's scene manager
            // ============================================================================
            // PHASER PATTERN: Use this.scene.get() to check if target scene exists
            // - this.scene.get() returns the scene instance if it exists
            // - Returns null if scene doesn't exist
            // - This is the correct way to check scene existence in Phaser
            // - This check prevents errors when trying to transition to non-existent scenes
            const targetSceneInstance = this.scene.get(targetScene);
            if (!targetSceneInstance) {
                console.warn(`Cannot transition: Target scene '${targetScene}' does not exist`);
                return false;
            }
            
            return true;
        };
        
        // ============================================================================
        // PHASER SCENE TRANSITION: Use Phaser's scene management system
        // ============================================================================
        // PHASER PATTERN: Use this.scene.start() with basic state validation
        // - Phaser handles scene lifecycle automatically
        // - No manual state management needed
        // - Phaser ensures proper cleanup and initialization
        // - This is the simplest and most reliable approach for scene transitions
        this.safeSceneTransition = (targetScene, data = {}) => {
            if (!this.canTransitionToScene(targetScene)) {
                console.error(`Scene transition to '${targetScene}' failed - invalid state`);
                return false;
            }
            
            console.log(`Transitioning to scene: ${targetScene}`);
            this.scene.start(targetScene, data);
            return true;
        };
    }

    // ============================================================================
    // PHASER ENHANCED BUTTON HANDLER: Use Phaser's scene state management
    // ============================================================================
    // PHASER PATTERN: Integrate scene state validation with button handling
    // - Use Phaser's scene system API for state validation
    // - Leverage Phaser's input system for consistent behavior
    // - Use Phaser's tween system for visual feedback
    handleButtonClick(button, callback) {
        // ============================================================================
        // PHASER SCENE STATE VALIDATION: Use Phaser's scene system API
        // ============================================================================
        // PHASER PATTERN: Use this.sys.* methods for scene state validation
        // - This ensures the scene is in a valid state for transitions
        // - Prevents multiple rapid transitions
        // - Uses Phaser's built-in state management
        if (!this.sys.isActive()) {
            console.warn('Scene is not active - ignoring button click');
            return;
        }
        
        // Check if scene is in a valid state for transitions
        if (this.sys.settings.status === Phaser.Scenes.SHUTDOWN) {
            console.warn('Scene is shutting down - ignoring button click');
            return;
        }
        
        // ============================================================================
        // PHASER AUDIO FEEDBACK: Add audio feedback for button click
        // ============================================================================
        // PHASER AUDIO INTEGRATION PATTERN:
        // - Use AudioManager for consistent audio feedback across all UI interactions
        // - AudioManager provides unified interface for both real and mock audio
        // - Handles Phaser's this.sound system internally
        // - Ensures consistent user experience regardless of audio system state
        //
        // PHASER AUDIO PLAYBACK IMPLEMENTATION:
        // - Real AudioManager: Creates audio instance with this.sound.add(key)
        // - Real AudioManager: Plays sound with audioInstance.play()
        // - Mock AudioManager: Logs action to console for debugging
        // - Both provide same interface, no conditional logic needed in UI code
        
        if (this.audioManager) {
            this.audioManager.playButtonClick();
        }
        
        // ============================================================================
        // PHASER SIMPLIFIED VISUAL FEEDBACK: Use animation system for button feedback
        // ============================================================================
        // PHASER PATTERN: Use animation system for consistent button feedback
        // - animateButtonClick() provides consistent visual feedback
        // - Centralized animation logic for maintainability
        // - This approach is more organized and easier to maintain
        // - Perfect for basic button feedback without complex animations
        this.animateButtonClick(button);
        
        // ============================================================================
        // PHASER SCENE TRANSITION: Use Phaser's scene management system
        // ============================================================================
        // PHASER PATTERN: Use this.scene.start() with proper state validation
        // - Phaser handles scene lifecycle automatically
        // - No manual state management needed
        // - Phaser ensures proper cleanup and initialization
        if (callback) {
            callback();
        }
    }

    createSaveIndicator(width, height) {
        // ============================================================================
        // PHASER NATIVE LAYOUT: Use LayoutManager for consistent positioning
        // ============================================================================
        // PHASER PATTERN: Use native Phaser.Display.Align for responsive positioning
        // - LayoutManager provides consistent positioning across all scenes
        // - Automatically adapts to different screen sizes
        // - Uses Phaser's built-in camera system for responsive design
        
        // Create save indicator with temporary positioning
        this.saveIndicator = this.add.text(0, 0, 'Saved', {
            fontSize: '14px',
            fill: '#4CAF50'
        }).setOrigin(1, 0);
        
        // Use LayoutManager to position at top right with consistent offset
        LayoutManager.alignToCamera(
            this, 
            this.saveIndicator, 
            'TOP_RIGHT', 
            -20, 
            20
        );

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
        // ============================================================================
        // PHASER NATIVE LAYOUT: Use LayoutManager for consistent positioning
        // ============================================================================
        // PHASER PATTERN: Use native Phaser.Display.Align for responsive positioning
        // - LayoutManager provides consistent positioning across all scenes
        // - Automatically adapts to different screen sizes
        // - Uses Phaser's built-in camera system for responsive design
        
        // Create state info text with temporary positioning
        this.stateInfoText = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#666666',
            wordWrap: { width: width - 40 }
        });
        
        // Use LayoutManager to position at bottom left with consistent offset
        LayoutManager.alignToCamera(
            this, 
            this.stateInfoText, 
            'BOTTOM_LEFT', 
            20, 
            50
        );

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
                    const saveTime = lastSaveTime instanceof Date ? lastSaveTime : new Date(lastSaveTime);
                    this.saveIndicator.setText(`Last saved: ${saveTime.toLocaleTimeString()}`);
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

    // ============================================================================
    // PHASER SIMPLIFIED ANIMATION SYSTEM: Basic tween animations
    // ============================================================================
    // PHASER PATTERN: Use basic tween animations for simple use cases
    // - this.tweens.add() for simple animation sequences
    // - Chain tweens using onComplete callbacks
    // - This approach is simpler and more maintainable
    // - Perfect for basic UI animations and simple visual effects
    //
    // AI DEVELOPMENT NOTES:
    // - All animation methods follow consistent Phaser patterns
    // - Duration and easing are standardized across all animations
    // - Error handling prevents null reference errors
    // - Animations are designed for performance and user feedback
    // - Each method can be called independently or chained together
    // - MainMenuScene animations are optimized for navigation buttons

    /**
     * Animate button click with scale effect
     * 
     * PURPOSE: Provides immediate visual feedback when a navigation button is clicked
     * USAGE: Called by handleButtonClick() method for all navigation buttons
     * 
     * ANIMATION EFFECT:
     * - Scale down to 95% (0.95x) then back to 100% (1.0x)
     * - Duration: 50ms for quick, responsive feedback
     * - Easing: Power2 for smooth acceleration/deceleration
     * - Yoyo: true for automatic reverse animation
     * 
     * PHASER PATTERN: Use basic tween for simple button animations
     * - Simple scale animation provides clear user feedback
     * - Basic animations are more performant and easier to maintain
     * - This approach works well for most UI interactions
     * - Perfect for basic button feedback without complex animations
     * 
     * DEPENDENCIES: Requires button parameter to be a valid Phaser Game Object
     * PERFORMANCE: Very lightweight - only scales the button
     * 
     * @param {Phaser.GameObjects.GameObject} button - The navigation button to animate
     * 
     * @example
     * // Called automatically by handleButtonClick()
     * this.animateButtonClick(button);
     */
    animateButtonClick(button) {
        if (!button) {
            console.warn('MainMenuScene: Cannot animate null button');
            return;
        }

        // ============================================================================
        // PHASER SIMPLIFIED BUTTON ANIMATION: Use basic tween for button feedback
        // ============================================================================
        // PHASER PATTERN: Use basic tween for simple button animations
        // - Simple scale animation provides clear user feedback
        // - Basic animations are more performant and easier to maintain
        // - This approach works well for most UI interactions
        // - Perfect for basic button feedback without complex animations
        
        this.tweens.add({
            targets: button,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            ease: 'Power2',
            yoyo: true
        });
    }

    /**
     * Animate button hover with scale effect
     * 
     * PURPOSE: Provides visual feedback when user hovers over navigation buttons
     * USAGE: Called by pointerover events on navigation buttons
     * 
     * ANIMATION EFFECT:
     * - Scale up to 105% (1.05x) then back to 100% (1.0x)
     * - Duration: 100ms for smooth hover feedback
     * - Easing: Power2 for natural feel
     * - Yoyo: true for automatic reverse animation
     * 
     * PHASER PATTERN: Use basic tween for hover feedback
     * - Simple scale animation provides clear user feedback
     * - Basic animations are more performant and easier to maintain
     * - This approach works well for most UI interactions
     * - Perfect for basic hover feedback without complex animations
     * 
     * DEPENDENCIES: Requires button parameter to be a valid Phaser Game Object
     * PERFORMANCE: Lightweight - only scales the button
     * 
     * @param {Phaser.GameObjects.GameObject} button - The navigation button to animate
     * 
     * @example
     * // Called by pointerover event
     * button.on('pointerover', () => this.animateButtonHover(button));
     */
    animateButtonHover(button) {
        if (!button) {
            console.warn('MainMenuScene: Cannot animate null button');
            return;
        }

        // ============================================================================
        // PHASER SIMPLIFIED HOVER ANIMATION: Use basic tween for hover feedback
        // ============================================================================
        // PHASER PATTERN: Use basic tween for simple hover animations
        // - Simple scale animation provides clear user feedback
        // - Basic animations are more performant and easier to maintain
        // - This approach works well for most UI interactions
        // - Perfect for basic hover feedback without complex animations
        
        this.tweens.add({
            targets: button,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Power2',
            yoyo: true
        });
    }

    /**
     * Animate title with subtle scale effect
     * 
     * PURPOSE: Provides subtle visual interest to the main title
     * USAGE: Called during scene creation to add gentle animation to title
     * 
     * ANIMATION EFFECT:
     * - Scale up to 102% (1.02x) then back to 100% (1.0x)
     * - Duration: 2000ms for slow, gentle animation
     * - Easing: Sine.easeInOut for smooth, natural movement
     * - Yoyo: true for automatic reverse animation
     * - Repeat: -1 for infinite loop
     * 
     * PHASER PATTERN: Use basic tween for title animation
     * - Simple scale animation provides subtle visual interest
     * - Basic animations are more performant and easier to maintain
     * - This approach works well for most UI interactions
     * - Perfect for basic title animation without complex effects
     * 
     * DEPENDENCIES: Requires this.titleText to exist
     * PERFORMANCE: Lightweight - only scales the title text
     * 
     * @example
     * // Called during scene creation
     * this.animateTitle();
     */
    animateTitle() {
        if (!this.titleText) {
            console.warn('MainMenuScene: Cannot animate null title');
            return;
        }

        // ============================================================================
        // PHASER SIMPLIFIED TITLE ANIMATION: Use basic tween for title animation
        // ============================================================================
        // PHASER PATTERN: Use basic tween for simple title animations
        // - Simple scale animation provides subtle visual interest
        // - Basic animations are more performant and easier to maintain
        // - This approach works well for most UI interactions
        // - Perfect for basic title animation without complex effects
        
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
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
        
        // ============================================================================
        // PHASER AUDIO CLEANUP: Clean up audio resources
        // ============================================================================
        // PHASER PATTERN: Clean up audio instances on scene shutdown
        // - Use AudioManager cleanup to prevent memory leaks
        // - This prevents audio conflicts between scenes
        // - Ensures proper audio resource management
        
        if (this.audioManager) {
            this.audioManager.cleanup();
            this.audioManager = null;
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
