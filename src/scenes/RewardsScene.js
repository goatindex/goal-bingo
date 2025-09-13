// Rewards Scene - Manage rewards and achievements
export default class RewardsScene extends Phaser.Scene {
    constructor() {
        super({ 
            key: 'RewardsScene',
            plugins: ['TweenManager', 'InputPlugin'],
            data: {
                defaultData: 'value',
                sceneType: 'rewards',
                hasAnimations: true,
                hasInput: true
            }
        });
    }

    init(data) {
        // Initialize scene with data
        console.log('RewardsScene: init() called with data:', data);
        // Set up scene properties, validate data, etc.
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0xf8f9fa);

        // Header
        this.add.text(width / 2, 50, '🏆 Rewards', {
            fontSize: '32px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Back button
        const backBtn = this.add.rectangle(100, 50, 120, 40, 0x6c757d);
        backBtn.setInteractive();
        this.add.text(100, 50, '← Back', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });

        // Placeholder content
        this.add.text(width / 2, height / 2, 'Rewards - Coming Soon!', {
            fontSize: '24px',
            fill: '#666666'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 + 40, 'This will contain your reward management interface', {
            fontSize: '16px',
            fill: '#999999'
        }).setOrigin(0.5);
    }

    shutdown() {
        // Fallback cleanup
        this.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
    }
}
