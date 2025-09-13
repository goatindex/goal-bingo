/**
 * StorageManager - Handles data persistence with Phaser Data Manager integration
 * Integrates with Phaser's event system for automatic saving
 * 
 * ARCHITECTURE NOTES:
 * - Uses game.registry for data access (Phaser native)
 * - Uses game.registry.events for change detection (Phaser native)
 * - Uses ApplicationStateManager for domain logic
 * - No custom plugins - 100% native Phaser capabilities
 * 
 * KEY DEPENDENCIES:
 * - game.registry: Phaser's built-in data management system
 * - game.registry.events: Phaser's built-in data change events
 * - appStateManager: ApplicationStateManager instance for domain logic
 */
import { ApplicationState } from './models/ApplicationState.js';

export class StorageManager {
    constructor(game, appStateManager, logger = null) {
        this.game = game;
        this.appStateManager = appStateManager;
        this.logger = logger;
        this.storageKey = 'goal-bingo-data';
        this.backupKey = 'goal-bingo-backup';
        this.autosaveInterval = 30000; // 30 seconds
        this.lastSaveTime = null;
        this.isDirty = false;
        this.autosaveTimer = null;
        this.saveInProgress = false;
        this.isInitialized = false;
        
        if (this.logger) {
            this.logger.info('StorageManager created', { hasLogger: !!this.logger }, 'StorageManager');
        }
    }

    // Initialize the storage manager
    async initialize() {
        if (this.logger) {
            this.logger.info('Initializing StorageManager...', null, 'StorageManager');
        }
        
        try {
            // Load data from storage or use defaults
            const loadedData = this.loadAllData();
            
            // Set the loaded data in the state manager (simplified approach)
            // We'll use direct property access instead of Phaser's data manager for now
            if (this.logger) {
                this.logger.info('Data loaded and ready', { 
                    hasLoadedData: !!loadedData,
                    dataSize: loadedData ? JSON.stringify(loadedData).length : 0
                }, 'StorageManager');
            }
            
            // Set up event listeners for Phaser data changes
            this.setupEventListeners();
            
            // Start autosave if enabled
            if (loadedData.settings?.autosaveEnabled) {
                this.startAutosave();
                if (this.logger) {
                    this.logger.info('Autosave started', { interval: this.autosaveInterval }, 'StorageManager');
                }
            }
            
            this.isInitialized = true;
            if (this.logger) {
                this.logger.info('StorageManager initialized successfully', { 
                    isInitialized: this.isInitialized,
                    autosaveEnabled: loadedData.settings?.autosaveEnabled || false
                }, 'StorageManager');
            }
        } catch (error) {
            if (this.logger) {
                this.logger.error('Failed to initialize StorageManager', { error: error.message }, 'StorageManager');
            }
            throw error;
        }
    }

    // Set up event listeners for Phaser data changes
    setupEventListeners() {
        // Listen for Phaser data events from game.registry
        this.game.registry.events.on(Phaser.Data.Events.SET_DATA, (parent, key, data) => {
            this.handleDataChange(parent, key, data, null);
        });

        this.game.registry.events.on(Phaser.Data.Events.CHANGE_DATA, (parent, key, data, previousData) => {
            this.handleDataChange(parent, key, data, previousData);
        });

        this.game.registry.events.on(Phaser.Data.Events.REMOVE_DATA, (parent, key, data) => {
            this.handleDataChange(parent, key, null, data);
        });
        
        // Listen for page visibility changes for autosave
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isDirty) {
                this.performAutosave();
            }
        });
        
        // Listen for beforeunload for final save
        window.addEventListener('beforeunload', () => {
            if (this.isDirty) {
                this.performAutosave();
            }
        });

        console.log('StorageManager: Phaser data event listeners setup');
    }

    // Handle data changes from Phaser's Data Manager
    handleDataChange(parent, key, value, previousValue) {
        // Mark dirty for any meaningful data changes
        if (['appState', 'goals', 'rewards', 'categories', 'gameState', 'settings', 'metadata'].includes(key)) {
            this.markDirty();
            console.log(`StorageManager: Data changed - ${key}, marking as dirty`);
        }
    }

    // Initialize with default data if none exists
    loadAllData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                if (this.validateData(data)) {
                    this.lastSaveTime = data.lastModified;
                    return data;
                } else {
                    console.warn('Data validation failed, attempting recovery...');
                    return this.recoverData();
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            return this.recoverData();
        }
        
        // Return default application state if no saved data
        return this.getDefaultApplicationState();
    }

    // Save complete application state
    saveAllData(appState = null) {
        if (this.saveInProgress) {
            console.log('Save already in progress, skipping...');
            return;
        }

        this.saveInProgress = true;
        
        try {
            // Get current app state from app state manager if not provided
            const currentAppState = appState || this.appStateManager.getApplicationState();
            
            // Update metadata
            currentAppState.lastModified = new Date();
            currentAppState.metadata.totalPlayTime = this.calculateTotalPlayTime(currentAppState);
            
            // Create backup before saving
            if (currentAppState.settings.backupEnabled) {
                this.createBackup(currentAppState);
            }
            
            // Save to localStorage
            const dataString = JSON.stringify(currentAppState);
            localStorage.setItem(this.storageKey, dataString);
            
            this.lastSaveTime = currentAppState.lastModified;
            this.isDirty = false;
            
            console.log('Data saved successfully at', this.lastSaveTime);
            
            // Emit save event for UI updates
            this.game.events.emit('dataSaved', this.lastSaveTime);
            
        } catch (error) {
            console.error('Error saving data:', error);
            this.showSaveError();
        } finally {
            this.saveInProgress = false;
        }
    }

    // Perform autosave (called by timer or events)
    performAutosave() {
        if (this.isDirty && !this.saveInProgress) {
            console.log('Performing autosave...');
            this.saveAllData();
        }
    }

    // Start automatic saving
    startAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
        }
        
        this.autosaveTimer = setInterval(() => {
            this.performAutosave();
        }, this.autosaveInterval);
        
        console.log('Autosave started with', this.autosaveInterval / 1000, 'second intervals');
    }

    // Stop automatic saving
    stopAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
            this.autosaveTimer = null;
        }
        console.log('Autosave stopped');
    }

    // Mark data as changed
    markDirty() {
        this.isDirty = true;
        this.updateSaveIndicator('unsaved');
    }

    // Validate loaded data integrity
    validateData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check required properties
        const requiredProps = ['version', 'gameState', 'goalLibrary', 'rewards', 'categories', 'settings'];
        for (const prop of requiredProps) {
            if (!(prop in data)) {
                console.warn(`Missing required property: ${prop}`);
                return false;
            }
        }

        // Validate game state
        if (!this.validateGameState(data.gameState)) {
            return false;
        }

        // Validate arrays
        if (!Array.isArray(data.goalLibrary) || !Array.isArray(data.rewards) || !Array.isArray(data.categories)) {
            return false;
        }

        return true;
    }

    // Validate game state structure
    validateGameState(gameState) {
        const requiredProps = ['gridSize', 'currentGrid', 'activeGoals', 'totalWins'];
        return requiredProps.every(prop => prop in gameState);
    }

    // Attempt data recovery
    recoverData() {
        console.log('Attempting data recovery...');
        
        // Try to load from backup
        try {
            const backupData = localStorage.getItem(this.backupKey);
            if (backupData) {
                const data = JSON.parse(backupData);
                if (this.validateData(data)) {
                    console.log('Recovered data from backup');
                    return data;
                }
            }
        } catch (error) {
            console.error('Backup recovery failed:', error);
        }
        
        // Return default state if recovery fails
        console.log('Using default application state');
        return this.getDefaultApplicationState();
    }

    // Create backup of current data
    createBackup(appState) {
        try {
            const backupData = {
                ...appState,
                lastBackup: new Date(),
                isBackup: true
            };
            localStorage.setItem(this.backupKey, JSON.stringify(backupData));
            console.log('Backup created successfully');
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    // Export data for manual backup
    exportData(appState) {
        const exportData = {
            ...appState,
            exportDate: new Date(),
            exportVersion: '1.0.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `goal-bingo-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('Data exported successfully');
    }

    // Import data from file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (this.validateData(data)) {
                        this.saveAllData(data);
                        resolve(data);
                    } else {
                        reject(new Error('Invalid data format'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse file'));
                }
            };
            reader.readAsText(file);
        });
    }

    // Get default application state
    getDefaultApplicationState() {
        return new ApplicationState();
    }

    // Calculate total play time
    calculateTotalPlayTime(appState) {
        // This would calculate total time spent in the app
        // For now, return a placeholder
        return appState.metadata.totalPlayTime || 0;
    }

    // Generate unique session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Update save indicator in UI
    updateSaveIndicator(status = 'saved') {
        const indicator = document.getElementById('save-indicator');
        if (indicator) {
            indicator.className = `save-indicator ${status}`;
            switch (status) {
                case 'saving':
                    indicator.textContent = 'Saving...';
                    break;
                case 'unsaved':
                    indicator.textContent = 'Unsaved changes';
                    break;
                case 'saved':
                    indicator.textContent = `Saved ${this.lastSaveTime ? this.formatTime(this.lastSaveTime) : 'never'}`;
                    break;
                case 'error':
                    indicator.textContent = 'Save failed';
                    break;
            }
        }
    }

    // Format time for display
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    }

    // Show save error notification
    showSaveError() {
        this.updateSaveIndicator('error');
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'save-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>Save Failed</h4>
                <p>Your data could not be saved. Please check your browser storage.</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Clear all data (for testing/reset)
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.backupKey);
        console.log('All data cleared');
    }

    /**
     * ARCHITECTURE NOTE: StorageManager Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * Ensures all storage operations are stopped and resources cleaned up
     */
    async destroy() {
        console.log('StorageManager: Starting cleanup...');
        
        try {
            // CLEANUP: Stop autosave
            this.stopAutosave();
            
            // CLEANUP: Clear timers
            if (this.autosaveTimer) {
                clearInterval(this.autosaveTimer);
                this.autosaveTimer = null;
            }
            
            // CLEANUP: Reset state flags
            this.isInitialized = false;
            this.isDirty = false;
            
            // CLEANUP: Clear data references
            this.data = null;
            
            // LOGGING: Track cleanup completion
            console.log('StorageManager: Cleanup completed successfully');
            
        } catch (error) {
            console.error('StorageManager: Error during cleanup:', error);
            throw error;
        }
    }
}
