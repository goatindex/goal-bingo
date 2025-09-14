/**
 * RewardsScene - Display rewards and achievements
 * Comprehensive rewards system following Phaser best practices
 * 
 * ARCHITECTURE NOTES:
 * - Uses game.registry for data persistence (Phaser native)
 * - Uses game.events for application events (Phaser native)
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * KEY DEPENDENCIES:
 * - game.registry: Phaser's built-in data management system
 * - game.events: Phaser's built-in event system
 */
import { LayoutManager } from '../utils/LayoutManager.js';
export default class RewardsScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'RewardsScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'ui',
                hasAnimations: true,
                hasInput: true
            }
        });
        
        // Container references following Level 2 template
        this.backgroundContainer = null;
        this.mainContainer = null;
        this.uiContainer = null;
        
        // Rewards data
        this.rewards = [];
        this.achievements = [];
        
        // Layout constants
        this.padding = 20;
        this.cardSpacing = 20;
        this.cardWidth = 350;
        this.cardHeight = 100;
    }

    init(data) {
        // Initialize scene with data
        console.log('RewardsScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
        if (data) {
            // Handle any data passed from other scenes
            // Future: Handle specific reward data if needed
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
        console.log('RewardsScene: create() called');
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
        
        // ============================================================================
        // PHASER CONTAINER ARCHITECTURE: Level 2 Complex UI Scene Template
        // ============================================================================
        // PHASER PATTERN: Create containers for organized UI management
        // - backgroundContainer: For background elements
        // - mainContainer: For main content and interactive elements
        // - uiContainer: For UI overlays and controls
        // - This provides clear separation of concerns and easier management
        
        // Create containers
        this.backgroundContainer = this.add.container(0, 0);
        this.mainContainer = this.add.container(0, 0);
        this.uiContainer = this.add.container(0, 0);
        
        // Register containers with scene display list
        this.add.existing(this.backgroundContainer);
        this.add.existing(this.mainContainer);
        this.add.existing(this.uiContainer);
        
        // Set container depths for proper layering
        this.backgroundContainer.setDepth(0);
        this.mainContainer.setDepth(1);
        this.uiContainer.setDepth(2);
        
        console.log('RewardsScene: All containers registered with scene display list');
        
        // Create scene elements
        this.createBackground(width, height);
        this.createTitle(width, height);
        this.loadRewardsData();
        this.createRewardsDisplay(width, height);
        this.createBackButton(width, height);
        
        // Set up scene state management
        this.setupSceneStateManagement();
        
        console.log('RewardsScene: create() completed');
    }

    createBackground(width, height) {
        // ============================================================================
        // PHASER BACKGROUND CREATION: Simple background setup
        // ============================================================================
        // PHASER PATTERN: Create background elements and add to background container
        // - Background elements go in backgroundContainer for proper layering
        // - Use simple shapes and colors for clean appearance
        // - This provides visual foundation for the scene
        
        // Background rectangle
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);
        this.backgroundContainer.add(background);
    }

    createTitle(width, height) {
        // ============================================================================
        // PHASER NATIVE LAYOUT: Use LayoutManager for consistent positioning
        // ============================================================================
        // PHASER PATTERN: Use native LayoutManager for responsive positioning
        // - LayoutManager provides consistent positioning across all scenes
        // - Automatically adapts to different screen sizes
        // - Uses Phaser's built-in camera system for responsive design
        
        const title = this.add.text(0, 0, '🏆 Rewards & Achievements', {
            fontSize: '32px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        LayoutManager.positionTitle(this, title);

        this.mainContainer.add(title);
    }

    loadRewardsData() {
        // ============================================================================
        // PHASER REWARDS DATA LOADING: Load rewards from registry
        // ============================================================================
        // PHASER PATTERN: Use Phaser's registry for data persistence
        // - this.game.registry.get() retrieves data from Phaser's built-in data manager
        // - Phaser handles data persistence automatically across scenes
        // - This approach is simpler and more maintainable than custom persistence
        
        console.log('RewardsScene: Loading rewards data from registry');
        
        // Load achievements from registry (separate from user rewards)
        this.achievements = this.game.registry.get('achievements') || [];
        
        // Load user rewards from registry
        const userRewards = this.game.registry.get('rewards') || [];
        
        // Convert user rewards to achievement format for display
        this.rewards = userRewards.map((reward, index) => ({
            id: reward.id || `reward_${index}`,
            name: reward.description || 'Custom Reward',
            description: `Reward: ${reward.description}`,
            points: this.getRewardPoints(reward.category),
            unlocked: reward.claimed || false,
            category: reward.category || 'custom'
        }));
        
        // Add default achievements if no achievements exist
        if (this.achievements.length === 0) {
            console.log('RewardsScene: No achievements found, initializing defaults');
            this.initializeDefaultAchievements();
        }
        
        // Add default achievements to rewards display
        this.achievements.forEach(achievement => {
            this.rewards.push(achievement);
        });
        
        console.log('RewardsScene: Loaded rewards:', this.rewards.length, 'achievements:', this.achievements.length);
    }

    getRewardPoints(category) {
        // ============================================================================
        // PHASER REWARD POINTS: Calculate points based on reward category
        // ============================================================================
        // PHASER PATTERN: Simple utility method for reward point calculation
        // - Different categories have different point values
        // - Provides consistent point assignment across the system
        // - Easy to modify point values in one place
        
        const pointValues = {
            'treat': 5,
            'entertainment': 8,
            'rest': 10,
            'achievement': 15,
            'custom': 5,
            'default': 5
        };
        
        return pointValues[category] || pointValues['default'];
    }

    initializeDefaultRewards() {
        // ============================================================================
        // PHASER DEFAULT REWARDS: Initialize default reward system
        // ============================================================================
        // PHASER PATTERN: Create default data structure for rewards
        // - Define clear reward structure with id, name, description, points, unlocked
        // - Use meaningful reward names and descriptions
        // - Set appropriate point values for different achievements
        // - Save to registry for persistence
        
        this.rewards = [
            { 
                id: 'achievement_1', 
                name: 'First Win', 
                description: 'Complete your first bingo', 
                points: 10, 
                unlocked: false 
            },
            { 
                id: 'achievement_2', 
                name: 'Speed Demon', 
                description: 'Complete a bingo in under 5 minutes', 
                points: 25, 
                unlocked: false 
            },
            { 
                id: 'achievement_3', 
                name: 'Perfect Game', 
                description: 'Complete a bingo without any mistakes', 
                points: 50, 
                unlocked: false 
            },
            { 
                id: 'achievement_4', 
                name: 'Goal Master', 
                description: 'Complete 10 goals in a single game', 
                points: 30, 
                unlocked: false 
            },
            { 
                id: 'achievement_5', 
                name: 'Consistent Player', 
                description: 'Play 5 games in a row', 
                points: 20, 
                unlocked: false 
            },
            { 
                id: 'achievement_6', 
                name: 'Category Expert', 
                description: 'Complete goals from all categories', 
                points: 40, 
                unlocked: false 
            }
        ];
        
        this.saveRewardsData();
        console.log('RewardsScene: Default rewards initialized:', this.rewards.length);
    }

    initializeDefaultAchievements() {
        // ============================================================================
        // PHASER DEFAULT ACHIEVEMENTS: Initialize default achievement system
        // ============================================================================
        // PHASER PATTERN: Create default achievement data structure
        // - Define clear achievement structure with id, name, description, points, unlocked
        // - Use meaningful achievement names and descriptions
        // - Set appropriate point values for different achievements
        // - Save to registry for persistence
        
        this.achievements = [
            { 
                id: 'achievement_1', 
                name: 'First Win', 
                description: 'Complete your first bingo', 
                points: 10, 
                unlocked: false 
            },
            { 
                id: 'achievement_2', 
                name: 'Speed Demon', 
                description: 'Complete a bingo in under 5 minutes', 
                points: 25, 
                unlocked: false 
            },
            { 
                id: 'achievement_3', 
                name: 'Perfect Game', 
                description: 'Complete a bingo without any mistakes', 
                points: 50, 
                unlocked: false 
            },
            { 
                id: 'achievement_4', 
                name: 'Goal Master', 
                description: 'Complete 10 goals in a single game', 
                points: 30, 
                unlocked: false 
            },
            { 
                id: 'achievement_5', 
                name: 'Consistent Player', 
                description: 'Play 5 games in a row', 
                points: 20, 
                unlocked: false 
            },
            { 
                id: 'achievement_6', 
                name: 'Category Expert', 
                description: 'Complete goals from all categories', 
                points: 40, 
                unlocked: false 
            }
        ];
        
        // Save achievements to registry
        this.game.registry.set('achievements', this.achievements);
        console.log('RewardsScene: Default achievements initialized:', this.achievements.length);
    }

    saveRewardsData() {
        // ============================================================================
        // PHASER REWARDS PERSISTENCE: Save rewards to registry
        // ============================================================================
        // PHASER PATTERN: Use Phaser's registry for data persistence
        // - this.game.registry.set() saves data to Phaser's built-in data manager
        // - Phaser handles data persistence automatically across scenes
        // - This approach is simpler and more maintainable than custom persistence
        
        try {
            console.log('RewardsScene: Saving rewards to registry');
            
            // Save rewards to registry
            this.game.registry.set('rewards', this.rewards);
            this.game.registry.set('achievements', this.achievements);
            
            console.log('RewardsScene: Rewards saved to registry successfully');
            
        } catch (error) {
            console.error('RewardsScene: Failed to save rewards to registry:', error);
        }
    }

    createRewardsDisplay(width, height) {
        // ============================================================================
        // PHASER RESPONSIVE REWARDS DISPLAY: Create responsive rewards grid layout
        // ============================================================================
        // PHASER PATTERN: Use camera dimensions for responsive reward card layout
        // - Camera dimensions automatically adapt to canvas size
        // - Ensures cards fit within content area boundaries
        // - Maintains proper spacing and proportions across all screen sizes
        // - Follows Phaser's recommended responsive design patterns
        
        const startY = 200;
        const cardsPerRow = 3;
        const rowSpacing = 120;
        
        // Responsive layout calculations
        const padding = 20;
        const availableWidth = width - (padding * 2); // Account for left/right padding
        const cardSpacing = 15; // Reduced spacing to ensure perfect fit
        
        // Calculate responsive card width to fit within available space
        const cardWidth = Math.floor((availableWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow);
        const cardHeight = 100;
        
        // Calculate starting position (left padding + half card width for centering)
        const startX = padding + (cardWidth / 2);
        
        console.log('RewardsScene: Creating responsive rewards display for', this.rewards.length, 'rewards');
        console.log('RewardsScene: Canvas width:', width, 'Card width:', cardWidth, 'Start X:', startX);
        
        this.rewards.forEach((reward, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            
            // Responsive positioning based on camera dimensions
            const x = startX + (col * (cardWidth + cardSpacing));
            const y = startY + (row * rowSpacing);
            
            this.createRewardCard(reward, x, y, cardWidth, cardHeight);
        });
    }

    createRewardCard(reward, x, y, width, height) {
        // ============================================================================
        // PHASER REWARD CARD CREATION: Individual reward card display
        // ============================================================================
        // PHASER PATTERN: Create comprehensive reward card with visual states
        // - Card background with conditional styling based on unlock status
        // - Icon display (trophy for unlocked, lock for locked)
        // - Text elements with appropriate styling and colors
        // - Points display with conditional formatting
        
        // Card background
        const cardBg = this.add.rectangle(x, y, width, height, 0xffffff);
        cardBg.setStrokeStyle(2, reward.unlocked ? 0x4CAF50 : 0xcccccc);
        this.mainContainer.add(cardBg);
        
        // Reward icon
        const icon = this.add.text(x - width/2 + 30, y, reward.unlocked ? '🏆' : '🔒', {
            fontSize: '32px'
        }).setOrigin(0.5);
        this.mainContainer.add(icon);
        
        // Reward name
        const name = this.add.text(x - width/2 + 80, y - 20, reward.name, {
            fontSize: '18px',
            fill: reward.unlocked ? '#333333' : '#999999',
            fontStyle: 'bold'
        });
        this.mainContainer.add(name);
        
        // Reward description
        const description = this.add.text(x - width/2 + 80, y + 5, reward.description, {
            fontSize: '14px',
            fill: reward.unlocked ? '#666666' : '#999999',
            wordWrap: { width: width - 120 }
        });
        this.mainContainer.add(description);
        
        // Points
        const points = this.add.text(x + width/2 - 30, y, `${reward.points} pts`, {
            fontSize: '16px',
            fill: reward.unlocked ? '#4CAF50' : '#999999',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.mainContainer.add(points);
        
        // Add interactivity
        cardBg.setInteractive();
        
        // Hover effects
        cardBg.on('pointerover', () => {
            cardBg.setFillStyle(0xf8f9fa);
            cardBg.setStrokeStyle(3, reward.unlocked ? 0x4CAF50 : 0xcccccc);
        });
        
        cardBg.on('pointerout', () => {
            cardBg.setFillStyle(0xffffff);
            cardBg.setStrokeStyle(2, reward.unlocked ? 0x4CAF50 : 0xcccccc);
        });
        
        // Click handler
        cardBg.on('pointerdown', () => {
            console.log('Reward card clicked:', reward.name);
            // TODO: Add reward details or interaction functionality
        });
    }

    createBackButton(width, height) {
        // ============================================================================
        // PHASER NATIVE LAYOUT: Use LayoutManager for consistent positioning
        // ============================================================================
        // PHASER PATTERN: Use native LayoutManager for responsive positioning
        // - LayoutManager provides consistent positioning across all scenes
        // - Automatically adapts to different screen sizes
        // - Uses Phaser's built-in camera system for responsive design
        
        // Back button
        const backBtn = this.add.rectangle(0, 0, 120, 40, 0x6c757d);
        backBtn.setStrokeStyle(2, 0x5a6268);
        backBtn.setInteractive();
        
        const backText = this.add.text(0, 0, '← Back', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // PHASER APPROACH 1: Add to container first, then position
        this.uiContainer.add(backBtn);
        this.uiContainer.add(backText);
        
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
        
        // Hover effects
        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0x5a6268);
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x6c757d);
        });
    }

    setupSceneStateManagement() {
        // ============================================================================
        // PHASER SCENE STATE MANAGEMENT: Enhanced scene state validation
        // ============================================================================
        // PHASER PATTERN: Define scene transition rules and validation
        // - this.canTransitionToScene: Define allowed scene transitions
        // - this.safeSceneTransition: Validate scene state before transitioning
        // - This prevents invalid scene transitions and ensures proper cleanup
        
        this.canTransitionToScene = (targetScene) => {
            // Define allowed scene transitions
            const allowedTransitions = ['MainMenuScene', 'BingoGridScene', 'GoalLibraryScene'];
            return allowedTransitions.includes(targetScene);
        };
        
        this.safeSceneTransition = (targetScene) => {
            // Validate scene state before transitioning
            if (!this.canTransitionToScene(targetScene)) {
                console.warn('RewardsScene: Invalid scene transition to', targetScene);
                return;
            }
            
            if (this.sys.settings.status === Phaser.Scenes.SHUTDOWN) {
                console.warn('RewardsScene: Scene is shutting down, cannot transition');
                return;
            }
            
            console.log('RewardsScene: Transitioning to', targetScene);
            this.scene.start(targetScene);
        };
    }

    handleButtonClick(button, callback) {
        // ============================================================================
        // PHASER BUTTON CLICK HANDLING: Centralized button interaction logic
        // ============================================================================
        // PHASER PATTERN: Centralized button handling with scene state validation
        // - Validate scene state before executing button actions
        // - Provide visual feedback for button interactions
        // - Use Phaser's built-in input throttling for performance
        // - This approach is simpler and more maintainable than custom debouncing
        
        // Check if scene is in valid state for interactions
        if (this.sys.settings.status === Phaser.Scenes.SHUTDOWN) {
            console.warn('RewardsScene: Scene is shutting down, ignoring button click');
            return;
        }
        
        // Execute callback if scene is valid
        if (callback && typeof callback === 'function') {
            callback();
        }
        
        // Visual feedback
        this.tweens.add({
            targets: button,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }

    handleClick(pointer, gameObject) {
        // ============================================================================
        // PHASER CLICK HANDLING: Global click handler for scene
        // ============================================================================
        // PHASER PATTERN: Handle global click events for scene
        // - This provides fallback click handling for the entire scene
        // - Useful for debugging and general interaction handling
        // - Can be extended for specific scene-wide interactions
        
        console.log('RewardsScene: Global click at', pointer.x, pointer.y);
    }

    onShutdown() {
        // ============================================================================
        // PHASER SCENE CLEANUP: Comprehensive scene shutdown
        // ============================================================================
        // PHASER PATTERN: Clean up scene resources and event listeners
        // - Remove all event listeners to prevent memory leaks
        // - Clean up any custom resources or timers
        // - This ensures proper scene lifecycle management
        
        console.log('RewardsScene: Shutting down');
        
        // Remove event listeners
        this.events.off('shutdown', this.onShutdown, this);
        this.input.off('pointerdown', this.handleClick, this);
        
        // Clean up any custom resources
        // (Add any custom cleanup here)
        
        console.log('RewardsScene: Shutdown complete');
    }
}