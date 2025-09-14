/**
 * Data Flow Tests
 * 
 * This test suite validates data flow between scenes using ApplicationStateManager
 * and ensures proper state management across the application.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Data Flow Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('ApplicationStateManager initialization', async ({ page }) => {
        // Test ApplicationStateManager initialization
        const appStateData = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.mainMenu);
        
        expect(appStateData.success).toBe(true);
        expect(appStateData.data.goalsCount).toBeGreaterThanOrEqual(0);
        expect(appStateData.data.categoriesCount).toBeGreaterThanOrEqual(0);
        expect(appStateData.data.gameStateExists).toBe(true);
    });

    test('Data persistence across scene transitions', async ({ page }) => {
        // Test data persistence across scene transitions
        const dataPersistence = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Get initial data
            const initialGoals = appStateManager.getGoals();
            const initialCategories = appStateManager.getCategories();
            const initialGameState = appStateManager.getGameState();
            
            // Transition to GoalLibraryScene
            window.game.scene.start(testConfig.scenes.goalLibrary);
            
            return {
                initialGoals: initialGoals ? initialGoals.length : 0,
                initialCategories: initialCategories ? initialCategories.length : 0,
                initialGameState: !!initialGameState
            };
        });
        
        // Wait for scene transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify data is still accessible
        const dataAfterTransition = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.goalLibrary);
        
        expect(dataAfterTransition.success).toBe(true);
        expect(dataAfterTransition.data.goalsCount).toBe(dataPersistence.initialGoals);
        expect(dataAfterTransition.data.categoriesCount).toBe(dataPersistence.initialCategories);
        expect(dataAfterTransition.data.gameStateExists).toBe(dataPersistence.initialGameState);
    });

    test('Goal data management', async ({ page }) => {
        // Test goal data management
        const goalData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Get initial goals
            const initialGoals = appStateManager.getGoals();
            
            // Add a test goal
            const testGoal = {
                id: 'test-goal-' + Date.now(),
                title: 'Test Goal',
                description: 'This is a test goal',
                category: 'Test',
                difficulty: 'Easy',
                points: 10,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            
            // Get goals after addition
            const goalsAfterAdd = appStateManager.getGoals();
            
            return {
                initialCount: initialGoals ? initialGoals.length : 0,
                afterAddCount: goalsAfterAdd ? goalsAfterAdd.length : 0,
                testGoalAdded: goalsAfterAdd ? goalsAfterAdd.some(goal => goal.id === testGoal.id) : false
            };
        });
        
        expect(goalData.afterAddCount).toBe(goalData.initialCount + 1);
        expect(goalData.testGoalAdded).toBe(true);
    });

    test('Category data management', async ({ page }) => {
        // Test category data management
        const categoryData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Get initial categories
            const initialCategories = appStateManager.getCategories();
            
            // Add a test category
            const testCategory = {
                id: 'test-category-' + Date.now(),
                name: 'Test Category',
                color: '#FF5733',
                description: 'This is a test category'
            };
            
            appStateManager.addCategory(testCategory);
            
            // Get categories after addition
            const categoriesAfterAdd = appStateManager.getCategories();
            
            return {
                initialCount: initialCategories ? initialCategories.length : 0,
                afterAddCount: categoriesAfterAdd ? categoriesAfterAdd.length : 0,
                testCategoryAdded: categoriesAfterAdd ? categoriesAfterAdd.some(cat => cat.id === testCategory.id) : false
            };
        });
        
        expect(categoryData.afterAddCount).toBe(categoryData.initialCount + 1);
        expect(categoryData.testCategoryAdded).toBe(true);
    });

    test('Game state updates', async ({ page }) => {
        // Test game state updates
        const gameStateData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Get initial game state
            const initialGameState = appStateManager.getGameState();
            
            // Update game state
            const updatedGameState = {
                ...initialGameState,
                currentLevel: 1,
                score: 100,
                lastPlayed: new Date().toISOString()
            };
            
            appStateManager.updateGameState(updatedGameState);
            
            // Get updated game state
            const finalGameState = appStateManager.getGameState();
            
            return {
                initialLevel: initialGameState ? initialGameState.currentLevel : 0,
                finalLevel: finalGameState ? finalGameState.currentLevel : 0,
                finalScore: finalGameState ? finalGameState.score : 0,
                lastPlayed: finalGameState ? finalGameState.lastPlayed : null
            };
        });
        
        expect(gameStateData.finalLevel).toBe(1);
        expect(gameStateData.finalScore).toBe(100);
        expect(gameStateData.lastPlayed).toBeDefined();
    });

    test('Data synchronization between scenes', async ({ page }) => {
        // Test data synchronization between scenes
        const syncData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Add data in MainMenuScene
            const testGoal = {
                id: 'sync-test-goal',
                title: 'Sync Test Goal',
                description: 'Testing data sync',
                category: 'Test',
                difficulty: 'Medium',
                points: 20,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            
            return {
                goalAdded: true
            };
        });
        
        // Transition to GoalLibraryScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        // Verify data is synchronized
        const syncVerification = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            const goals = appStateManager.getGoals();
            
            return {
                goalExists: goals ? goals.some(goal => goal.id === 'sync-test-goal') : false,
                goalCount: goals ? goals.length : 0
            };
        });
        
        expect(syncVerification.goalExists).toBe(true);
        expect(syncVerification.goalCount).toBeGreaterThan(0);
    });

    test('Event-driven data updates', async ({ page }) => {
        // Test event-driven data updates
        const eventData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            let eventFired = false;
            
            // Listen for data change events
            window.game.events.on('goalsChanged', () => {
                eventFired = true;
            });
            
            // Add a goal to trigger event
            const testGoal = {
                id: 'event-test-goal',
                title: 'Event Test Goal',
                description: 'Testing event-driven updates',
                category: 'Test',
                difficulty: 'Hard',
                points: 30,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            
            return {
                eventFired: eventFired
            };
        });
        
        expect(eventData.eventFired).toBe(true);
    });

    test('Data validation and error handling', async ({ page }) => {
        // Test data validation and error handling
        const validationData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            try {
                // Try to add invalid goal data
                appStateManager.addGoal(null);
                return { success: false, error: 'Should have failed' };
            } catch (error) {
                return { success: true, error: error.message };
            }
        });
        
        expect(validationData.success).toBe(true);
        expect(validationData.error).toBeDefined();
    });

    test('Data persistence across page reloads', async ({ page }) => {
        // Test data persistence across page reloads
        const initialData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Add test data
            const testGoal = {
                id: 'persistence-test-goal',
                title: 'Persistence Test Goal',
                description: 'Testing data persistence',
                category: 'Test',
                difficulty: 'Easy',
                points: 5,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            
            return {
                goalAdded: true
            };
        });
        
        // Reload the page
        await page.reload();
        
        // Wait for game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Verify data persisted
        const persistedData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            const goals = appStateManager.getGoals();
            
            return {
                goalExists: goals ? goals.some(goal => goal.id === 'persistence-test-goal') : false,
                goalCount: goals ? goals.length : 0
            };
        });
        
        expect(persistedData.goalExists).toBe(true);
        expect(persistedData.goalCount).toBeGreaterThan(0);
    });

    test('Data cleanup on scene shutdown', async ({ page }) => {
        // Test data cleanup on scene shutdown
        const cleanupData = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Get initial data
            const initialGoals = appStateManager.getGoals();
            const initialCategories = appStateManager.getCategories();
            
            // Transition to another scene
            window.game.scene.start(testConfig.scenes.goalLibrary);
            
            return {
                initialGoalsCount: initialGoals ? initialGoals.length : 0,
                initialCategoriesCount: initialCategories ? initialCategories.length : 0
            };
        });
        
        // Wait for transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify data is still accessible
        const dataAfterTransition = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.goalLibrary);
        
        expect(dataAfterTransition.success).toBe(true);
        expect(dataAfterTransition.data.goalsCount).toBe(cleanupData.initialGoalsCount);
        expect(dataAfterTransition.data.categoriesCount).toBe(cleanupData.initialCategoriesCount);
    });
});
