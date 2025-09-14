/**
 * AudioManager - Centralized audio management using Phaser's native audio system
 * 
 * ARCHITECTURE NOTES:
 * - Uses Phaser's built-in this.sound.* methods (100% native)
 * - Centralized audio management for consistent behavior
 * - Simple audio loading and playback patterns
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * KEY DEPENDENCIES:
 * - this.sound: Phaser's built-in audio manager
 * - this.load: Phaser's built-in asset loader
 * - game.registry: For audio settings persistence
 */
export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.game = scene.game;
        
        // Audio settings
        this.masterVolume = 0.8;
        this.soundEffectsVolume = 0.6;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.4;
        
        // Audio state
        this.isMuted = false;
        this.isMusicEnabled = true;
        this.isSfxEnabled = true;
        
        // Audio instances (will be created after loading)
        this.audioInstances = {};
        
        console.log('AudioManager: Initialized for scene:', scene.scene.key);
    }

    /**
     * Create audio instances from loaded assets
     * ============================================================================
     * PHASER SOUND EFFECTS: Create audio instances from loaded files
     * ============================================================================
     * PHASER PATTERN: Use this.scene.sound.add() to create audio instances from loaded files
     * - Audio files should be loaded in PreloadScene using this.load.audio()
     * - This method creates audio instances from already-loaded files
     * - Phaser handles audio playback automatically
     * - Perfect for basic sound effects and simple audio needs
     */
    createAudioInstances() {
        console.log('AudioManager: Creating audio instances from loaded assets...');
        
        // Create audio instances from loaded files
        // Note: These will only work if the audio files were loaded in PreloadScene
        try {
            this.audioInstances.buttonClick = this.scene.sound.add('buttonClick');
            this.audioInstances.buttonHover = this.scene.sound.add('buttonHover');
            this.audioInstances.modalOpen = this.scene.sound.add('modalOpen');
            this.audioInstances.modalClose = this.scene.sound.add('modalClose');
            this.audioInstances.goalComplete = this.scene.sound.add('goalComplete');
            this.audioInstances.bingoWin = this.scene.sound.add('bingoWin');
            this.audioInstances.newGame = this.scene.sound.add('newGame');
            this.audioInstances.gridRepopulate = this.scene.sound.add('gridRepopulate');
            this.audioInstances.backgroundMusic = this.scene.sound.add('backgroundMusic');
            
            console.log('AudioManager: Audio instances created successfully');
        } catch (error) {
            console.warn('AudioManager: Failed to create audio instances:', error);
            console.log('AudioManager: Creating silent fallback audio instances');
            
            // Create silent fallback audio instances
            this.createSilentAudioInstances();
        }
    }

    /**
     * Create silent fallback audio instances
     * PHASER PATTERN: Create silent audio instances when files are not loaded
     * - This prevents errors when audio files are not available
     * - Provides graceful degradation for audio functionality
     * - Perfect for development and fallback scenarios
     */
    createSilentAudioInstances() {
        console.log('AudioManager: Creating silent fallback audio instances...');
        
        // Create silent audio instances using Phaser's built-in silent audio
        // These will play silently but won't throw errors
        this.audioInstances.buttonClick = this.scene.sound.add('__silent');
        this.audioInstances.buttonHover = this.scene.sound.add('__silent');
        this.audioInstances.modalOpen = this.scene.sound.add('__silent');
        this.audioInstances.modalClose = this.scene.sound.add('__silent');
        this.audioInstances.goalComplete = this.scene.sound.add('__silent');
        this.audioInstances.bingoWin = this.scene.sound.add('__silent');
        this.audioInstances.newGame = this.scene.sound.add('__silent');
        this.audioInstances.gridRepopulate = this.scene.sound.add('__silent');
        this.audioInstances.backgroundMusic = this.scene.sound.add('__silent');
        
        console.log('AudioManager: Silent fallback audio instances created');
    }

    /**
     * Initialize audio system after assets are loaded
     * ============================================================================
     * PHASER SIMPLIFIED AUDIO SETUP: Configure basic audio system
     * ============================================================================
     * PHASER PATTERN: Use basic audio configuration for simple use cases
     * - this.sound.setMasterVolume() sets global volume
     * - Basic audio setup without advanced features
     * - This approach is simpler and more maintainable
     * - Perfect for basic sound effects and simple audio needs
     */
    initializeAudio() {
        console.log('AudioManager: Initializing audio system...');
        
        // Set global volume
        this.scene.sound.setVolume(this.masterVolume);
        
        // Load audio settings from registry
        this.loadAudioSettings();
        
        // Create audio instances for better control
        this.createAudioInstances();
        
        // Start background music if enabled
        if (this.isMusicEnabled && !this.isMuted) {
            this.playBackgroundMusic();
        }
        
        console.log('AudioManager: Audio system initialized');
    }

    /**
     * Create audio instances for better control
     * ============================================================================
     * PHASER AUDIO INSTANCES: Create reusable audio instances
     * ============================================================================
     * PHASER PATTERN: Create audio instances for consistent behavior
     * - Use this.sound.add() to create reusable audio instances
     * - This allows for better volume control and event handling
     * - More efficient than creating new instances each time
     */
    createAudioInstances() {
        // Button and UI sounds
        this.audioInstances.buttonClick = this.scene.sound.add('buttonClick', { volume: this.sfxVolume });
        this.audioInstances.buttonHover = this.scene.sound.add('buttonHover', { volume: this.sfxVolume });
        this.audioInstances.modalOpen = this.scene.sound.add('modalOpen', { volume: this.soundEffectsVolume });
        this.audioInstances.modalClose = this.scene.sound.add('modalClose', { volume: this.soundEffectsVolume });
        
        // Game event sounds
        this.audioInstances.goalComplete = this.scene.sound.add('goalComplete', { volume: this.soundEffectsVolume });
        this.audioInstances.bingoWin = this.scene.sound.add('bingoWin', { volume: this.soundEffectsVolume });
        this.audioInstances.newGame = this.scene.sound.add('newGame', { volume: this.soundEffectsVolume });
        this.audioInstances.gridRepopulate = this.scene.sound.add('gridRepopulate', { volume: this.soundEffectsVolume });
        
        // Background music
        this.audioInstances.backgroundMusic = this.scene.sound.add('backgroundMusic', { 
            volume: this.musicVolume,
            loop: true
        });
        
        console.log('AudioManager: Audio instances created');
    }

    /**
     * Play button click sound
     * ============================================================================
     * PHASER BUTTON AUDIO: Use Phaser's audio system for button feedback
     * ============================================================================
     * PHASER PATTERN: Use this.sound.play() for immediate audio feedback
     * - Phaser handles audio instance management automatically
     * - Can use spatial audio for immersive button feedback
     * - Use audio events for advanced audio handling
     */
    playButtonClick() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.buttonClick.play({
                volume: this.sfxVolume,
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play button click sound:', error);
        }
    }

    /**
     * Play button hover sound
     */
    playButtonHover() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.buttonHover.play({
                volume: this.sfxVolume * 0.5, // Quieter for hover
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play button hover sound:', error);
        }
    }

    /**
     * Play modal open sound
     */
    playModalOpen() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.modalOpen.play({
                volume: this.soundEffectsVolume,
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play modal open sound:', error);
        }
    }

    /**
     * Play modal close sound
     */
    playModalClose() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.modalClose.play({
                volume: this.soundEffectsVolume,
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play modal close sound:', error);
        }
    }

    /**
     * Play goal completion sound
     * ============================================================================
     * PHASER GOAL AUDIO: Use Phaser's audio system for goal feedback
     * ============================================================================
     * PHASER PATTERN: Use this.sound.play() for goal completion feedback
     * - Use appropriate volume for achievement feedback
     * - Can use spatial audio for immersive effects
     * - Use audio events for advanced audio handling
     */
    playGoalComplete() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.goalComplete.play({
                volume: this.soundEffectsVolume,
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play goal complete sound:', error);
        }
    }

    /**
     * Play bingo win sound
     * ============================================================================
     * PHASER WIN AUDIO: Use Phaser's audio system for win feedback
     * ============================================================================
     * PHASER PATTERN: Use this.sound.play() for win audio feedback
     * - Use higher volume for important audio feedback
     * - Can use spatial audio for immersive win effects
     * - Use audio events for advanced audio handling
     */
    playBingoWin() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.bingoWin.play({
                volume: this.soundEffectsVolume * 1.2, // Louder for win
                rate: 1.0,
                detune: 0
            });
            
            // ============================================================================
            // PHASER AUDIO EVENTS: Use Phaser's audio event system for win effects
            // ============================================================================
            // PHASER PATTERN: Use audio events for advanced audio handling
            // - on('complete') fires when sound finishes playing
            // - Can trigger additional effects or animations
            // - This enables complex audio sequences
            
            this.audioInstances.bingoWin.on('complete', () => {
                console.log('AudioManager: Bingo win sound finished');
                // Can trigger additional effects here
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play bingo win sound:', error);
        }
    }

    /**
     * Play new game sound
     */
    playNewGame() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.newGame.play({
                volume: this.soundEffectsVolume,
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play new game sound:', error);
        }
    }

    /**
     * Play grid repopulate sound
     */
    playGridRepopulate() {
        if (!this.isSfxEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.gridRepopulate.play({
                volume: this.soundEffectsVolume,
                rate: 1.0,
                detune: 0
            });
        } catch (error) {
            console.warn('AudioManager: Failed to play grid repopulate sound:', error);
        }
    }

    /**
     * Play background music
     * ============================================================================
     * PHASER BACKGROUND MUSIC: Use Phaser's audio system for background music
     * ============================================================================
     * PHASER PATTERN: Use this.sound.play() for background music
     * - Use lower volume for background music
     * - Set loop: true for continuous playback
     * - Can use audio events for music management
     */
    playBackgroundMusic() {
        if (!this.isMusicEnabled || this.isMuted) return;
        
        try {
            this.audioInstances.backgroundMusic.play({
                volume: this.musicVolume,
                loop: true
            });
            console.log('AudioManager: Background music started');
        } catch (error) {
            console.warn('AudioManager: Failed to play background music:', error);
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        try {
            this.audioInstances.backgroundMusic.stop();
            console.log('AudioManager: Background music stopped');
        } catch (error) {
            console.warn('AudioManager: Failed to stop background music:', error);
        }
    }

    /**
     * Toggle mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.scene.sound.setVolume(0);
            this.stopBackgroundMusic();
        } else {
            this.scene.sound.setVolume(this.masterVolume);
            if (this.isMusicEnabled) {
                this.playBackgroundMusic();
            }
        }
        
        this.saveAudioSettings();
        console.log('AudioManager: Mute toggled:', this.isMuted);
    }

    /**
     * Toggle music
     */
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        
        if (this.isMusicEnabled && !this.isMuted) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        this.saveAudioSettings();
        console.log('AudioManager: Music toggled:', this.isMusicEnabled);
    }

    /**
     * Toggle sound effects
     */
    toggleSfx() {
        this.isSfxEnabled = !this.isSfxEnabled;
        this.saveAudioSettings();
        console.log('AudioManager: SFX toggled:', this.isSfxEnabled);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.scene.sound.setVolume(this.masterVolume);
        this.saveAudioSettings();
        console.log('AudioManager: Master volume set to:', this.masterVolume);
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.audioInstances.backgroundMusic) {
            this.audioInstances.backgroundMusic.setVolume(this.musicVolume);
        }
        this.saveAudioSettings();
        console.log('AudioManager: Music volume set to:', this.musicVolume);
    }

    /**
     * Set SFX volume
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.soundEffectsVolume = this.sfxVolume * 1.5; // SFX slightly louder
        this.saveAudioSettings();
        console.log('AudioManager: SFX volume set to:', this.sfxVolume);
    }

    /**
     * Load audio settings from registry
     * ============================================================================
     * PHASER AUDIO PERSISTENCE: Use Phaser's registry for audio settings
     * ============================================================================
     * PHASER PATTERN: Use Phaser's registry for data persistence
     * - this.game.registry.get() retrieves data from Phaser's built-in data manager
     * - Phaser handles data persistence automatically across scenes
     * - This approach is simpler and more maintainable than custom persistence
     */
    loadAudioSettings() {
        try {
            const audioSettings = this.game.registry.get('audioSettings') || {};
            
            this.masterVolume = audioSettings.masterVolume || 0.8;
            this.musicVolume = audioSettings.musicVolume || 0.3;
            this.sfxVolume = audioSettings.sfxVolume || 0.4;
            this.isMuted = audioSettings.isMuted || false;
            this.isMusicEnabled = audioSettings.isMusicEnabled || true;
            this.isSfxEnabled = audioSettings.isSfxEnabled || true;
            
            console.log('AudioManager: Audio settings loaded from registry');
        } catch (error) {
            console.warn('AudioManager: Failed to load audio settings:', error);
        }
    }

    /**
     * Save audio settings to registry
     * ============================================================================
     * PHASER AUDIO PERSISTENCE: Use Phaser's registry for audio settings
     * ============================================================================
     * PHASER PATTERN: Use Phaser's registry for data persistence
     * - this.game.registry.set() saves data to Phaser's built-in data manager
     * - Phaser handles data persistence automatically across scenes
     * - This approach is simpler and more maintainable than custom persistence
     */
    saveAudioSettings() {
        try {
            const audioSettings = {
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume,
                isMuted: this.isMuted,
                isMusicEnabled: this.isMusicEnabled,
                isSfxEnabled: this.isSfxEnabled
            };
            
            this.game.registry.set('audioSettings', audioSettings);
            console.log('AudioManager: Audio settings saved to registry');
        } catch (error) {
            console.warn('AudioManager: Failed to save audio settings:', error);
        }
    }

    /**
     * Clean up audio resources
     * ============================================================================
     * PHASER AUDIO CLEANUP: Proper audio cleanup on scene shutdown
     * ============================================================================
     * PHASER PATTERN: Clean up audio instances on scene shutdown
     * - Use this.sound.removeAll() to remove all audio instances
     * - Use this.sound.stopAll() to stop all playing sounds
     * - This prevents memory leaks and audio conflicts
     */
    cleanup() {
        console.log('AudioManager: Cleaning up audio resources...');
        
        try {
            // Stop all playing sounds
            this.scene.sound.stopAll();
            
            // Remove all audio instances
            this.scene.sound.removeAll();
            
            // Clear audio instances reference
            this.audioInstances = {};
            
            console.log('AudioManager: Audio cleanup complete');
        } catch (error) {
            console.warn('AudioManager: Failed to cleanup audio resources:', error);
        }
    }
}
