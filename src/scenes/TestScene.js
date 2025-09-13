// Test Scene - Simple scene for testing transitions
export default class TestScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'TestScene',
            plugins: ['TweenManager', 'InputPlugin', 'Clock'],
            data: {
                defaultData: 'value',
                sceneType: 'testing',
                hasAnimations: true,
                hasInput: true,
                isTestScene: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('TestScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    create() {
        console.log('TestScene: create() called');
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x00ff00);

        // Title
        this.add.text(width / 2, height / 2, 'Test Scene', {
            fontSize: '32px',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x000000);
        backBtn.setInteractive();
        this.add.text(width / 2, height / 2 + 100, 'Back to Main', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        backBtn.on('pointerdown', () => {
            console.log('TestScene: Transitioning back to MainMenuScene');
            this.scene.transition({
                target: 'MainMenuScene',
                duration: 1000,
                sleep: false,
                remove: false,
                allowInput: false
            });
        });

        // Auto-return after 3 seconds
        this.time.delayedCall(3000, () => {
            console.log('TestScene: Auto-returning to MainMenuScene');
            this.scene.transition({
                target: 'MainMenuScene',
                duration: 1000,
                sleep: false,
                remove: false,
                allowInput: false
            });
        });
    }

    shutdown() {
        // Clean up timers
        this.time.removeAllEvents();
        
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
