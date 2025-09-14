/**
 * GoalLibraryScene - Manage goals and categories
 * Comprehensive goal management interface following Phaser best practices
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
import { GoalCard } from '../components/GoalCard.js';
import { AddGoalModal } from '../components/AddGoalModal.js';
import { LayoutManager } from '../utils/LayoutManager.js';

export default class GoalLibraryScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'GoalLibraryScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'management',
                hasAnimations: true,
                hasInput: true,
                currentFilter: 'all',
                searchQuery: ''
            }
        });
        
        // UI Containers (using Phaser.Container for organization)
        this.headerContainer = null;
        this.filtersContainer = null;
        this.goalsListContainer = null;
        this.addGoalContainer = null;
        
        // UI Groups (using Phaser.Group for object management)
        this.goalCardsGroup = null;
        this.filterButtonsGroup = null;
        this.actionButtonsGroup = null;
        
        // State management
        this.currentFilter = 'all';
        this.selectedGoal = null;
        this.isEditing = false;
        this.searchQuery = '';
        
        // Layout constants
        this.padding = 20;
        this.cardSpacing = 15;
        this.cardWidth = 300;
        this.cardHeight = 120;
    }

    init(data) {
        // PHASER SCENE LIFECYCLE DEBUG: Track scene initialization
        console.log('=== GOAL LIBRARY SCENE LIFECYCLE DEBUG ===');
        console.log('GoalLibraryScene: init() called with data:', data);
        console.log('Current scene state:', this.sys.getStatus());
        console.log('Scene is active:', this.sys.isActive());
        console.log('Scene is visible:', this.sys.isVisible());
        
        // Set up scene properties, validate data, etc.
        if (data) {
            // Handle any data passed from other scenes
            if (data.currentFilter) {
                this.currentFilter = data.currentFilter;
            }
            if (data.searchQuery) {
                this.searchQuery = data.searchQuery;
            }
            if (data.selectedGoal) {
                this.selectedGoal = data.selectedGoal;
            }
        }
        
        console.log('GoalLibraryScene: init() completed');
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
        // PHASER SCENE LIFECYCLE DEBUG: Track scene creation
        console.log('GoalLibraryScene: create() called');
        console.log('Current scene state:', this.sys.getStatus());
        console.log('Scene is active:', this.sys.isActive());
        console.log('Scene is visible:', this.sys.isVisible());
        console.log('Scene children count before create:', this.children.list.length);
        
        const { width, height } = this.cameras.main;
        
        // ============================================================================
        // PHASER INITIAL SCENE CONFIG: Common initial scene setup patterns
        // ============================================================================
        // PHASER PATTERN: These patterns are commonly used in initial scene setup
        // - Camera configuration for proper viewport setup
        // - Input configuration for initial interaction setup
        // - Event setup for initial scene communication
        
        // Configure camera
        this.cameras.main.setBackgroundColor(0xe9ecef);
        // ✅ REMOVED: Hardcoded viewport override - Phaser handles responsive scaling automatically
        this.cameras.main.setZoom(1);
        
        // Configure input
        this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', this.handleClick, this);
        
        // Set up initial event listeners
        this.events.on('shutdown', this.onShutdown, this);
        this.events.on('pause', this.onPause, this);
        this.events.on('resume', this.onResume, this);
        
        // Set up the scene
        this.setupScene(width, height);
        
        // Create UI containers
        this.createContainers(width, height);
        
        // Create header section
        this.createHeader(width, height);
        
        // Create filters section
        this.createFilters(width, height);
        
        // Create goals list section
        this.createGoalsList(width, height);
        
        // Create add goal section
        this.createAddGoalSection(width, height);
        
        // Set up data integration
        this.setupDataIntegration();
        
        // Set up input handling
        this.setupInputHandling();
        
        // Set up goal card events
        this.setupGoalCardEvents();
        
        // Load initial data with enhanced persistence
        this.loadGoalsWithPersistence();
        
        // PHASER SCENE LIFECYCLE DEBUG: Track scene creation completion
        console.log('GoalLibraryScene: create() completed');
        console.log('Final scene state:', this.sys.getStatus());
        console.log('Scene is active:', this.sys.isActive());
        console.log('Scene is visible:', this.sys.isVisible());
        console.log('Scene children count after create:', this.children.list.length);
        console.log('Containers count:', this.children.list.filter(child => child.type === 'Container').length);
        console.log('=== GOAL LIBRARY SCENE LIFECYCLE DEBUG END ===');
    }

    setupScene(width, height) {
        // Background - PHASER COMPLIANT: Set depth to back so other objects render on top
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0xe9ecef);
        background.setDepth(-1); // Put background behind all other objects
        
        // Set up camera
        this.cameras.main.setBackgroundColor(0xe9ecef);
        
        // Enable input
        this.input.enabled = true;
    }

    createContainers(width, height) {
        // ============================================================================
        // PHASER CONTAINER MANAGEMENT: Proper container creation and registration
        // ============================================================================
        // PHASER PATTERN: Containers are Game Objects that can hold other Game Objects
        // They provide depth management, grouping, and transform operations for UI elements
        // 
        // CRITICAL PHASER RULE: Containers must be added to scene display list to render
        // - this.add.container() creates the container but doesn't add it to scene
        // - this.add.existing(container) adds container to scene's display list
        // - Without this.add.existing(), containers are invisible (not rendered)
        
        // Background container (behind everything)
        // AI NOTE: Background elements go in their own container for proper depth management
        this.backgroundContainer = this.add.container(0, 0);
        this.backgroundContainer.setDepth(-1); // Behind all other elements
        this.add.existing(this.backgroundContainer); // REQUIRED: Add to scene display list
        
        // Header container for title, back button, and stats
        // AI NOTE: Header elements are grouped together for easy management and transforms
        this.headerContainer = this.add.container(0, 0);
        this.headerContainer.setDepth(10); // Above main content
        this.add.existing(this.headerContainer); // REQUIRED: Add to scene display list
        
        // Filters container for search and filter buttons
        // AI NOTE: Filter UI elements are grouped for consistent positioning and visibility
        this.filtersContainer = this.add.container(0, 0);
        this.filtersContainer.setDepth(9); // Below header, above content
        this.add.existing(this.filtersContainer); // REQUIRED: Add to scene display list
        
        // Goals list container for goal cards
        // AI NOTE: Main content area where goal cards will be rendered
        this.goalsListContainer = this.add.container(0, 0);
        this.goalsListContainer.setDepth(8); // Main content layer
        this.add.existing(this.goalsListContainer); // REQUIRED: Add to scene display list
        
        // Add goal container for add button and modal
        // AI NOTE: Action buttons and modals go in highest depth container
        this.addGoalContainer = this.add.container(0, 0);
        this.addGoalContainer.setDepth(11); // Above everything except modals
        this.add.existing(this.addGoalContainer); // REQUIRED: Add to scene display list
        
        // ============================================================================
        // PHASER GROUP MANAGEMENT: Collections for managing similar objects
        // ============================================================================
        // PHASER PATTERN: Groups are used for managing collections of objects
        // Groups provide methods like add(), remove(), clear(), forEach()
        // Groups are NOT display lists - they're collection managers
        // Objects in groups must still be added to scene or containers for rendering
        
        this.goalCardsGroup = this.add.group(); // Manages goal card collection
        this.filterButtonsGroup = this.add.group(); // Manages filter button collection
        this.actionButtonsGroup = this.add.group(); // Manages action button collection
        
        // ============================================================================
        // PHASER CONTAINER LIFECYCLE: Container scene events
        // ============================================================================
        // PHASER PATTERN: Containers have lifecycle events for scene management
        // - addedToScene() called when container is added to scene
        // - removedFromScene() called when container is removed from scene
        // - These events are useful for initial setup and cleanup
        
        // Listen for container lifecycle events
        this.headerContainer.on('addedToScene', this.onContainerAdded, this);
        this.headerContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        this.filtersContainer.on('addedToScene', this.onContainerAdded, this);
        this.filtersContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        this.goalsListContainer.on('addedToScene', this.onContainerAdded, this);
        this.goalsListContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        this.addGoalContainer.on('addedToScene', this.onContainerAdded, this);
        this.addGoalContainer.on('removedFromScene', this.onContainerRemoved, this);
        
        console.log('GoalLibraryScene: All containers registered with scene display list');
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
        console.log('GoalLibraryScene: shutdown event received');
    }

    onPause() {
        console.log('GoalLibraryScene: pause event received');
    }

    onResume() {
        console.log('GoalLibraryScene: resume event received');
    }

    handleClick(pointer) {
        // Handle general click events
        console.log('GoalLibraryScene: Click detected at', pointer.x, pointer.y);
    }

    createHeader(width, height) {
        // ============================================================================
        // PHASER LAYOUT MANAGER: Simplified header creation using LayoutManager
        // ============================================================================
        // PHASER PATTERN: Use LayoutManager for both positioning and background creation
        // - LayoutManager.createBackground() handles background creation and positioning
        // - LayoutManager.positionContainer() handles container positioning
        // - Much simpler than manual rectangle creation and positioning
        
        // Create header background using LayoutManager
        const headerBg = LayoutManager.createBackground(this, width, 80, 'TOP_CENTER', 0, 60, 0xffffff, 0xe9ecef, 10);
        
        // Title
        const title = this.add.text(0, 0, '📚 Goal Library', {
            fontSize: '28px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        LayoutManager.positionTitle(this, title, -10);
        
        // Back button
        const backBtn = this.add.rectangle(0, 0, 100, 35, 0x6c757d);
        backBtn.setStrokeStyle(2, 0x5a6268);
        backBtn.setInteractive();
        
        const backText = this.add.text(0, 0, '← Back', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Stats text
        this.statsText = this.add.text(0, 0, '', {
            fontSize: '14px',
            fill: '#666666',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        
        // Add elements to container
        this.headerContainer.add([headerBg, title, backBtn, backText, this.statsText]);
        
        // Position container at origin - individual elements handle their own positioning
        LayoutManager.positionContainer(this, this.headerContainer, 'TOP_LEFT', 0, 0);
        
        // Position individual elements relative to container
        LayoutManager.positionBackButton(this, backBtn);
        LayoutManager.positionBackButton(this, backText);
        LayoutManager.alignToCamera(this, this.statsText, 'TOP_RIGHT', -20, 60);
        
        // Back button interaction
        backBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
            // Log scene transition
            if (this.game.sceneStateLogger) {
                this.game.sceneStateLogger.logSceneTransition('GoalLibraryScene', 'MainMenuScene', 'scene.start()');
            }
            this.scene.start('MainMenuScene');
        });
        
        // Hover effects
        backBtn.on(Phaser.Input.Events.POINTER_OVER, () => {
            backBtn.setScale(1.05);
            backBtn.setFillStyle(0x5a6268);
        });
        
        backBtn.on(Phaser.Input.Events.POINTER_OUT, () => {
            backBtn.setScale(1);
            backBtn.setFillStyle(0x6c757d);
        });
    }

    createFilters(width, height) {
        const filtersY = 120;
        
        // Create filters background using LayoutManager
        const filtersBg = LayoutManager.createBackground(this, width, 60, 'TOP_CENTER', 0, filtersY, 0xffffff, 0xe9ecef, 9);
        
        // PHASER GROUP vs CONTAINER: Groups are for managing collections, not rendering
        // Groups don't have display lists - they're just organizational tools
        // ❌ WRONG: this.filterButtonsGroup.add(btn); // This doesn't add to display list
        // ✅ CORRECT: Use groups for management, containers for rendering
        this.filterButtonsGroup = this.add.group();
        
        // Filter buttons - position them properly using LayoutManager
        const filters = [
            { key: 'all', label: 'All', offsetX: -120 },
            { key: 'to-do', label: 'To Do', offsetX: -40 },
            { key: 'in-play', label: 'In Play', offsetX: 40 },
            { key: 'completed', label: 'Completed', offsetX: 120 }
        ];
        
        const filterButtons = [];
        filters.forEach(filter => {
            const buttonElements = this.createFilterButton(filter.offsetX, filtersY, filter.label, filter.key);
            // PHASER GROUP PATTERN: Groups are for management, not display
            // Add button (first element) to group for management
            this.filterButtonsGroup.add(buttonElements[0]);
            // Collect all button elements for container addition
            filterButtons.push(...buttonElements);
        });
        
        // Search input placeholder (will be implemented in 3.3.2)
        const searchPlaceholder = this.add.text(0, 0, '🔍 Search goals...', {
            fontSize: '14px',
            fill: '#999999'
        }).setOrigin(0.5);
        LayoutManager.alignToCamera(this, searchPlaceholder, 'TOP_RIGHT', -20, filtersY);
        
        // Add all elements to container
        this.filtersContainer.add([filtersBg, ...filterButtons, searchPlaceholder]);
        
        // Position container at origin - individual elements handle their own positioning
        LayoutManager.positionContainer(this, this.filtersContainer, 'TOP_LEFT', 0, 0);
    }

    createFilterButton(offsetX, y, label, filterKey) {
        const isActive = filterKey === this.currentFilter;
        
        // Create button and text at origin, then position using LayoutManager
        const btn = this.add.rectangle(0, 0, 80, 30, isActive ? 0x007bff : 0xe9ecef);
        btn.setStrokeStyle(2, isActive ? 0x0056b3 : 0xdee2e6);
        btn.setInteractive();
        
        const btnText = this.add.text(0, 0, label, {
            fontSize: '12px',
            fill: isActive ? '#ffffff' : '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Position using LayoutManager
        LayoutManager.alignToCamera(this, btn, 'TOP_CENTER', offsetX, y);
        LayoutManager.alignToCamera(this, btnText, 'TOP_CENTER', offsetX, y);
        
        // Store filter key for later use
        btn.filterKey = filterKey;
        btn.btnText = btnText;
        
        // PHASER CONTAINER.ADD PATTERN: Return both button and text for container addition
        // The calling code will add both elements to the container using array syntax
        // This removes both elements from scene display list and adds them to container
        
        // Click handling
        btn.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.setFilter(filterKey);
        });
        
        // Hover effects
        btn.on(Phaser.Input.Events.POINTER_OVER, () => {
            if (!isActive) {
                btn.setScale(1.05);
                btn.setFillStyle(0xe9ecef);
            }
        });
        
        btn.on(Phaser.Input.Events.POINTER_OUT, () => {
            if (!isActive) {
                btn.setScale(1);
                btn.setFillStyle(0xe9ecef);
            }
        });
        
        // CRITICAL: Return both button and text as an array
        // ❌ WRONG: return btn; // Only returns button, text stays on scene
        // ✅ CORRECT: return [btn, btnText]; // Returns both elements for container addition
        return [btn, btnText];
    }

    createGoalsList(width, height) {
        const listY = 200;
        const listHeight = height - 250;
        
        // Create goals list background using LayoutManager
        const listBg = LayoutManager.createContentArea(this, width - 40, listHeight, 'CENTER', 0, listY + listHeight / 2 - height / 2, 8);
        
        // PHASER GROUP vs CONTAINER: Groups are for managing collections, not rendering
        // Groups don't have display lists - they're just organizational tools
        // ❌ WRONG: this.goalCardsGroup.add(goalCard); // This doesn't add to display list
        // ✅ CORRECT: Use groups for management, containers for rendering
        this.goalCardsGroup = this.add.group();
        
        // Placeholder text (will be replaced with actual goal cards)
        const placeholderText = this.add.text(0, 0, 'No goals found. Add your first goal!', {
            fontSize: '18px',
            fill: '#999999'
        }).setOrigin(0.5);
        LayoutManager.alignToCamera(this, placeholderText, 'CENTER', 0, listY + listHeight / 2 - height / 2);
        this.placeholderText = placeholderText;
        
        // Add elements to container
        this.goalsListContainer.add([listBg, placeholderText]);
        
        // Position container at origin - individual elements handle their own positioning
        LayoutManager.positionContainer(this, this.goalsListContainer, 'TOP_LEFT', 0, 0);
    }

    createAddGoalSection(width, height) {
        const addY = height - 60;
        
        // Create add goal button using LayoutManager
        const addBtn = this.add.rectangle(0, 0, 200, 40, 0x28a745);
        addBtn.setStrokeStyle(2, 0x1e7e34);
        addBtn.setInteractive();
        
        const addText = this.add.text(0, 0, '+ Add New Goal', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Position using LayoutManager
        LayoutManager.alignToCamera(this, addBtn, 'BOTTOM_CENTER', 0, -60);
        LayoutManager.alignToCamera(this, addText, 'BOTTOM_CENTER', 0, -60);
        
        // Add elements to container
        this.addGoalContainer.add([addBtn, addText]);
        
        // Position container at origin - individual elements handle their own positioning
        LayoutManager.positionContainer(this, this.addGoalContainer, 'TOP_LEFT', 0, 0);
        
        // Add button interaction
        addBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
            console.log('Add Goal button clicked - calling openAddGoalModal()');
            this.openAddGoalModal();
        });
        
        // Hover effects
        addBtn.on(Phaser.Input.Events.POINTER_OVER, () => {
            addBtn.setScale(1.05);
            addBtn.setFillStyle(0x218838);
        });
        
        addBtn.on(Phaser.Input.Events.POINTER_OUT, () => {
            addBtn.setScale(1);
            addBtn.setFillStyle(0x28a745);
        });
    }

    setupDataIntegration() {
        // Listen for data changes
        this.game.events.on('goalsChanged', this.onGoalsChanged, this);
        this.game.events.on('categoriesChanged', this.onCategoriesChanged, this);
    }

    setupInputHandling() {
        // Keyboard shortcuts
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.KEY_DOWN, (event) => {
            switch(event.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'Enter':
                    this.submitForm();
                    break;
                case 'n':
                    this.openAddGoalModal();
                    break;
            }
        });
    }

    loadGoals() {
        // Load goals and categories from AppStateManager
        if (this.game.appStateManager) {
            const goals = this.game.appStateManager.getGoals();
            this.categories = this.game.appStateManager.getCategories();
            this.updateStats(goals);
            this.renderGoalCards(goals);
        }
    }

    /**
     * Load goals with enhanced persistence and fallback handling
     */
    loadGoalsWithPersistence() {
        console.log('GoalLibraryScene: Loading goals with enhanced persistence');
        
        // Try to load from registry first
        const loadedFromRegistry = this.loadGoalsFromRegistry();
        
        if (loadedFromRegistry) {
            console.log('GoalLibraryScene: Goals loaded from registry successfully');
        } else {
            console.log('GoalLibraryScene: Using ApplicationStateManager defaults');
        }
        
        // Load and display goals
        this.loadGoals();
    }

    // ============================================================================
    // PHASER GOAL PERSISTENCE: Enhanced goal persistence with Phaser registry
    // ============================================================================
    // PHASER PATTERN: Use Phaser's registry for data persistence with validation
    // - this.game.registry.set() saves data to Phaser's built-in data manager
    // - this.game.registry.get() retrieves data from Phaser's built-in data manager
    // - Phaser handles data persistence automatically across scenes
    // - This approach is simpler and more maintainable than custom persistence

    /**
     * Save goals to Phaser registry with proper data validation
     */
    saveGoalsToRegistry() {
        try {
            console.log('GoalLibraryScene: Saving goals to registry');
            
            // Get current goals from ApplicationStateManager
            const goals = this.game.appStateManager ? this.game.appStateManager.getGoals() : [];
            const categories = this.game.appStateManager ? this.game.appStateManager.getCategories() : [];
            
            // Create structured data for persistence
            const goalsData = {
                goals: goals,
                categories: categories,
                lastUpdated: Date.now(),
                version: '1.0.0'
            };
            
            // Save to Phaser registry
            this.game.registry.set('goalsData', goalsData);
            console.log('GoalLibraryScene: Goals saved to registry successfully');
            
        } catch (error) {
            console.error('GoalLibraryScene: Failed to save goals to registry:', error);
            this.showErrorMessage('Failed to save goals - please try again');
        }
    }

    /**
     * Load goals from Phaser registry with validation and fallback
     */
    loadGoalsFromRegistry() {
        try {
            console.log('GoalLibraryScene: Loading goals from registry');
            
            // Load data from Phaser registry
            const goalsData = this.game.registry.get('goalsData');
            
            if (goalsData && goalsData.goals) {
                // Validate loaded data using comprehensive validation
                if (this.validateDataStructure(goalsData)) {
                    console.log('GoalLibraryScene: Goals loaded from registry:', goalsData.goals.length);
                    
                    // Update ApplicationStateManager with loaded data
                    if (this.game.appStateManager) {
                        this.game.appStateManager.updateGoals(goalsData.goals);
                        this.game.appStateManager.updateCategories(goalsData.categories);
                    }
                    
                    return true;
                } else {
                    console.warn('GoalLibraryScene: Invalid data structure in registry');
                    this.initializeDefaultGoals();
                    return false;
                }
            } else {
                console.log('GoalLibraryScene: No goals data in registry, initializing defaults');
                this.initializeDefaultGoals();
                return false;
            }
            
        } catch (error) {
            console.error('GoalLibraryScene: Failed to load goals from registry:', error);
            this.initializeDefaultGoals();
            return false;
        }
    }

    /**
     * Initialize default goals and categories
     */
    initializeDefaultGoals() {
        try {
            console.log('GoalLibraryScene: Initializing default goals');
            
            // Use ApplicationStateManager to initialize defaults
            if (this.game.appStateManager) {
                // ApplicationStateManager already has default initialization
                const goals = this.game.appStateManager.getGoals();
                const categories = this.game.appStateManager.getCategories();
                
                console.log('GoalLibraryScene: Default goals initialized:', goals.length);
                console.log('GoalLibraryScene: Default categories initialized:', categories.length);
                
                // Save defaults to registry
                this.saveGoalsToRegistry();
            } else {
                console.error('GoalLibraryScene: ApplicationStateManager not available for default initialization');
                this.showErrorMessage('Failed to initialize default goals - system not ready');
            }
            
        } catch (error) {
            console.error('GoalLibraryScene: Failed to initialize default goals:', error);
            this.showErrorMessage('Failed to initialize default goals - please refresh the page');
        }
    }

    /**
     * Get default categories with proper color coding
     */
    getDefaultCategories() {
        return [
            { name: 'Health', color: '#4CAF50' },
            { name: 'Learning', color: '#2196F3' },
            { name: 'Social', color: '#FF9800' },
            { name: 'Planning', color: '#9C27B0' },
            { name: 'Personal', color: '#607D8B' }
        ];
    }

    /**
     * Update goal with persistence
     */
    updateGoal(goalId, updates) {
        try {
            console.log('GoalLibraryScene: Updating goal:', goalId, updates);
            
            if (this.game.appStateManager) {
                const updatedGoal = this.game.appStateManager.updateGoal(goalId, updates);
                if (updatedGoal) {
                    // Save to registry for enhanced persistence
                    this.saveGoalsToRegistry();
                    console.log('GoalLibraryScene: Goal updated successfully');
                    return updatedGoal;
                } else {
                    console.warn('GoalLibraryScene: Goal not found for update:', goalId);
                    this.showErrorMessage('Goal not found - please refresh and try again');
                    return null;
                }
            } else {
                console.error('GoalLibraryScene: ApplicationStateManager not available');
                this.showErrorMessage('Failed to update goal - system not ready');
                return null;
            }
        } catch (error) {
            console.error('GoalLibraryScene: Failed to update goal:', error);
            this.showErrorMessage('Failed to update goal - please try again');
            return null;
        }
    }

    /**
     * Delete goal with persistence
     */
    deleteGoal(goalId) {
        try {
            console.log('GoalLibraryScene: Deleting goal:', goalId);
            
            if (this.game.appStateManager) {
                const deletedGoal = this.game.appStateManager.removeGoal(goalId);
                if (deletedGoal) {
                    // Save to registry for enhanced persistence
                    this.saveGoalsToRegistry();
                    console.log('GoalLibraryScene: Goal deleted successfully');
                    return deletedGoal;
                } else {
                    console.warn('GoalLibraryScene: Goal not found for deletion:', goalId);
                    this.showErrorMessage('Goal not found - please refresh and try again');
                    return null;
                }
            } else {
                console.error('GoalLibraryScene: ApplicationStateManager not available');
                this.showErrorMessage('Failed to delete goal - system not ready');
                return null;
            }
        } catch (error) {
            console.error('GoalLibraryScene: Failed to delete goal:', error);
            this.showErrorMessage('Failed to delete goal - please try again');
            return null;
        }
    }

    onGoalsChanged(goals) {
        this.updateStats(goals);
        this.renderGoalCards(goals);
    }

    onCategoriesChanged(categories) {
        // Update category-related UI when categories change
        console.log('Categories changed:', categories);
    }

    updateStats(goals) {
        if (!goals) return;
        
        const total = goals.length;
        const toDo = goals.filter(g => g.state === 'to-do').length;
        const inPlay = goals.filter(g => g.state === 'in-play').length;
        const completed = goals.filter(g => g.state === 'completed').length;
        
        const stats = `Total: ${total} | To Do: ${toDo} | In Play: ${inPlay} | Completed: ${completed}`;
        this.statsText.setText(stats);
    }

    renderGoalCards(goals) {
        // Clear existing cards
        this.goalCardsGroup.clear(true, true);
        
        // Filter goals based on current filter
        const filteredGoals = this.filterGoals(goals);
        
        if (filteredGoals.length === 0) {
            this.placeholderText.setVisible(true);
            return;
        }
        
        this.placeholderText.setVisible(false);
        
        // ============================================================================
        // PHASER RESPONSIVE LAYOUT: Use camera dimensions for responsive goal card layout
        // ============================================================================
        // PHASER PATTERN: Use this.cameras.main dimensions for responsive layouts
        // - Camera dimensions automatically adapt to canvas size
        // - Ensures cards fit within white content area boundaries
        // - Maintains proper spacing and proportions across all screen sizes
        // - Follows Phaser's recommended responsive design patterns
        
        const { width, height } = this.cameras.main;
        
        // Responsive layout calculations
        const padding = 20;
        const availableWidth = width - (padding * 2); // Account for left/right padding
        const cardsPerRow = 3;
        const cardSpacing = 20;
        const rowSpacing = 100;
        
        // Calculate responsive card width to fit within available space
        // Total space needed = (cardsPerRow * cardWidth) + ((cardsPerRow - 1) * cardSpacing)
        // Solving for cardWidth: cardWidth = (availableWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow
        const cardWidth = Math.floor((availableWidth - (cardsPerRow - 1) * cardSpacing) / cardsPerRow);
        const cardHeight = 80;
        
        // Calculate starting position (left padding + half card width for centering)
        const startX = padding + (cardWidth / 2);
        const startY = 220;
        
        // Render goal cards with responsive positioning
        filteredGoals.forEach((goal, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            
            // Responsive positioning based on camera dimensions
            const x = startX + (col * (cardWidth + cardSpacing));
            const y = startY + (row * rowSpacing);
            
            // Create enhanced goal card with category support
            const goalCard = this.createGoalCard(goal, x, y, cardWidth, cardHeight);
            
            // Add to group for collection management
            this.goalCardsGroup.add(goalCard);
            
            // Add to goals list container for rendering
            this.goalsListContainer.add(goalCard);
        });
    }
    
    createGoalCard(goal, x, y, width, height) {
        // ============================================================================
        // PHASER GOAL CARD CREATION: Enhanced goal card with category support
        // ============================================================================
        // PHASER PATTERN: Create goal card with category color coding and visual indicators
        // - Category color lookup from this.categories array
        // - Visual category indicator (colored border and left edge)
        // - Category label and difficulty indicator
        // - Proper container integration for rendering
        
        // Get primary category (first category in the array)
        const primaryCategoryId = goal.categories && goal.categories.length > 0 ? goal.categories[0] : null;
        const category = this.categories ? this.categories.find(cat => cat.id === primaryCategoryId) : null;
        const categoryColor = category ? category.color : '#607D8B';
        const categoryName = category ? category.name : 'Uncategorized';
        
        // Create card container
        const cardContainer = new Phaser.GameObjects.Container(this, x, y);
        
        // Card background
        const cardBg = new Phaser.GameObjects.Rectangle(this, 0, 0, width, height, 0xffffff);
        cardBg.setStrokeStyle(2, categoryColor);
        cardContainer.add(cardBg);
        
        // Category indicator (colored left edge)
        const categoryIndicator = new Phaser.GameObjects.Rectangle(this, -width/2 + 10, 0, 4, height, categoryColor);
        cardContainer.add(categoryIndicator);
        
        // Goal text
        const goalText = new Phaser.GameObjects.Text(this, -width/2 + 20, -10, goal.text || 'Untitled Goal', {
            fontSize: '14px',
            fill: '#333333',
            wordWrap: { width: width - 40 }
        }).setOrigin(0, 0.5);
        cardContainer.add(goalText);
        
        // Category label
        const categoryLabel = new Phaser.GameObjects.Text(this, -width/2 + 20, 10, categoryName, {
            fontSize: '12px',
            fill: categoryColor,
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        cardContainer.add(categoryLabel);
        
        // Difficulty indicator (convert to proper case)
        const difficulty = goal.difficulty ? goal.difficulty.charAt(0).toUpperCase() + goal.difficulty.slice(1) : 'Unknown';
        const difficultyColor = this.getDifficultyColor(difficulty);
        const difficultyDot = new Phaser.GameObjects.Ellipse(this, width/2 - 15, 0, 12, 12, difficultyColor);
        cardContainer.add(difficultyDot);
        
        // Add interactivity
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Hover effects
        cardContainer.on('pointerover', () => {
            cardBg.setFillStyle(0xe9ecef);
            cardBg.setStrokeStyle(3, categoryColor);
        });
        
        cardContainer.on('pointerout', () => {
            cardBg.setFillStyle(0xffffff);
            cardBg.setStrokeStyle(2, categoryColor);
        });
        
        // Click handler
        cardContainer.on('pointerdown', () => {
            console.log('Goal card clicked:', goal.text);
            // TODO: Add goal selection/editing functionality
        });
        
        return cardContainer;
    }
    
    getDifficultyColor(difficulty) {
        // ============================================================================
        // PHASER DIFFICULTY COLOR SYSTEM: Color coding for goal difficulty levels
        // ============================================================================
        // PHASER PATTERN: Use consistent color scheme for difficulty indicators
        // - Easy: Green for accessible goals
        // - Medium: Orange for moderate challenges
        // - Hard: Red for difficult goals
        // - Default: Gray for unclassified goals
        
        switch (difficulty) {
            case 'Easy': return 0x4CAF50;
            case 'Medium': return 0xFF9800;
            case 'Hard': return 0xf44336;
            default: return 0x607D8B;
        }
    }

    filterGoals(goals) {
        if (this.currentFilter === 'all') {
            return goals;
        }
        return goals.filter(goal => goal.state === this.currentFilter);
    }

    setupGoalCardEvents() {
        // Listen for GoalCard events
        this.events.on('goalCardSelected', this.onGoalCardSelected, this);
        this.events.on('goalCardEdit', this.onGoalCardEdit, this);
        this.events.on('goalCardDelete', this.onGoalCardDelete, this);
    }

    onGoalCardSelected(goal, isSelected) {
        console.log('Goal selected:', goal.text, 'Selected:', isSelected);
        
        // Update selection state
        this.selectedGoal = isSelected ? goal : null;
        
        // Update UI based on selection
        this.updateSelectionUI();
    }

    onGoalCardEdit(goal) {
        console.log('Edit goal:', goal.text);
        // TODO: Open edit modal (will be implemented in 3.4.1)
        this.openEditGoalModal(goal);
    }

    onGoalCardDelete(goal) {
        console.log('Delete goal:', goal.text);
        // TODO: Show confirmation dialog (will be implemented in 3.5.1)
        this.showDeleteConfirmation(goal);
    }

    updateSelectionUI() {
        // Update UI based on current selection
        // TODO: Implement selection-based UI updates
    }

    /**
     * Validates that the scene is in a proper state for creating game objects
     * Following Phaser best practices for scene lifecycle validation
     * @returns {boolean} True if scene is ready for game object creation
     */
    validateSceneState() {
        // Check if scene exists and is active
        if (!this || !this.sys) {
            console.warn('GoalLibraryScene: Scene or scene.sys not available');
            return false;
        }

        // Check if scene is active
        if (!this.sys.isActive()) {
            console.warn('GoalLibraryScene: Scene is not active');
            return false;
        }

        // Check if cameras are available
        if (!this.cameras || !this.cameras.main) {
            console.warn('GoalLibraryScene: Cameras not available');
            return false;
        }

        // Check if add method is available (scene is fully initialized)
        if (typeof this.add !== 'function') {
            console.warn('GoalLibraryScene: Scene.add method not available');
            return false;
        }

        // All checks passed - scene is ready
        return true;
    }

    openEditGoalModal(goal) {
        // Validate scene state before creating modal (Phaser best practice)
        if (!this.validateSceneState()) {
            console.error('GoalLibraryScene: Cannot create edit modal - scene not ready');
            return;
        }

        try {
            // Create edit modal with pre-populated data (AddGoalModal constructor already adds itself to scene)
            this.editGoalModal = new AddGoalModal(this, this.cameras.main.centerX, this.cameras.main.centerY, goal);
            
            // Set up modal events
            this.editGoalModal.on('goalSaved', this.onGoalSaved, this);
            this.editGoalModal.on('modalClosed', this.onModalClosed, this);
            
            console.log('GoalLibraryScene: Edit modal created successfully');
        } catch (error) {
            console.error('GoalLibraryScene: Failed to create edit modal:', error);
            this.editGoalModal = null;
        }
    }

    showDeleteConfirmation(goal) {
        // Placeholder for delete confirmation (will be implemented in 3.5.1)
        console.log('Showing delete confirmation for:', goal.text);
    }

    setFilter(filterKey) {
        this.currentFilter = filterKey;
        
        // Update filter button appearances
        this.filterButtonsGroup.children.entries.forEach(btn => {
            const isActive = btn.filterKey === filterKey;
            btn.setFillStyle(isActive ? 0x007bff : 0xe9ecef);
            btn.setStrokeStyle(2, isActive ? 0x0056b3 : 0xdee2e6);
            btn.btnText.setFill(isActive ? '#ffffff' : '#333333');
        });
        
        // Reload goals with new filter
        this.loadGoals();
    }

    openAddGoalModal() {
        // Validate scene state before creating modal (Phaser best practice)
        if (!this.validateSceneState()) {
            console.warn('GoalLibraryScene: Scene validation failed - attempting modal creation anyway');
            // Don't return early - try to create modal even if validation fails
        }

        try {
            // Create modal using DOM elements (AddGoalModal constructor already adds itself to scene)
            this.addGoalModal = new AddGoalModal(this, this.cameras.main.centerX, this.cameras.main.centerY);
            
            // Set up modal events
            this.addGoalModal.on('goalSaved', this.onGoalSaved, this);
            this.addGoalModal.on('modalClosed', this.onModalClosed, this);
            
            console.log('GoalLibraryScene: Add modal created successfully');
        } catch (error) {
            console.error('GoalLibraryScene: Failed to create add modal:', error);
            this.addGoalModal = null;
        }
    }

    closeModal() {
        // Close any open modals with proper validation
        try {
            if (this.addGoalModal) {
                this.addGoalModal.closeModal();
                this.addGoalModal = null;
            }
        } catch (error) {
            console.error('GoalLibraryScene: Error closing add modal:', error);
        }

        try {
            if (this.editGoalModal) {
                this.editGoalModal.closeModal();
                this.editGoalModal = null;
            }
        } catch (error) {
            console.error('GoalLibraryScene: Error closing edit modal:', error);
        }
    }

    // ============================================================================
    // PHASER GOAL MANAGEMENT: Enhanced goal saving with ApplicationStateManager
    // ============================================================================
    // PHASER PATTERN: Use ApplicationStateManager for goal persistence
    // - ApplicationStateManager handles goal creation and registry updates
    // - Phaser's registry events automatically trigger UI updates
    // - This ensures proper data flow and state synchronization
    onGoalSaved(goalData) {
        console.log('GoalLibraryScene: Goal saved:', goalData);

        // ============================================================================
        // PHASER GOAL PERSISTENCE: Use ApplicationStateManager for goal creation
        // ============================================================================
        // PHASER PATTERN: Use ApplicationStateManager for domain logic
        // - ApplicationStateManager handles goal creation and validation
        // - Updates Phaser registry automatically
        // - Triggers 'goalsChanged' event for UI updates
        // - This ensures proper data flow and state management

        try {
            if (this.game.appStateManager) {
                // Use ApplicationStateManager to add goal
                const createdGoal = this.game.appStateManager.addGoal(goalData);
                console.log('GoalLibraryScene: Goal created successfully:', createdGoal);

                // Save to registry for enhanced persistence
                this.saveGoalsToRegistry();

                // Goals will be automatically updated via ApplicationStateManager events
                // The 'goalsChanged' event will trigger UI refresh
            } else {
                console.error('GoalLibraryScene: ApplicationStateManager not available');
                // Fallback: Show error message to user
                this.showErrorMessage('Failed to save goal - system not ready');
            }
        } catch (error) {
            console.error('GoalLibraryScene: Failed to save goal:', error);
            // Fallback: Show error message to user
            this.showErrorMessage('Failed to save goal - please try again');
        }
    }
    
    // ============================================================================
    // PHASER ERROR HANDLING: User feedback for errors
    // ============================================================================
    // PHASER PATTERN: Provide user feedback for errors
    // - Use simple text display for error messages
    // - Position error message prominently
    // - Auto-hide after reasonable time
    showErrorMessage(message) {
        // Create error message text
        const errorText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 100, 
            message, 
            {
                fontSize: '16px',
                fill: '#dc3545',
                fontStyle: 'bold',
                backgroundColor: '#f8d7da',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);
        
        // Auto-hide after 3 seconds
        if (this.time && this.time.delayedCall) {
            this.time.delayedCall(3000, () => {
                if (errorText && errorText.destroy) {
                    errorText.destroy();
                }
            });
        } else {
            // Fallback: Use setTimeout if this.time is not available
            setTimeout(() => {
                if (errorText && errorText.destroy) {
                    errorText.destroy();
                }
            }, 3000);
        }
    }

    onModalClosed() {
        console.log('Modal closed');
        // Clean up modal references
        this.addGoalModal = null;
        this.editGoalModal = null;
    }

    submitForm() {
        // Placeholder for form submission (will be implemented in 3.4.2)
        console.log('Submitting form...');
    }

    /**
     * Validate loaded data structure
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Check required properties
        if (!Array.isArray(data.goals) || !Array.isArray(data.categories)) {
            return false;
        }
        
        // Validate goals structure
        for (const goal of data.goals) {
            if (!goal || typeof goal !== 'object' || !goal.text || !goal.id) {
                return false;
            }
        }
        
        // Validate categories structure
        for (const category of data.categories) {
            if (!category || typeof category !== 'object' || !category.name || !category.color) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Save data before scene shutdown
     */
    saveDataOnShutdown() {
        try {
            console.log('GoalLibraryScene: Saving data before shutdown');
            this.saveGoalsToRegistry();
        } catch (error) {
            console.error('GoalLibraryScene: Failed to save data on shutdown:', error);
        }
    }

    shutdown() {
        console.log('GoalLibraryScene: shutdown() called - cleaning up containers and resources');
        
        // Save data before shutdown
        this.saveDataOnShutdown();
        
        // PHASER SCENE CLEANUP: Comprehensive cleanup following Phaser documentation patterns
        // The shutdown() method is called automatically by Phaser when a scene is stopped
        // This ensures proper cleanup to prevent memory leaks and resource accumulation
        
        // ============================================================================
        // CONTAINER CLEANUP: Destroy all containers and remove from display list
        // ============================================================================
        // PHASER PATTERN: container.destroy() removes container from scene's display list
        // and destroys all its children. This is the standard Phaser cleanup method.
        
        if (this.headerContainer) {
            // AI NOTE: destroy() is the core Phaser method for cleaning up Game Objects
            // It removes the object from the display list and frees all resources
            this.headerContainer.destroy();
            this.headerContainer = null; // Set to null to prevent memory leaks
        }
        if (this.filtersContainer) {
            this.filtersContainer.destroy();
            this.filtersContainer = null;
        }
        if (this.goalsListContainer) {
            this.goalsListContainer.destroy();
            this.goalsListContainer = null;
        }
        if (this.addGoalContainer) {
            this.addGoalContainer.destroy();
            this.addGoalContainer = null;
        }
        
        // ============================================================================
        // GROUP CLEANUP: Clear all groups and destroy their children
        // ============================================================================
        // PHASER PATTERN: group.clear(destroyChildren, destroyContext) removes all children
        // The first parameter (true) destroys each child, second parameter (true) destroys context
        
        if (this.goalCardsGroup) {
            // AI NOTE: clear(true, true) destroys all children in the group
            // This is more thorough than just removing them from the group
            this.goalCardsGroup.clear(true, true);
            this.goalCardsGroup = null; // Set to null to prevent memory leaks
        }
        if (this.filterButtonsGroup) {
            this.filterButtonsGroup.clear(true, true);
            this.filterButtonsGroup = null;
        }
        if (this.actionButtonsGroup) {
            // AI NOTE: This group was missing from cleanup - added for completeness
            this.actionButtonsGroup.clear(true, true);
            this.actionButtonsGroup = null;
        }
        
        // ============================================================================
        // MODAL CLEANUP: Destroy custom modal objects
        // ============================================================================
        // PHASER PATTERN: Custom objects should be destroyed in shutdown()
        // This prevents modal dialogs from persisting after scene shutdown
        
        if (this.addGoalModal) {
            // AI NOTE: Custom modal objects need explicit cleanup
            // They're not automatically managed by Phaser's scene lifecycle
            this.addGoalModal.destroy();
            this.addGoalModal = null;
        }
        if (this.editGoalModal) {
            this.editGoalModal.destroy();
            this.editGoalModal = null;
        }
        
        // ============================================================================
        // EVENT LISTENER CLEANUP: Remove all event listeners
        // ============================================================================
        // PHASER PATTERN: Always clean up event listeners to prevent memory leaks
        // Use the same context (this) that was used when adding listeners
        
        // Game-level events (global events)
        this.game.events.off('goalsChanged', this.onGoalsChanged, this);
        this.game.events.off('categoriesChanged', this.onCategoriesChanged, this);
        
        // Scene-level events (local to this scene)
        this.events.off('goalCardSelected', this.onGoalCardSelected, this);
        this.events.off('goalCardEdit', this.onGoalCardEdit, this);
        this.events.off('goalCardDelete', this.onGoalCardDelete, this);
        
        // Input events (keyboard, mouse, touch)
        this.input.keyboard.off(Phaser.Input.Keyboard.Events.KEY_DOWN);
        
        // ============================================================================
        // FALLBACK CLEANUP: Comprehensive cleanup as safety net
        // ============================================================================
        // PHASER PATTERN: Use removeAllListeners() as a safety net to catch any missed listeners
        // This ensures no event listeners are left behind
        
        this.events.removeAllListeners(); // Remove all scene event listeners
        this.input.keyboard.removeAllListeners(); // Remove all keyboard listeners
        
        // AI NOTE: This comprehensive cleanup follows Phaser best practices:
        // 1. Destroy containers (removes from display list)
        // 2. Clear groups (destroys children)
        // 3. Clean up custom objects (modals)
        // 4. Remove event listeners (prevents memory leaks)
        // 5. Set references to null (prevents dangling references)
        
        console.log('GoalLibraryScene: shutdown() completed - all containers and resources cleaned up');
    }


    /**
     * Enhanced scene state management following Phaser best practices
     * Provides comprehensive scene state validation and management
     */
    validateSceneState() {
        // Check if scene exists and is active
        if (!this || !this.sys) {
            console.warn('GoalLibraryScene: Scene or scene.sys not available');
            return false;
        }

        // Check if scene is active or visible (more permissive for modal creation)
        if (!this.sys.isActive() && !this.sys.isVisible()) {
            console.warn('GoalLibraryScene: Scene is neither active nor visible');
            return false;
        }

        // Check if scene is shutting down
        if (this.sys.settings.status === Phaser.Scenes.SHUTDOWN) {
            console.warn('GoalLibraryScene: Scene is shutting down');
            return false;
        }

        // Check if cameras are available
        if (!this.cameras || !this.cameras.main) {
            console.warn('GoalLibraryScene: Cameras not available');
            return false;
        }

        // Check if add method is available (scene is fully initialized)
        if (typeof this.add !== 'function') {
            console.warn('GoalLibraryScene: Scene.add method not available');
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
            isShuttingDown: this.sys.settings.status === Phaser.Scenes.SHUTDOWN,
            childrenCount: this.children.list.length,
            uiState: {
                currentFilter: this.currentFilter,
                searchQuery: this.searchQuery,
                selectedGoal: this.selectedGoal ? this.selectedGoal.id : null,
                isEditing: this.isEditing
            },
            containers: {
                header: this.headerContainer ? this.headerContainer.list.length : 0,
                filters: this.filtersContainer ? this.filtersContainer.list.length : 0,
                goalsList: this.goalsListContainer ? this.goalsListContainer.list.length : 0,
                addGoal: this.addGoalContainer ? this.addGoalContainer.list.length : 0
            },
            groups: {
                goalCards: this.goalCardsGroup ? this.goalCardsGroup.children.size : 0,
                filterButtons: this.filterButtonsGroup ? this.filterButtonsGroup.children.size : 0,
                actionButtons: this.actionButtonsGroup ? this.actionButtonsGroup.children.size : 0
            },
            modals: {
                addGoal: this.addGoalModal ? 'open' : 'closed',
                editGoal: this.editGoalModal ? 'open' : 'closed'
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

    preDestroy() {
        // PHASER PREDESTROY: Final cleanup before scene is completely destroyed
        // This method is called after shutdown() and before the scene is removed from memory
        // It's the last chance to clean up any remaining resources
        
        console.log('GoalLibraryScene: preDestroy() called - final cleanup');
        
        // AI NOTE: preDestroy() is called after shutdown() and is the final cleanup step
        // At this point, most resources should already be cleaned up in shutdown()
        // This is mainly for any final cleanup or logging
        
        // Ensure all references are nullified (defensive programming)
        this.headerContainer = null;
        this.filtersContainer = null;
        this.goalsListContainer = null;
        this.addGoalContainer = null;
        this.goalCardsGroup = null;
        this.filterButtonsGroup = null;
        this.actionButtonsGroup = null;
        this.addGoalModal = null;
        this.editGoalModal = null;
        
        // Clear any remaining data references
        this.currentFilter = null;
        this.searchQuery = null;
        this.selectedGoal = null;
        
        console.log('GoalLibraryScene: preDestroy() completed - scene ready for destruction');
    }
}
