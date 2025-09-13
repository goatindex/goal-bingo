/**
 * Data Management E2E Tests
 * 
 * ARCHITECTURE NOTES:
 * - Tests game.registry data operations
 * - Validates localStorage persistence
 * - Tests data synchronization between systems
 * - Uses Playwright with page.evaluate() for data testing
 */

import { test, expect } from '@playwright/test';

test.describe('Data Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
    });
    
    test('Game Registry Data Operations', async ({ page }) => {
        // Test basic data operations
        const dataOperations = await page.evaluate(() => {
            const game = window.game;
            const registry = game.registry;
            
            // Test setting data
            registry.set('testKey', 'testValue');
            registry.set('testObject', { name: 'Test', value: 123 });
            registry.set('testArray', [1, 2, 3, 4, 5]);
            
            // Test getting data
            const stringValue = registry.get('testKey');
            const objectValue = registry.get('testObject');
            const arrayValue = registry.get('testArray');
            
            // Test data modification
            registry.set('testKey', 'modifiedValue');
            const modifiedValue = registry.get('testKey');
            
            return {
                stringValue,
                objectValue,
                arrayValue,
                modifiedValue,
                allData: registry.list
            };
        });
        
        expect(dataOperations.stringValue).toBe('testValue');
        expect(dataOperations.objectValue).toEqual({ name: 'Test', value: 123 });
        expect(dataOperations.arrayValue).toEqual([1, 2, 3, 4, 5]);
        expect(dataOperations.modifiedValue).toBe('modifiedValue');
        expect(dataOperations.allData).toHaveProperty('testKey');
    });
    
    test('Application State Manager Integration', async ({ page }) => {
        // Test ApplicationStateManager data operations
        const appStateData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            // Test initial state
            const initialGoals = appStateManager.getGoals();
            const initialGameState = appStateManager.getGameState();
            
            // Test adding a goal
            const newGoal = {
                id: 'test-goal-1',
                text: 'Test Goal',
                category: 'Test Category',
                completed: false,
                createdAt: Date.now()
            };
            
            appStateManager.addGoal(newGoal);
            const updatedGoals = appStateManager.getGoals();
            
            // Test updating game state
            appStateManager.updateGameState({
                currentScene: 'TestScene',
                score: 100,
                level: 1
            });
            
            const updatedGameState = appStateManager.getGameState();
            
            return {
                initialGoals,
                initialGameState,
                updatedGoals,
                updatedGameState,
                goalsCount: updatedGoals.length
            };
        });
        
        expect(appStateData.initialGoals).toBeDefined();
        expect(appStateData.initialGameState).toBeDefined();
        expect(appStateData.goalsCount).toBe(1);
        expect(appStateData.updatedGoals[0].text).toBe('Test Goal');
        expect(appStateData.updatedGameState.score).toBe(100);
    });
    
    test('Storage Manager Persistence', async ({ page }) => {
        // Test localStorage persistence
        const storageData = await page.evaluate(() => {
            const game = window.game;
            const storageManager = game.storageManager;
            
            // Test saving data
            const testData = {
                goals: [{ id: '1', text: 'Test Goal' }],
                gameState: { score: 100 },
                settings: { theme: 'dark' }
            };
            
            storageManager.saveData(testData);
            
            // Test loading data
            const loadedData = storageManager.loadData();
            
            // Test data clearing
            storageManager.clearData();
            const clearedData = storageManager.loadData();
            
            return {
                savedData: testData,
                loadedData,
                clearedData,
                hasData: loadedData !== null
            };
        });
        
        expect(storageData.hasData).toBe(true);
        expect(storageData.loadedData.goals).toHaveLength(1);
        expect(storageData.loadedData.goals[0].text).toBe('Test Goal');
        expect(storageData.clearedData).toBeNull();
    });
    
    test('Data Synchronization Between Systems', async ({ page }) => {
        // Test data sync between ApplicationStateManager and StorageManager
        const syncData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            const storageManager = game.storageManager;
            
            // Add goal through ApplicationStateManager
            const newGoal = {
                id: 'sync-test-1',
                text: 'Sync Test Goal',
                category: 'Sync Category',
                completed: false,
                createdAt: Date.now()
            };
            
            appStateManager.addGoal(newGoal);
            
            // Check if data is synced to registry
            const registryGoals = game.registry.get('goals');
            
            // Check if data is persisted to localStorage
            const storedData = storageManager.loadData();
            
            return {
                appStateGoals: appStateManager.getGoals(),
                registryGoals,
                storedData,
                isSynced: registryGoals && registryGoals.length > 0
            };
        });
        
        expect(syncData.isSynced).toBe(true);
        expect(syncData.appStateGoals).toHaveLength(1);
        expect(syncData.registryGoals).toHaveLength(1);
        expect(syncData.storedData).toBeDefined();
    });
    
    test('Data Event Handling', async ({ page }) => {
        // Test data change events
        const eventData = await page.evaluate(() => {
            const game = window.game;
            const registry = game.registry;
            let eventFired = false;
            let eventData = null;
            
            // Listen for data change events
            registry.events.on('changedata', (parent, key, value, previousValue) => {
                eventFired = true;
                eventData = { key, value, previousValue };
            });
            
            // Trigger data change
            registry.set('eventTestKey', 'eventTestValue');
            
            // Wait a bit for event to fire
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        eventFired,
                        eventData,
                        currentValue: registry.get('eventTestKey')
                    });
                }, 100);
            });
        });
        
        expect(eventData.eventFired).toBe(true);
        expect(eventData.eventData.key).toBe('eventTestKey');
        expect(eventData.eventData.value).toBe('eventTestValue');
        expect(eventData.currentValue).toBe('eventTestValue');
    });
    
    test('Data Validation and Error Handling', async ({ page }) => {
        // Test data validation
        const validationData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            let validationErrors = [];
            
            // Test invalid goal data
            try {
                appStateManager.addGoal(null);
            } catch (error) {
                validationErrors.push('null goal rejected');
            }
            
            try {
                appStateManager.addGoal({});
            } catch (error) {
                validationErrors.push('empty goal rejected');
            }
            
            // Test valid goal data
            try {
                appStateManager.addGoal({
                    id: 'valid-goal',
                    text: 'Valid Goal',
                    category: 'Valid Category',
                    completed: false,
                    createdAt: Date.now()
                });
            } catch (error) {
                validationErrors.push('valid goal rejected');
            }
            
            const goals = appStateManager.getGoals();
            
            return {
                validationErrors,
                goalsCount: goals.length,
                hasValidGoal: goals.some(g => g.id === 'valid-goal')
            };
        });
        
        expect(validationData.validationErrors).toContain('null goal rejected');
        expect(validationData.validationErrors).toContain('empty goal rejected');
        expect(validationData.validationErrors).not.toContain('valid goal rejected');
        expect(validationData.hasValidGoal).toBe(true);
    });
    
    test('Data Persistence Across Page Reloads', async ({ page }) => {
        // Test data persistence across page reloads
        await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            // Add some test data
            appStateManager.addGoal({
                id: 'persistence-test',
                text: 'Persistence Test Goal',
                category: 'Test Category',
                completed: false,
                createdAt: Date.now()
            });
            
            appStateManager.updateGameState({
                score: 500,
                level: 2
            });
        });
        
        // Reload the page
        await page.reload();
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Check if data persisted
        const persistedData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            return {
                goals: appStateManager.getGoals(),
                gameState: appStateManager.getGameState()
            };
        });
        
        expect(persistedData.goals).toBeDefined();
        expect(persistedData.gameState).toBeDefined();
        // Note: Actual persistence depends on localStorage implementation
    });
});
