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
 */
export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'MainMenuScene',
            plugins: ['TweenManager', 'InputPlugin', 'Clock'],
            data: {
                defaultData: 'value',
                sceneType: 'navigation',
                hasAnimations: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('MainMenuScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    create() {
        console.log('MainMenuScene: create() called');
        
        // Configure camera
        this.cameras.main.setBackgroundColor('#ffffff');
        this.cameras.main.setViewport(0, 0, 1200, 800);
        
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);

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

        // State info display
        this.createStateInfoDisplay(width, height);

        // Navigation buttons
        this.createNavigationButtons(width, height);

        // Save indicator
        this.createSaveIndicator(width, height);

        // Set up state event listeners
        this.setupStateEventListeners();
        
        // Debug: Check if objects are properly rendered
        console.log('Scene children count:', this.children.list.length);
        console.log('Renderer type:', this.sys.renderer.type);
        console.log('Scene visible:', this.scene.isVisible());
        console.log('Camera viewport:', { width, height });
        
        // Ensure objects are added to display list
        this.children.bringToTop();
    }

    createNavigationButtons(width, height) {
        // PHASER COMPLIANT: Use DOM elements for accessibility and testing
        // DOM elements are accessible to Playwright and other testing tools
        
        // Goal Library Button
        const goalLibraryBtn = this.add.dom(width / 2, height / 2 - 60, 'button', 
            'background-color: #667eea; border: 2px solid #5a6fd8; color: white; font-size: 20px; font-weight: bold; width: 300px; height: 60px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;',
            '📚 Goal Library'
        );
        goalLibraryBtn.setInteractive();
        
        // PHASER COMPLIANT: Use Phaser's input events
        goalLibraryBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
            // Log scene transition
            if (this.game.sceneStateLogger) {
                this.game.sceneStateLogger.logSceneTransition('MainMenuScene', 'GoalLibraryScene', 'scene.start()');
            }
            this.scene.start('GoalLibraryScene');
        });

        // Bingo Grid Button
        const bingoGridBtn = this.add.dom(width / 2, height / 2 + 20, 'button',
            'background-color: #4CAF50; border: 2px solid #45a049; color: white; font-size: 20px; font-weight: bold; width: 300px; height: 60px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;',
            '🎲 Play Bingo'
        );
        bingoGridBtn.setInteractive();
        
        // PHASER COMPLIANT: Use Phaser's input events
        bingoGridBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
            // Log scene transition
            if (this.game.sceneStateLogger) {
                this.game.sceneStateLogger.logSceneTransition('MainMenuScene', 'BingoGridScene', 'scene.start()');
            }
            this.scene.start('BingoGridScene');
        });

        // Rewards Button
        const rewardsBtn = this.add.dom(width / 2, height / 2 + 100, 'button',
            'background-color: #FF9800; border: 2px solid #e68900; color: white; font-size: 20px; font-weight: bold; width: 300px; height: 60px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;',
            '🏆 Rewards'
        );
        rewardsBtn.setInteractive();
        
        // PHASER COMPLIANT: Use Phaser's input events
        rewardsBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
            // Log scene transition
            if (this.game.sceneStateLogger) {
                this.game.sceneStateLogger.logSceneTransition('MainMenuScene', 'RewardsScene', 'scene.start()');
            }
            this.scene.start('RewardsScene');
        });

        // Add hover effects using Phaser input events
        [goalLibraryBtn, bingoGridBtn, rewardsBtn].forEach(btn => {
            btn.on(Phaser.Input.Events.POINTER_OVER, () => {
                btn.node.style.transform = 'scale(1.05)';
            });
            btn.on(Phaser.Input.Events.POINTER_OUT, () => {
                btn.node.style.transform = 'scale(1)';
            });
        });
    }

    createSaveIndicator(width, height) {
        // Save indicator in top right
        this.saveIndicator = this.add.text(width - 20, 20, 'Saved', {
            fontSize: '14px',
            fill: '#4CAF50'
        }).setOrigin(1, 0);

        // Update save indicator periodically
        this.time.addEvent({
            delay: 1000,
            callback: this.updateSaveIndicator,
            callbackScope: this,
            loop: true
        });
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
        // Listen for state changes
        this.game.events.on('goalsChanged', this.updateStateInfo, this);
        this.game.events.on('rewardsChanged', this.updateStateInfo, this);
        this.game.events.on('gameStateChanged', this.updateStateInfo, this);
        this.game.events.on('dataChanged', this.updateSaveIndicator, this);
        this.game.events.on('dataSaved', this.updateSaveIndicator, this);
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

    shutdown() {
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
