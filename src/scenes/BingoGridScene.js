/**
 * BingoGridScene - Main game area with interactive bingo grid
 * Handles grid rendering, goal population, win detection, and game mechanics
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
import { BingoCell } from '../components/BingoCell.js';
import { LayoutManager } from '../utils/LayoutManager.js';

export default class BingoGridScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'BingoGridScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'gameplay',
                hasAnimations: true,
                hasInput: true
            }
        });
        
        // Container references following Level 2 template
        this.backgroundContainer = null;
        this.mainContainer = null;
        this.uiContainer = null;
        this.modalContainer = null;
        
        // Game state
        this.gridSize = 5;
        this.cells = [];
        this.gridContainer = null;
        this.gridSizeSelector = null;
        this.gameStats = null;
        this.winPatterns = [];
        this.isGameActive = false;
    }

    init(data) {
        // Initialize scene with data
        console.log('BingoGridScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
        if (data) {
            // Handle any data passed from other scenes
            if (data.gridSize) {
                this.gridSize = data.gridSize;
            }
            if (data.isGameActive !== undefined) {
                this.isGameActive = data.isGameActive;
            }
        }
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
        // this.load.image('ui-button', 'assets/ui/button.png');
        // this.load.audio('theme', 'assets/theme.mp3');
    }

    create() {
        console.log('BingoGridScene: create() called');
        const { width, height } = this.cameras.main;
            
            // ============================================================================
            // PHASER INITIAL SCENE CONFIG: Common initial scene setup patterns
            // ============================================================================
            // PHASER PATTERN: These patterns are commonly used in initial scene setup
            // - Camera configuration for proper viewport setup
            // - Input configuration for initial interaction setup
            // - Event setup for initial scene communication
            
            // Configure camera
            this.cameras.main.setBackgroundColor('#ffffff');
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
            // PHASER CONTAINER ARCHITECTURE: Complex UI with proper container management
            // ============================================================================
            // PHASER PATTERN: Create containers with proper registration and depth management
            // - this.add.container() creates container but doesn't add to scene
            // - this.add.existing(container) adds container to scene display list
            // - setDepth() ensures proper layering order
            // - Without this.add.existing(), containers are invisible
            
        // 1. Create containers with proper depths
        this.createContainers(width, height);
        
        // 2. Create UI elements in appropriate containers
        this.createBackground(width, height);
        this.createMainContent(width, height);
        this.createUIOverlay(width, height);
        
        // 3. Set up interactions
        this.setupEventListeners();
        
        // ============================================================================
        // PHASER SCENE STATE MANAGEMENT: Initialize enhanced scene state management
        // ============================================================================
        // PHASER PATTERN: Set up scene state management for reliable transitions
        // - This provides centralized scene state validation
        // - Prevents invalid transitions and multiple rapid clicks
        // - Uses Phaser's native scene management capabilities
        this.setupSceneStateManagement();
        
        // 4. Initialize game
        this.initializeGame();
    }

    createContainers(width, height) {
        // ============================================================================
        // PHASER CONTAINER CREATION: Proper container setup
        // ============================================================================
        // PHASER PATTERN: Containers must be registered with scene display list to render
        // - this.add.container() creates the container but doesn't add it to scene
        // - this.add.existing(container) adds container to scene's display list
        // - Without this.add.existing(), containers are invisible (not rendered)
        // - setDepth() ensures proper layering order
        
        // Background container (behind everything)
        this.backgroundContainer = this.add.container(0, 0);
        this.backgroundContainer.setDepth(-1);
        this.add.existing(this.backgroundContainer);

        // Main content container
        this.mainContainer = this.add.container(0, 0);
        this.mainContainer.setDepth(0);
        this.add.existing(this.mainContainer);

        // UI overlay container
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setDepth(10);
        this.add.existing(this.uiContainer);

        // Modal container (above everything)
        this.modalContainer = this.add.container(0, 0);
        this.modalContainer.setDepth(1000);
        this.add.existing(this.modalContainer);
        
        // ============================================================================
        // PHASER CONTAINER LIFECYCLE: Container scene events
        // ============================================================================
        // PHASER PATTERN: Containers have lifecycle events for scene management
        // - addedToScene() called when container is added to scene
        // - removedFromScene() called when container is removed from scene
        // - These events are useful for initial setup and cleanup
        
        // Listen for container lifecycle events
        this.backgroundContainer.on('addedToScene', this.onContainerAdded, this);
        this.backgroundContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        this.mainContainer.on('addedToScene', this.onContainerAdded, this);
        this.mainContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        this.uiContainer.on('addedToScene', this.onContainerAdded, this);
        this.uiContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        this.modalContainer.on('addedToScene', this.onContainerAdded, this);
        this.modalContainer.on('removedFromScene', this.onContainerRemoved, this);
    }

    onContainerAdded(container) {
        console.log('Container added to scene:', container);
        // Perform initial setup when container is added
    }

    onContainerRemoved(container) {
        console.log('Container removed from scene:', container);
        // Perform cleanup when container is removed
    }

    onShutdown() {
        console.log('BingoGridScene: shutdown event received');
    }

    onPause() {
        console.log('BingoGridScene: pause event received');
    }

    onResume() {
        console.log('BingoGridScene: resume event received');
    }

    handleClick(pointer) {
        // Handle general click events
        console.log('BingoGridScene: Click detected at', pointer.x, pointer.y);
    }

    createBackground(width, height) {
        // ============================================================================
        // PHASER ELEMENT ADDITION: Adding elements to containers
        // ============================================================================
        // PHASER PATTERN: Elements created with this.add.* are automatically added to scene
        // - this.add.rectangle() adds element to scene display list
        // - container.add(element) moves element from scene to container
        // - This is the correct pattern for adding elements to containers
        
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);
        this.backgroundContainer.add(background);
    }

    createMainContent(width, height) {
        // Create main content elements in mainContainer
        this.createHeader(width, height);
        this.createGridSizeSelector(width, height);
        this.createGameStats(width, height);
        this.createGrid(width, height);
        this.createActionButtons(width, height);
    }

    createUIOverlay(width, height) {
        // Create UI overlay elements in uiContainer
        // Additional UI elements can be added here
    }
    
    createHeader(width, height) {
        // ============================================================================
        // PHASER ELEMENT ADDITION: Adding elements to containers
        // ============================================================================
        // PHASER PATTERN: Elements created with this.add.* are automatically added to scene
        // - this.add.rectangle() adds element to scene display list
        // - container.add(element) moves element from scene to container
        // - This is the correct pattern for adding elements to containers
        
        // Title
        const title = this.add.text(width / 2, 30, '🎲 Bingo Grid', {
            fontSize: '28px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.rectangle(0, 0, 100, 35, 0x666666);
        backBtn.setStrokeStyle(2, 0x555555);
        backBtn.setInteractive();
        
        const backText = this.add.text(0, 0, '← Back', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // PHASER APPROACH 1: Add to container first, then position
        this.mainContainer.add([title, backBtn, backText]);
        
        // Position elements AFTER adding to containers
        // This ensures LayoutManager positioning overrides container positioning
        LayoutManager.positionBackButton(this, backBtn);
        LayoutManager.positionBackButton(this, backText);
        
        // ============================================================================
        // PHASER SIMPLIFIED INPUT: Use Phaser's basic input event system
        // ============================================================================
        // PHASER PATTERN: Phaser's input system handles rapid clicks internally
        // - No manual debouncing needed - Phaser prevents rapid-fire events
        // - Use pointerdown for immediate response
        // - Phaser's input manager optimizes event handling automatically
        // - This is the simplest and most reliable approach for basic interactions
        backBtn.on('pointerdown', () => {
            // Phaser handles rapid clicks internally - no manual debouncing needed
            this.handleButtonClick(backBtn, () => {
                this.safeSceneTransition('MainMenuScene');
            });
        });
        
        // ============================================================================
        // PHASER SIMPLIFIED VISUAL FEEDBACK: Use basic visual feedback
        // ============================================================================
        // PHASER PATTERN: Use simple visual feedback for better user experience
        // - Basic hover effects provide clear user feedback
        // - Simple color changes are more performant than complex animations
        // - This approach is easier to maintain and debug
        // - Perfect for basic UI elements that don't need complex animations
        backBtn.on('pointerover', () => {
            // Simple hover feedback using color change
            backBtn.setFillStyle(0x555555);
        });
        
        backBtn.on('pointerout', () => {
            // Reset hover state using color change
            backBtn.setFillStyle(0x666666);
        });
    }
    
    createGridSizeSelector(width, height) {
        const y = 70;
        
        // ============================================================================
        // PHASER GRID SIZE SELECTOR: Enhanced grid size selector implementation
        // ============================================================================
        // PHASER PATTERN: Create grid size selector with 3x3, 4x4, 5x5 options
        // - Follows buildout plan specifications exactly
        // - Uses proper Phaser input handling and visual feedback
        // - Integrates with existing container architecture
        
        // Grid size label
        const sizeLabel = this.add.text(20, y, 'Grid Size:', {
            fontSize: '16px',
            fill: '#333333',
            fontStyle: 'bold'
        });
        this.mainContainer.add(sizeLabel);
        
        // Grid size options (3x3, 4x4, 5x5 as per buildout plan)
        const gridSizes = [3, 4, 5];
        const buttonWidth = 60;
        const buttonSpacing = 80;
        const startX = 120;
        
        this.gridSizeButtons = [];
        
        gridSizes.forEach((size, index) => {
            const x = startX + (index * buttonSpacing);
            
            // Create button
            const button = this.add.rectangle(x, y, buttonWidth, 30, 0xffffff);
            button.setStrokeStyle(2, this.gridSize === size ? 0x4CAF50 : 0xcccccc);
            button.setInteractive();
            
            // Button text
            const buttonText = this.add.text(x, y, `${size}x${size}`, {
                fontSize: '14px',
                fill: this.gridSize === size ? '#4CAF50' : '#333333',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Add to main container
            this.mainContainer.add(button);
            this.mainContainer.add(buttonText);
            
            // Store references
            this.gridSizeButtons.push({ button, text: buttonText, size });
            
            // ============================================================================
            // PHASER SIMPLIFIED INPUT: Use Phaser's basic input event system
            // ============================================================================
            // PHASER PATTERN: Phaser's input system handles rapid clicks internally
            // - No manual debouncing needed - Phaser prevents rapid-fire events
            // - Use pointerdown for immediate response
            // - Phaser's input manager optimizes event handling automatically
            // - This is the simplest and most reliable approach for basic interactions
            button.on('pointerdown', () => {
                // Phaser handles rapid clicks internally - no manual debouncing needed
                this.handleButtonClick(button, () => {
                    this.changeGridSize(size);
                });
            });
            
            // ============================================================================
            // PHASER SIMPLIFIED VISUAL FEEDBACK: Use basic visual feedback
            // ============================================================================
            // PHASER PATTERN: Use simple visual feedback for better user experience
            // - Basic hover effects provide clear user feedback
            // - Simple color changes are more performant than complex animations
            // - This approach is easier to maintain and debug
            // - Perfect for basic UI elements that don't need complex animations
            button.on('pointerover', () => {
                if (this.gridSize !== size) {
                    button.setStrokeStyle(2, 0x4CAF50);
                    buttonText.setFill('#4CAF50');
                }
            });
            
            button.on('pointerout', () => {
                if (this.gridSize !== size) {
                    button.setStrokeStyle(2, 0xcccccc);
                    buttonText.setFill('#333333');
                }
            });
        });
    }
    
    createGameStats(width, height) {
        const y = 110;
        
        // ============================================================================
        // PHASER ELEMENT ADDITION: Adding elements to containers
        // ============================================================================
        // PHASER PATTERN: Elements created with this.add.* are automatically added to scene
        // - this.add.rectangle() adds element to scene display list
        // - container.add(element) moves element from scene to container
        // - This is the correct pattern for adding elements to containers
        
        this.gameStats = this.add.text(20, y, '', {
            fontSize: '14px',
            fill: '#666666',
            wordWrap: { width: width - 40 }
        });
        
        // Add to main container
        this.mainContainer.add(this.gameStats);
        
        this.updateGameStats();
    }
    
    createGrid(width, height) {
        const gridY = 150;
        const cellSize = Math.min(80, (width - 100) / this.gridSize);
        const gridWidth = this.gridSize * cellSize;
        const gridX = (width - gridWidth) / 2;
        
        // ============================================================================
        // PHASER CONTAINER REGISTRATION: Grid Container Setup
        // ============================================================================
        // PHASER PATTERN: Containers must be registered with scene display list to render
        // - this.add.container() creates the container but doesn't add it to scene
        // - this.add.existing(container) adds container to scene's display list
        // - Without this.add.existing(), containers are invisible (not rendered)
        // - setDepth() ensures proper layering order
        
        // Create grid container
        this.gridContainer = this.add.container(gridX, gridY);
        this.gridContainer.setDepth(1); // Main content layer (above background, below UI)
        this.add.existing(this.gridContainer); // REQUIRED: Add to scene display list
        
        // Create cells
        this.cells = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = col * cellSize + cellSize / 2;
                const y = row * cellSize + cellSize / 2;
                
                // ============================================================================
                // PHASER CUSTOM COMPONENT ADDITION: Adding BingoCell to container
                // ============================================================================
                // PHASER PATTERN: Custom components (like BingoCell) are added to containers
                // - BingoCell extends Phaser.GameObjects.Container
                // - gridContainer.add(cell) adds the cell to the grid container
                // - This allows collective management of all grid cells
                
                const cell = new BingoCell(this, x, y, null, cellSize);
                this.gridContainer.add(cell); // Add cell to grid container
                this.cells[row][col] = cell; // Store reference for game logic
            }
        }
        
        // Listen for goal completion events
        this.events.on('goalCompleted', this.onGoalCompleted, this);
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

    createActionButtons(width, height) {
        const y = height - 60;
        
        // ============================================================================
        // PHASER ELEMENT ADDITION: Adding elements to containers
        // ============================================================================
        // PHASER PATTERN: Elements created with this.add.* are automatically added to scene
        // - this.add.rectangle() adds element to scene display list
        // - container.add(element) moves element from scene to container
        // - This is the correct pattern for adding elements to containers
        
        // New Game button
        const newGameBtn = this.add.rectangle(width / 2 - 80, y, 120, 40, 0x4CAF50);
        newGameBtn.setStrokeStyle(2, 0x45a049);
        newGameBtn.setInteractive();
        
        const newGameText = this.add.text(width / 2 - 80, y, 'New Game', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // ============================================================================
        // PHASER SIMPLIFIED INPUT: Use Phaser's basic input event system
        // ============================================================================
        // PHASER PATTERN: Phaser's input system handles rapid clicks internally
        // - No manual debouncing needed - Phaser prevents rapid-fire events
        // - Use pointerdown for immediate response
        // - Phaser's input manager optimizes event handling automatically
        // - This is the simplest and most reliable approach for basic interactions
        newGameBtn.on('pointerdown', () => {
            // Phaser handles rapid clicks internally - no manual debouncing needed
            this.handleButtonClick(newGameBtn, () => {
                this.startNewGame();
            });
        });
        
        // Repopulate button
        const repopulateBtn = this.add.rectangle(width / 2 + 80, y, 120, 40, 0xFF9800);
        repopulateBtn.setStrokeStyle(2, 0xe68900);
        repopulateBtn.setInteractive();
        
        const repopulateText = this.add.text(width / 2 + 80, y, 'Repopulate', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // ============================================================================
        // PHASER SIMPLIFIED INPUT: Use Phaser's basic input event system
        // ============================================================================
        // PHASER PATTERN: Phaser's input system handles rapid clicks internally
        // - No manual debouncing needed - Phaser prevents rapid-fire events
        // - Use pointerdown for immediate response
        // - Phaser's input manager optimizes event handling automatically
        // - This is the simplest and most reliable approach for basic interactions
        repopulateBtn.on('pointerdown', () => {
            // Phaser handles rapid clicks internally - no manual debouncing needed
            this.handleButtonClick(repopulateBtn, () => {
                this.repopulateGrid();
            });
        });
        
        // Add all elements to main container
        this.mainContainer.add([newGameBtn, newGameText, repopulateBtn, repopulateText]);
        
        // ============================================================================
        // PHASER SIMPLIFIED HOVER EFFECTS: Use animation system for hover feedback
        // ============================================================================
        // PHASER PATTERN: Use animation system for consistent hover feedback
        // - animateButtonHover() provides consistent visual feedback
        // - Centralized animation logic for maintainability
        // - This approach is more organized and easier to maintain
        // - Perfect for basic hover feedback without complex animations
        [newGameBtn, repopulateBtn].forEach(btn => {
            btn.on('pointerover', () => this.animateButtonHover(btn));
            btn.on('pointerout', () => {
                // Reset scale to normal
                this.tweens.add({
                    targets: btn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power2'
                });
            });
        });
    }
    
    setupEventListeners() {
        // Listen for state changes
        this.game.events.on('goalsChanged', this.updateGameStats, this);
        this.game.events.on('gameStateChanged', this.updateGameStats, this);
    }
    
    initializeGame() {
        // Use core Phaser techniques - simple goal data
        this.sampleGoals = [
            { id: 1, text: 'Exercise for 30 minutes', category: 'Health' },
            { id: 2, text: 'Read for 20 minutes', category: 'Learning' },
            { id: 3, text: 'Call a friend', category: 'Social' },
            { id: 4, text: 'Learn a new word', category: 'Learning' },
            { id: 5, text: 'Plan next week\'s meals', category: 'Planning' },
            { id: 6, text: 'Take a walk', category: 'Health' },
            { id: 7, text: 'Write in journal', category: 'Personal' },
            { id: 8, text: 'Clean workspace', category: 'Organization' },
            { id: 9, text: 'Practice gratitude', category: 'Personal' },
            { id: 10, text: 'Try a new recipe', category: 'Cooking' }
        ];
        
        this.populateGrid();
        this.isGameActive = true;
        this.updateGameStats();
    }
    
    changeGridSize(newSize) {
        if (newSize === this.gridSize) return;
        
        console.log('BingoGridScene: Changing grid size from', this.gridSize, 'to', newSize);
        
        // Update grid size
        this.gridSize = newSize;
        
        // Update button appearances
        this.updateGridSizeButtons();
        
        // Recreate grid with new size
        this.recreateGrid();
        
        // Update game state
        this.updateGameState();
        
        console.log('BingoGridScene: Grid size changed successfully');
    }
    
    updateGridSizeButtons() {
        // ============================================================================
        // PHASER GRID SIZE BUTTON UPDATE: Update button visual states
        // ============================================================================
        // PHASER PATTERN: Update button appearances to reflect current selection
        // - Selected button: Green border and text
        // - Unselected buttons: Gray border and text
        // - This provides clear visual feedback for current grid size
        
        if (this.gridSizeButtons && Array.isArray(this.gridSizeButtons)) {
            this.gridSizeButtons.forEach(({ button, text, size }) => {
                if (size === this.gridSize) {
                    button.setStrokeStyle(2, 0x4CAF50);
                    text.setFill('#4CAF50');
                } else {
                    button.setStrokeStyle(2, 0xcccccc);
                    text.setFill('#333333');
                }
            });
        } else {
            console.warn('BingoGridScene: gridSizeButtons not initialized yet');
        }
    }
    
    recreateGrid() {
        // Clear existing grid
        // ============================================================================
        // PHASER CONTAINER CLEANUP: Proper container destruction
        // ============================================================================
        // PHASER PATTERN: Containers must be properly destroyed to prevent memory leaks
        // - container.destroy() removes container and all its children from display list
        // - This prevents memory leaks and ensures proper cleanup
        // - Always check if container exists before destroying
        
        if (this.gridContainer) {
            this.gridContainer.destroy();
        }
        
        // Create new grid
        this.createGrid(this.cameras.main.width, this.cameras.main.height);
        
        // Populate with goals
        this.populateGrid();
    }
    
    populateGrid() {
        // Use core Phaser techniques - simple sample goals
        const availableGoals = this.sampleGoals || [];
        
        if (availableGoals.length === 0) {
            console.warn('BingoGridScene: No available goals to populate grid');
            return;
        }
        
        // Clear existing goals
        this.clearGrid();
        
        // Populate with random goals
        const totalCells = this.gridSize * this.gridSize;
        const goalsToUse = Math.min(totalCells, availableGoals.length);
        
        for (let i = 0; i < goalsToUse; i++) {
            const randomGoal = availableGoals[Math.floor(Math.random() * availableGoals.length)];
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            
            this.cells[row][col].setGoal(randomGoal);
        }
        
        // Update game state using core Phaser registry
        this.updateGameState();
    }
    
    clearGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.cells[row][col].setGoal(null);
                this.cells[row][col].setCompleted(false);
                this.cells[row][col].setHighlighted(false);
            }
        }
    }
    
    onGoalCompleted(goal, completed) {
        if (!this.isGameActive) return;
        
        console.log('BingoGridScene: Goal completed:', goal.text, completed);
        
        // Update game state using core Phaser registry
        this.updateGameState();
        
        // Check for wins
        this.checkForWins();
        this.updateGameStats();
    }
    
    checkForWins() {
        this.winPatterns = [];
        
        // Check rows
        for (let row = 0; row < this.gridSize; row++) {
            if (this.isRowComplete(row)) {
                this.winPatterns.push({ type: 'row', index: row });
                this.highlightRow(row);
            }
        }
        
        // Check columns
        for (let col = 0; col < this.gridSize; col++) {
            if (this.isColumnComplete(col)) {
                this.winPatterns.push({ type: 'column', index: col });
                this.highlightColumn(col);
            }
        }
        
        // Check diagonals
        if (this.isDiagonalComplete(true)) {
            this.winPatterns.push({ type: 'diagonal', index: 0 });
            this.highlightDiagonal(true);
        }
        
        if (this.isDiagonalComplete(false)) {
            this.winPatterns.push({ type: 'diagonal', index: 1 });
            this.highlightDiagonal(false);
        }
        
        // Process wins
        if (this.winPatterns.length > 0) {
            this.processWins();
        }
    }
    
    isRowComplete(row) {
        for (let col = 0; col < this.gridSize; col++) {
            if (!this.cells[row][col].isCompleted || this.cells[row][col].isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    isColumnComplete(col) {
        for (let row = 0; row < this.gridSize; row++) {
            if (!this.cells[row][col].isCompleted || this.cells[row][col].isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    isDiagonalComplete(mainDiagonal) {
        for (let i = 0; i < this.gridSize; i++) {
            const row = i;
            const col = mainDiagonal ? i : this.gridSize - 1 - i;
            
            if (!this.cells[row][col].isCompleted || this.cells[row][col].isEmpty()) {
                return false;
            }
        }
        return true;
    }
    
    highlightRow(row) {
        for (let col = 0; col < this.gridSize; col++) {
            this.cells[row][col].setHighlighted(true);
        }
    }
    
    highlightColumn(col) {
        for (let row = 0; row < this.gridSize; row++) {
            this.cells[row][col].setHighlighted(true);
        }
    }
    
    highlightDiagonal(mainDiagonal) {
        for (let i = 0; i < this.gridSize; i++) {
            const row = i;
            const col = mainDiagonal ? i : this.gridSize - 1 - i;
            this.cells[row][col].setHighlighted(true);
        }
    }
    
    processWins() {
        // Update game state using core Phaser registry
        const gameState = this.game.registry.get('bingoGameState') || {};
        const newWins = (gameState.totalWins || 0) + this.winPatterns.length;
        const newStreak = (gameState.currentStreak || 0) + 1;
        
        this.game.registry.set('bingoGameState', {
            ...gameState,
            totalWins: newWins,
            currentStreak: newStreak,
            lastWinAt: Date.now()
        });
        
        console.log('BingoGridScene: Win processed! Total wins:', newWins, 'Streak:', newStreak);
        
        // Show win celebration
        this.showWinCelebration();
        
        // Clear completed goals after a delay
        this.time.delayedCall(2000, () => {
            this.clearCompletedGoals();
        });
    }
    
    showWinCelebration() {
        const { width, height } = this.cameras.main;
        
        // ============================================================================
        // PHASER CONTAINER REGISTRATION: Celebration Modal Setup
        // ============================================================================
        // PHASER PATTERN: Modal containers need highest depth and proper registration
        // - Modal containers should be above all other content
        // - this.add.existing() is required for visibility
        // - High depth value ensures modal appears on top
        
        // Create win celebration container
        const celebrationContainer = this.add.container(width / 2, height / 2);
        celebrationContainer.setDepth(1000); // Above everything else (modal layer)
        this.add.existing(celebrationContainer); // REQUIRED: Add to scene display list
        
        // ============================================================================
        // PHASER ELEMENT ADDITION: Adding elements to container
        // ============================================================================
        // PHASER PATTERN: Elements created with this.add.* are automatically added to scene
        // - this.add.rectangle() adds element to scene display list
        // - container.add(element) moves element from scene to container
        // - This is the correct pattern for adding elements to containers
        
        // Background overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3);
        celebrationContainer.add(overlay); // Move from scene to container
        
        // Win text
        const winText = this.add.text(0, -50, `🎉 BINGO!`, {
            fontSize: '48px',
            fill: '#4CAF50',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        celebrationContainer.add(winText); // Move from scene to container
        
        // Win count text
        const winCountText = this.add.text(0, 20, `${this.winPatterns.length} win${this.winPatterns.length > 1 ? 's' : ''}!`, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        celebrationContainer.add(winCountText); // Move from scene to container
        
        // Celebration particles
        this.createCelebrationParticles(celebrationContainer);
        
        // Animate celebration
        this.animateWinCelebration(celebrationContainer, winText, winCountText);
        
        // Auto-remove after animation
        this.time.delayedCall(3000, () => {
            celebrationContainer.destroy();
        });
    }
    
    createCelebrationParticles(container) {
        // ============================================================================
        // PHASER PARTICLE CREATION: Adding particles to container
        // ============================================================================
        // PHASER PATTERN: Particles follow same element addition pattern
        // - this.add.circle() creates particle and adds to scene display list
        // - container.add(particle) moves particle from scene to container
        // - All particles become children of the container for collective management
        
        // Create particle effects around the win text
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(-100, 100),
                Phaser.Math.Between(3, 8),
                Phaser.Math.RND.pick([0xFFD700, 0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4])
            );
            container.add(particle); // Move from scene to container
            
            // Animate particles
            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-200, 200),
                y: particle.y + Phaser.Math.Between(-200, 200),
                alpha: 0,
                scale: 0,
                duration: 2000,
                ease: 'Power2',
                delay: i * 50
            });
        }
    }
    
    animateWinCelebration(container, winText, winCountText) {
        // Initial scale up
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Win text animation
        winText.setScale(0);
        this.tweens.add({
            targets: winText,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 200
        });
        
        // Win count text animation
        winCountText.setScale(0);
        this.tweens.add({
            targets: winCountText,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 400
        });
        
        // Pulsing effect
        this.tweens.add({
            targets: winText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Power2',
            delay: 800
        });
    }
    
    clearCompletedGoals() {
        // Animate clearing of completed goals
        const completedCells = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.cells[row][col].isCompleted) {
                    completedCells.push({ row, col, cell: this.cells[row][col] });
                }
            }
        }
        
        // Animate clearing with fade out
        this.tweens.add({
            targets: completedCells.map(c => c.cell),
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Clear the cells
                completedCells.forEach(({ cell }) => {
                    cell.setGoal(null);
                    cell.setCompleted(false);
                    cell.setHighlighted(false);
                    cell.setAlpha(1);
                    cell.setScale(1);
                });
                
                // Repopulate with animation
                this.animateGridRepopulation();
            }
        });
    }
    
    animateGridRepopulation() {
        // Get empty cells
        const emptyCells = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.cells[row][col].isEmpty()) {
                    emptyCells.push({ row, col, cell: this.cells[row][col] });
                }
            }
        }
        
        // Populate with new goals using core Phaser techniques
        const availableGoals = this.sampleGoals || [];
        emptyCells.forEach(({ cell }, index) => {
            if (availableGoals.length > 0) {
                const randomGoal = availableGoals[Math.floor(Math.random() * availableGoals.length)];
                cell.setGoal(randomGoal);
                
                // Animate appearance
                cell.setAlpha(0);
                cell.setScale(0.5);
                
                this.tweens.add({
                    targets: cell,
                    alpha: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut',
                    delay: index * 100
                });
            }
        });
        
        // Update game state
        this.updateGameState();
    }
    
    // ============================================================================
    // PHASER NEW GAME FUNCTIONALITY: Enhanced new game implementation
    // ============================================================================
    // PHASER PATTERN: Complete game reset using Phaser's native systems
    // - Reset all game state to initial conditions
    // - Clear existing grid and repopulate with new goals
    // - Update game statistics and registry state
    // - Provide clear logging for debugging and user feedback
    startNewGame() {
        console.log('BingoGridScene: Starting new game');
        
        // ============================================================================
        // PHASER GAME STATE RESET: Reset all game state variables
        // ============================================================================
        // PHASER PATTERN: Reset game state before clearing grid
        // - Set isGameActive to false during reset process
        // - Clear win patterns to reset win detection
        // - This ensures clean state for new game
        this.isGameActive = false;
        this.winPatterns = [];
        
        // ============================================================================
        // PHASER GRID CLEARING: Clear existing grid elements
        // ============================================================================
        // PHASER PATTERN: Use existing clearGrid method for consistency
        // - This method properly clears all cell goals
        // - Maintains grid structure while removing content
        // - Ensures clean slate for new goals
        this.clearGrid();
        
        // ============================================================================
        // PHASER GAME STATISTICS: Reset game statistics
        // ============================================================================
        // PHASER PATTERN: Update game stats after clearing grid
        // - This ensures statistics reflect the cleared state
        // - Provides immediate visual feedback to user
        // - Uses Phaser's native text update system
        this.updateGameStats();
        
        // ============================================================================
        // PHASER GRID REPOPULATION: Use animation system for smooth repopulation
        // ============================================================================
        // PHASER PATTERN: Use animation system for better user experience
        // - animateGridRepopulation() provides smooth visual feedback
        // - Fade out → repopulate → fade in sequence
        // - This approach is more engaging and user-friendly
        // - Perfect for basic UI transitions and simple visual effects
        this.animateGridRepopulation();
        
        // ============================================================================
        // PHASER GAME ACTIVATION: Mark game as active and update state
        // ============================================================================
        // PHASER PATTERN: Set game as active after successful setup
        // - This enables game interactions and win detection
        // - Ensures proper game state for user interaction
        // - Triggers final state synchronization
        this.isGameActive = true;
        
        // ============================================================================
        // PHASER REGISTRY UPDATE: Update game state in Phaser registry
        // ============================================================================
        // PHASER PATTERN: Use game.registry for state persistence
        // - This ensures game state is properly saved
        // - Enables state recovery and synchronization
        // - Follows Phaser's native data management patterns
        this.updateGameState();
        
        console.log('BingoGridScene: New game started successfully');
    }
    
    repopulateGrid() {
        // ============================================================================
        // PHASER GRID REPOPULATION: Use animation system for smooth repopulation
        // ============================================================================
        // PHASER PATTERN: Use animation system for better user experience
        // - animateGridRepopulation() provides smooth visual feedback
        // - Fade out → repopulate → fade in sequence
        // - This approach is more engaging and user-friendly
        // - Perfect for basic UI transitions and simple visual effects
        this.animateGridRepopulation();
    }
    
    updateGameStats() {
        if (!this.gameStats) return;
        
        // Use core Phaser techniques - simple stats
        const totalGoals = this.sampleGoals?.length || 0;
        const completedGoals = this.getCompletedGoalsCount();
        const gameState = this.game.registry.get('bingoGameState') || {};
        
        const stats = [
            `Goals: ${totalGoals} total | ${completedGoals} completed`,
            `Wins: ${gameState.totalWins || 0} | Streak: ${gameState.currentStreak || 0}`,
            `Grid: ${this.gridSize}x${this.gridSize} | Active: ${this.isGameActive ? 'Yes' : 'No'}`
        ].join('\n');
        
        this.gameStats.setText(stats);
    }
    
    getCompletedGoalsCount() {
        let count = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.cells[row] && this.cells[row][col] && this.cells[row][col].isCompleted) {
                    count++;
                }
            }
        }
        return count;
    }
    
    updateGameState() {
        // Use core Phaser registry for simple state management
        const currentGrid = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const goal = this.cells[row][col].getGoal();
                currentGrid.push(goal ? goal.id : null);
            }
        }
        
        // Store in Phaser registry (core Phaser technique)
        const gameStateData = {
            gridSize: this.gridSize,
            currentGrid: currentGrid,
            isGameActive: this.isGameActive,
            lastUpdated: Date.now()
        };
        
        this.game.registry.set('bingoGameState', gameStateData);
    }

    /**
     * Enhanced scene state management following Phaser best practices
     * Provides comprehensive scene state validation and management
     */
    validateSceneState() {
        // Check if scene exists and is active
        if (!this || !this.sys) {
            console.warn('BingoGridScene: Scene or scene.sys not available');
            return false;
        }

        // Check if scene is active
        if (!this.sys.isActive()) {
            console.warn('BingoGridScene: Scene is not active');
            return false;
        }

        // Check if scene is visible
        if (!this.sys.isVisible()) {
            console.warn('BingoGridScene: Scene is not visible');
            return false;
        }

        // Check if scene is shutting down
        if (this.sys.isShuttingDown()) {
            console.warn('BingoGridScene: Scene is shutting down');
            return false;
        }

        // Check if cameras are available
        if (!this.cameras || !this.cameras.main) {
            console.warn('BingoGridScene: Cameras not available');
            return false;
        }

        // Check if add method is available (scene is fully initialized)
        if (typeof this.add !== 'function') {
            console.warn('BingoGridScene: Scene.add method not available');
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
            gameState: {
                gridSize: this.gridSize,
                isGameActive: this.isGameActive,
                cellsCount: this.cells.length,
                winPatterns: this.winPatterns.length
            },
            containers: {
                background: this.backgroundContainer ? this.backgroundContainer.list.length : 0,
                main: this.mainContainer ? this.mainContainer.list.length : 0,
                ui: this.uiContainer ? this.uiContainer.list.length : 0,
                modal: this.modalContainer ? this.modalContainer.list.length : 0,
                grid: this.gridContainer ? this.gridContainer.list.length : 0
            },
            camera: {
                x: this.cameras.main.x,
                y: this.cameras.main.y,
                width: this.cameras.main.width,
                height: this.cameras.main.height,
                zoom: this.cameras.main.zoom
            }
        };
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

    /**
     * Animate grid repopulation with fade out/in effect
     * 
     * PURPOSE: Provides smooth visual feedback when grid is repopulated with new goals
     * USAGE: Called by startNewGame() and repopulateGrid() methods
     * 
     * ANIMATION SEQUENCE:
     * 1. Fade out current grid (alpha: 1 → 0)
     * 2. Repopulate grid with new goals (during fade out)
     * 3. Fade in new grid (alpha: 0 → 1)
     * 
     * PHASER PATTERN: Use basic tween for fade out animation
     * - Simple alpha animation provides clear visual feedback
     * - onComplete callback allows chaining animations
     * - This approach is simpler and more maintainable
     * - Perfect for basic UI transitions and simple visual effects
     * 
     * DEPENDENCIES: Requires this.gridContainer to exist
     * PERFORMANCE: Uses simple alpha tweens for optimal performance
     * 
     * @example
     * // Called automatically by startNewGame()
     * this.animateGridRepopulation();
     */
    animateGridRepopulation() {
        console.log('BingoGridScene: Starting grid repopulation animation');
        
        // ============================================================================
        // PHASER FADE OUT ANIMATION: Fade out current grid
        // ============================================================================
        // PHASER PATTERN: Use basic tween for fade out animation
        // - Simple alpha animation provides clear visual feedback
        // - onComplete callback allows chaining animations
        // - This approach is simpler and more maintainable
        // - Perfect for basic UI transitions and simple visual effects
        
        this.tweens.add({
            targets: this.gridContainer,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // ============================================================================
                // PHASER GRID REPOPULATION: Repopulate grid during animation
                // ============================================================================
                // PHASER PATTERN: Use onComplete callback for custom logic
                // - Execute custom logic at the right time
                // - This allows for simple animation sequencing
                // - This approach is simpler and more maintainable
                // - Perfect for basic UI updates during animations
                
                console.log('BingoGridScene: Repopulating grid...');
                this.populateGrid();
                
                // ============================================================================
                // PHASER FADE IN ANIMATION: Fade in new grid
                // ============================================================================
                // PHASER PATTERN: Use basic tween for fade in animation
                // - Simple alpha animation provides clear visual feedback
                // - This completes the animation sequence
                // - This approach is simpler and more maintainable
                // - Perfect for basic UI transitions and simple visual effects
                
                this.tweens.add({
                    targets: this.gridContainer,
                    alpha: 1,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        console.log('BingoGridScene: Grid repopulation animation complete');
                    }
                });
            }
        });
    }

    /**
     * Animate button click with scale effect
     * 
     * PURPOSE: Provides immediate visual feedback when a button is clicked
     * USAGE: Called by handleButtonClick() method for all button interactions
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
     * @param {Phaser.GameObjects.GameObject} button - The button to animate
     * 
     * @example
     * // Called automatically by handleButtonClick()
     * this.animateButtonClick(button);
     */
    animateButtonClick(button) {
        if (!button) {
            console.warn('BingoGridScene: Cannot animate null button');
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
     * PURPOSE: Provides visual feedback when user hovers over a button
     * USAGE: Called by pointerover events on interactive buttons
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
     * @param {Phaser.GameObjects.GameObject} button - The button to animate
     * 
     * @example
     * // Called by pointerover event
     * button.on('pointerover', () => this.animateButtonHover(button));
     */
    animateButtonHover(button) {
        if (!button) {
            console.warn('BingoGridScene: Cannot animate null button');
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
     * Animate grid cell completion with scale effect
     * 
     * PURPOSE: Provides visual feedback when a grid cell is completed/marked
     * USAGE: Called when a goal is completed or cell is marked as done
     * 
     * ANIMATION EFFECT:
     * - Scale up to 120% (1.2x) then back to 100% (1.0x)
     * - Duration: 150ms for noticeable completion feedback
     * - Easing: Power2 for smooth animation
     * - Yoyo: true for automatic reverse animation
     * 
     * PHASER PATTERN: Use basic tween for cell completion feedback
     * - Simple scale animation provides clear user feedback
     * - Basic animations are more performant and easier to maintain
     * - This approach works well for most UI interactions
     * - Perfect for basic completion feedback without complex animations
     * 
     * DEPENDENCIES: Requires cell parameter to be a valid Phaser Game Object
     * PERFORMANCE: Lightweight - only scales the cell
     * 
     * @param {Phaser.GameObjects.GameObject} cell - The grid cell to animate
     * 
     * @example
     * // Called when goal is completed
     * this.animateGridCellCompletion(completedCell);
     */
    animateGridCellCompletion(cell) {
        if (!cell) {
            console.warn('BingoGridScene: Cannot animate null cell');
            return;
        }

        // ============================================================================
        // PHASER SIMPLIFIED CELL ANIMATION: Use basic tween for cell completion
        // ============================================================================
        // PHASER PATTERN: Use basic tween for simple cell animations
        // - Simple scale animation provides clear user feedback
        // - Basic animations are more performant and easier to maintain
        // - This approach works well for most UI interactions
        // - Perfect for basic completion feedback without complex animations
        
        this.tweens.add({
            targets: cell,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
                console.log('BingoGridScene: Cell completion animation finished');
            }
        });
    }

    /**
     * Animate new game button with scale effect
     * 
     * PURPOSE: Provides visual feedback when new game button is clicked
     * USAGE: Called specifically for the new game button interaction
     * 
     * ANIMATION EFFECT:
     * - Scale down to 90% (0.9x) then back to 100% (1.0x)
     * - Duration: 100ms for responsive feedback
     * - Easing: Power2 for smooth animation
     * - Yoyo: true for automatic reverse animation
     * 
     * PHASER PATTERN: Use basic tween for new game feedback
     * - Simple scale animation provides clear user feedback
     * - Basic animations are more performant and easier to maintain
     * - This approach works well for most UI interactions
     * - Perfect for basic new game feedback without complex animations
     * 
     * DEPENDENCIES: Requires this.newGameBtn to exist
     * PERFORMANCE: Lightweight - only scales the button
     * 
     * @example
     * // Called when new game button is clicked
     * this.animateNewGameButton();
     */
    animateNewGameButton() {
        if (!this.newGameBtn) {
            console.warn('BingoGridScene: Cannot animate null new game button');
            return;
        }

        // ============================================================================
        // PHASER SIMPLIFIED NEW GAME ANIMATION: Use basic tween for new game feedback
        // ============================================================================
        // PHASER PATTERN: Use basic tween for simple new game animations
        // - Simple scale animation provides clear user feedback
        // - Basic animations are more performant and easier to maintain
        // - This approach works well for most UI interactions
        // - Perfect for basic new game feedback without complex animations
        
        this.tweens.add({
            targets: this.newGameBtn,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
                console.log('BingoGridScene: New game button animation complete');
            }
        });
    }

    shutdown() {
        // ============================================================================
        // PHASER CONTAINER CLEANUP: Proper container destruction
        // ============================================================================
        // PHASER PATTERN: Containers must be properly destroyed to prevent memory leaks
        // - container.destroy() removes container and all its children from display list
        // - This prevents memory leaks and ensures proper cleanup
        // - Always check if container exists before destroying
        
        if (this.backgroundContainer) {
            this.backgroundContainer.destroy();
        }
        if (this.mainContainer) {
            this.mainContainer.destroy();
        }
        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        if (this.modalContainer) {
            this.modalContainer.destroy();
        }
        
        // Clean up event listeners
        this.game.events.off('goalsChanged', this.updateGameStats, this);
        this.game.events.off('gameStateChanged', this.updateGameStats, this);
        this.events.off('goalCompleted', this.onGoalCompleted, this);
        
        // Clear grid
        this.clearGrid();
        this.cells = [];
        
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}