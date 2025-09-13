// Goal Library Scene - Manage goals and categories
// Comprehensive goal management interface following Phaser best practices
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
        // Initialize scene with data
        console.log('GoalLibraryScene: init() called with data:', data);
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
    }

    create() {
        const { width, height } = this.cameras.main;
        
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
    }

    setupScene(width, height) {
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);
        
        // Set up camera
        this.cameras.main.setBackgroundColor(0xf8f9fa);
        
        // Enable input
        this.input.enabled = true;
    }

    createContainers(width, height) {
        // Header container for title, back button, and stats
        this.headerContainer = this.add.container(0, 0);
        this.headerContainer.setDepth(10);
        
        // Filters container for search and filter buttons
        this.filtersContainer = this.add.container(0, 0);
        this.filtersContainer.setDepth(9);
        
        // Goals list container for goal cards
        this.goalsListContainer = this.add.container(0, 0);
        this.goalsListContainer.setDepth(8);
        
        // Add goal container for add button and modal
        this.addGoalContainer = this.add.container(0, 0);
        this.addGoalContainer.setDepth(11);
    }

    createHeader(width, height) {
        const headerY = 60;
        
        // Background for header
        const headerBg = this.add.rectangle(width / 2, headerY, width, 80, 0xffffff);
        headerBg.setStrokeStyle(1, 0xe9ecef);
        this.headerContainer.add(headerBg);
        
        // Title
        const title = this.add.text(width / 2, headerY - 10, '📚 Goal Library', {
            fontSize: '28px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.headerContainer.add(title);
        
        // Back button
        const backBtn = this.add.rectangle(100, headerY, 100, 35, 0x6c757d);
        backBtn.setStrokeStyle(2, 0x5a6268);
        backBtn.setInteractive();
        this.headerContainer.add(backBtn);
        
        const backText = this.add.text(100, headerY, '← Back', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.headerContainer.add(backText);
        
        // Stats text
        this.statsText = this.add.text(width - 20, headerY, '', {
            fontSize: '14px',
            fill: '#666666'
        }).setOrigin(1, 0.5);
        this.headerContainer.add(this.statsText);
        
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
        
        // Background for filters
        const filtersBg = this.add.rectangle(width / 2, filtersY, width, 60, 0xffffff);
        filtersBg.setStrokeStyle(1, 0xe9ecef);
        this.filtersContainer.add(filtersBg);
        
        // Filter buttons group (not added to container)
        this.filterButtonsGroup = this.add.group();
        
        // Filter buttons
        const filters = [
            { key: 'all', label: 'All', x: 100 },
            { key: 'to-do', label: 'To Do', x: 200 },
            { key: 'in-play', label: 'In Play', x: 300 },
            { key: 'completed', label: 'Completed', x: 400 }
        ];
        
        filters.forEach(filter => {
            const btn = this.createFilterButton(filter.x, filtersY, filter.label, filter.key);
            this.filterButtonsGroup.add(btn);
        });
        
        // Search input placeholder (will be implemented in 3.3.2)
        const searchPlaceholder = this.add.text(width - 150, filtersY, '🔍 Search goals...', {
            fontSize: '14px',
            fill: '#999999'
        }).setOrigin(0.5);
        this.filtersContainer.add(searchPlaceholder);
    }

    createFilterButton(x, y, label, filterKey) {
        const isActive = filterKey === this.currentFilter;
        const btn = this.add.rectangle(x, y, 80, 30, isActive ? 0x007bff : 0xf8f9fa);
        btn.setStrokeStyle(2, isActive ? 0x0056b3 : 0xdee2e6);
        btn.setInteractive();
        
        const btnText = this.add.text(x, y, label, {
            fontSize: '12px',
            fill: isActive ? '#ffffff' : '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Store filter key for later use
        btn.filterKey = filterKey;
        btn.btnText = btnText;
        
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
        
        return btn;
    }

    createGoalsList(width, height) {
        const listY = 200;
        const listHeight = height - 250;
        
        // Background for goals list
        const listBg = this.add.rectangle(width / 2, listY + listHeight / 2, width - 40, listHeight, 0xffffff);
        listBg.setStrokeStyle(1, 0xe9ecef);
        this.goalsListContainer.add(listBg);
        
        // Goals group (not added to container)
        this.goalCardsGroup = this.add.group();
        
        // Placeholder text (will be replaced with actual goal cards)
        const placeholderText = this.add.text(width / 2, listY + listHeight / 2, 'No goals found. Add your first goal!', {
            fontSize: '18px',
            fill: '#999999'
        }).setOrigin(0.5);
        this.goalsListContainer.add(placeholderText);
        this.placeholderText = placeholderText;
    }

    createAddGoalSection(width, height) {
        const addY = height - 60;
        
        // Add goal button
        const addBtn = this.add.rectangle(width / 2, addY, 200, 40, 0x28a745);
        addBtn.setStrokeStyle(2, 0x1e7e34);
        addBtn.setInteractive();
        this.addGoalContainer.add(addBtn);
        
        const addText = this.add.text(width / 2, addY, '+ Add New Goal', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.addGoalContainer.add(addText);
        
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
        // Load goals from StateManager
        if (this.game.stateManager) {
            const goals = this.game.stateManager.getGoals();
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
            
            // Add to group
            this.goalCardsGroup.add(goalCard);
            
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

        // Check if scene is active and not shutting down
        if (!this.isActive()) {
            console.warn('GoalLibraryScene: Scene is not active');
            return false;
        }

        // Check if scene is not in the process of shutting down
        if (this.isShuttingDown()) {
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
        // Goals will be automatically updated via StateManager events
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
        // Clean up event listeners
        this.game.events.off('goalsChanged', this.onGoalsChanged, this);
        this.game.events.off('categoriesChanged', this.onCategoriesChanged, this);
        
        // Clean up goal card events
        this.events.off('goalCardSelected', this.onGoalCardSelected, this);
        this.events.off('goalCardEdit', this.onGoalCardEdit, this);
        this.events.off('goalCardDelete', this.onGoalCardDelete, this);
        
        // Clean up input handlers
        this.input.keyboard.off(Phaser.Input.Keyboard.Events.KEY_DOWN);
        
        // Clean up modals
        if (this.addGoalModal) {
            this.addGoalModal.destroy();
            this.addGoalModal = null;
        }
        if (this.editGoalModal) {
            this.editGoalModal.destroy();
            this.editGoalModal = null;
        }
        
        // Clear groups
        if (this.goalCardsGroup) {
            this.goalCardsGroup.clear(true, true);
        }
        if (this.filterButtonsGroup) {
            this.filterButtonsGroup.clear(true, true);
        }
        if (this.addGoalContainer) {
            this.addGoalContainer.clear(true, true);
        }
        
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
