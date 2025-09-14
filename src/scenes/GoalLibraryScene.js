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
        this.cameras.main.setBackgroundColor(0xf8f9fa);
        this.cameras.main.setViewport(0, 0, 1200, 800);
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
        
        // Load initial data
        this.loadGoals();
        
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
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);
        background.setDepth(-1); // Put background behind all other objects
        
        // Set up camera
        this.cameras.main.setBackgroundColor(0xf8f9fa);
        
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
        const headerY = 60;
        
        // PHASER CONTAINER PATTERN: Create elements and add directly to container
        // According to Phaser docs, container.add() handles display list management automatically
        
        // Background for header
        const headerBg = this.add.rectangle(width / 2, headerY, width, 80, 0xffffff);
        headerBg.setStrokeStyle(1, 0xe9ecef);
        
        // Title
        const title = this.add.text(width / 2, headerY - 10, '📚 Goal Library', {
            fontSize: '28px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Back button
        const backBtn = this.add.rectangle(100, headerY, 100, 35, 0x6c757d);
        backBtn.setStrokeStyle(2, 0x5a6268);
        backBtn.setInteractive();
        
        const backText = this.add.text(100, headerY, '← Back', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Stats text
        this.statsText = this.add.text(width - 20, headerY, '', {
            fontSize: '14px',
            fill: '#666666',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        
        // PHASER CONTAINER.ADD PATTERN: Add elements to container using array syntax
        // This removes elements from scene display list and adds them to container
        // ❌ WRONG: this.headerContainer.add(headerBg); this.headerContainer.add(title); // Individual adds
        // ✅ CORRECT: this.headerContainer.add([headerBg, title, backBtn, backText, this.statsText]); // Array add
        this.headerContainer.add([headerBg, title, backBtn, backText, this.statsText]);
        
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
        
        // PHASER DOUBLE-RENDERING FIX: Create elements but don't add to scene directly
        // All elements created with this.add.* are automatically added to scene display list
        
        // Background for filters
        const filtersBg = this.add.rectangle(width / 2, filtersY, width, 60, 0xffffff);
        filtersBg.setStrokeStyle(1, 0xe9ecef);
        // NOTE: filtersBg is now on scene display list automatically
        
        // PHASER GROUP vs CONTAINER: Groups are for managing collections, not rendering
        // Groups don't have display lists - they're just organizational tools
        // ❌ WRONG: this.filterButtonsGroup.add(btn); // This doesn't add to display list
        // ✅ CORRECT: Use groups for management, containers for rendering
        this.filterButtonsGroup = this.add.group();
        
        // Filter buttons
        const filters = [
            { key: 'all', label: 'All', x: 100 },
            { key: 'to-do', label: 'To Do', x: 200 },
            { key: 'in-play', label: 'In Play', x: 300 },
            { key: 'completed', label: 'Completed', x: 400 }
        ];
        
        const filterButtons = [];
        filters.forEach(filter => {
            const buttonElements = this.createFilterButton(filter.x, filtersY, filter.label, filter.key);
            // PHASER GROUP PATTERN: Groups are for management, not display
            // Add button (first element) to group for management
            this.filterButtonsGroup.add(buttonElements[0]);
            // Collect all button elements for container addition
            filterButtons.push(...buttonElements);
        });
        
        // Search input placeholder (will be implemented in 3.3.2)
        const searchPlaceholder = this.add.text(width - 150, filtersY, '🔍 Search goals...', {
            fontSize: '14px',
            fill: '#999999'
        }).setOrigin(0.5);
        // NOTE: searchPlaceholder is now on scene display list automatically
        
        // PHASER CONTAINER.ADD PATTERN: Add all elements to container using array syntax
        // This removes elements from scene display list and adds them to container
        // ❌ WRONG: this.filtersContainer.add(filtersBg); this.filtersContainer.add(btn1); // Individual adds
        // ✅ CORRECT: this.filtersContainer.add([filtersBg, ...filterButtons, searchPlaceholder]); // Array add
        this.filtersContainer.add([filtersBg, ...filterButtons, searchPlaceholder]);
    }

    createFilterButton(x, y, label, filterKey) {
        const isActive = filterKey === this.currentFilter;
        
        // PHASER DOUBLE-RENDERING FIX: Create elements but don't add to scene directly
        // Elements created with this.add.* are automatically added to scene display list
        const btn = this.add.rectangle(x, y, 80, 30, isActive ? 0x007bff : 0xf8f9fa);
        btn.setStrokeStyle(2, isActive ? 0x0056b3 : 0xdee2e6);
        btn.setInteractive();
        // NOTE: btn is now on scene display list automatically
        
        const btnText = this.add.text(x, y, label, {
            fontSize: '12px',
            fill: isActive ? '#ffffff' : '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        // NOTE: btnText is now on scene display list automatically
        
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
                btn.setFillStyle(0xf8f9fa);
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
        
        // PHASER DOUBLE-RENDERING FIX: Create elements but don't add to scene directly
        // All elements created with this.add.* are automatically added to scene display list
        
        // Background for goals list
        const listBg = this.add.rectangle(width / 2, listY + listHeight / 2, width - 40, listHeight, 0xffffff);
        listBg.setStrokeStyle(1, 0xe9ecef);
        // NOTE: listBg is now on scene display list automatically
        
        // PHASER GROUP vs CONTAINER: Groups are for managing collections, not rendering
        // Groups don't have display lists - they're just organizational tools
        // ❌ WRONG: this.goalCardsGroup.add(goalCard); // This doesn't add to display list
        // ✅ CORRECT: Use groups for management, containers for rendering
        this.goalCardsGroup = this.add.group();
        
        // Placeholder text (will be replaced with actual goal cards)
        const placeholderText = this.add.text(width / 2, listY + listHeight / 2, 'No goals found. Add your first goal!', {
            fontSize: '18px',
            fill: '#999999'
        }).setOrigin(0.5);
        this.placeholderText = placeholderText;
        // NOTE: placeholderText is now on scene display list automatically
        
        // PHASER CONTAINER.ADD PATTERN: Add all elements to container using array syntax
        // This removes elements from scene display list and adds them to container
        // ❌ WRONG: this.goalsListContainer.add(listBg); this.goalsListContainer.add(placeholderText); // Individual adds
        // ✅ CORRECT: this.goalsListContainer.add([listBg, placeholderText]); // Array add
        this.goalsListContainer.add([listBg, placeholderText]);
    }

    createAddGoalSection(width, height) {
        const addY = height - 60;
        
        // PHASER DOUBLE-RENDERING FIX: Create elements but don't add to scene directly
        // All elements created with this.add.* are automatically added to scene display list
        
        // Add goal button
        const addBtn = this.add.rectangle(width / 2, addY, 200, 40, 0x28a745);
        addBtn.setStrokeStyle(2, 0x1e7e34);
        addBtn.setInteractive();
        // NOTE: addBtn is now on scene display list automatically
        
        const addText = this.add.text(width / 2, addY, '+ Add New Goal', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        // NOTE: addText is now on scene display list automatically
        
        // PHASER CONTAINER.ADD PATTERN: Add all elements to container using array syntax
        // This removes elements from scene display list and adds them to container
        // ❌ WRONG: this.addGoalContainer.add(addBtn); this.addGoalContainer.add(addText); // Individual adds
        // ✅ CORRECT: this.addGoalContainer.add([addBtn, addText]); // Array add
        this.addGoalContainer.add([addBtn, addText]);
        
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
        // Load goals from AppStateManager
        if (this.game.appStateManager) {
            const goals = this.game.appStateManager.getGoals();
            this.updateStats(goals);
            this.renderGoalCards(goals);
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
        
        // Render goal cards using GoalCard component
        filteredGoals.forEach((goal, index) => {
            const x = 50 + (index % 3) * 320;
            const y = 220 + Math.floor(index / 3) * 140;
            
            // Create GoalCard component
            const goalCard = new GoalCard(this, x, y, goal, {
                width: this.cardWidth,
                height: this.cardHeight
            });
            
            // ============================================================================
            // PHASER DOUBLE-RENDERING FIX: Proper GoalCard rendering
            // ============================================================================
            // PHASER PATTERN: Add GoalCard to group AND container (not scene directly)
            // - Groups manage collections but don't render children
            // - Containers both group AND render their children
            // - This prevents double-rendering while ensuring visibility
            
            // Add to group for collection management
            this.goalCardsGroup.add(goalCard);
            
            // Add to goals list container for rendering
            // AI NOTE: This is the correct approach - containers handle both grouping and rendering
            this.goalsListContainer.add(goalCard);
            
            // Animate appearance
            goalCard.animateAppearance();
        });
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
            btn.setFillStyle(isActive ? 0x007bff : 0xf8f9fa);
            btn.setStrokeStyle(2, isActive ? 0x0056b3 : 0xdee2e6);
            btn.btnText.setFill(isActive ? '#ffffff' : '#333333');
        });
        
        // Reload goals with new filter
        this.loadGoals();
    }

    openAddGoalModal() {
        // Validate scene state before creating modal (Phaser best practice)
        if (!this.validateSceneState()) {
            console.error('GoalLibraryScene: Cannot create add modal - scene not ready');
            return;
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

    onGoalSaved(goalData) {
        console.log('Goal saved:', goalData);
        // Goals will be automatically updated via ApplicationStateManager events
        // No need to manually refresh - the onGoalsChanged event will handle it
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

    shutdown() {
        console.log('GoalLibraryScene: shutdown() called - cleaning up containers and resources');
        
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

        // Check if scene is active
        if (!this.sys.isActive()) {
            console.warn('GoalLibraryScene: Scene is not active');
            return false;
        }

        // Check if scene is visible
        if (!this.sys.isVisible()) {
            console.warn('GoalLibraryScene: Scene is not visible');
            return false;
        }

        // Check if scene is shutting down
        if (this.sys.isShuttingDown()) {
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
            isShuttingDown: this.sys.isShuttingDown(),
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
