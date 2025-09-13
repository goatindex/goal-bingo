/**
 * Game Flow Integration Tests
 * 
 * ARCHITECTURE NOTES:
 * - Hybrid Playwright + WebGL testing approach
 * - Tests complete user journeys with visual validation
 * - Combines UI interactions with WebGL rendering checks
 * - Validates end-to-end game functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Game Flow Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
    });
    
    test('Complete Goal Creation and Management Flow', async ({ page }) => {
        // Step 1: Navigate to Goal Library
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.click();
        
        // Wait for scene transition
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'GoalLibraryScene'
        );
        
        // Step 2: Capture visual state after navigation
        const goalLibraryCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Step 3: Test goal creation through game state
        const goalCreation = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            // Create a new goal
            const newGoal = {
                id: 'integration-test-goal',
                text: 'Complete Integration Test',
                category: 'Testing',
                completed: false,
                createdAt: Date.now()
            };
            
            appStateManager.addGoal(newGoal);
            
            // Check if goal was added
            const goals = appStateManager.getGoals();
            const addedGoal = goals.find(g => g.id === 'integration-test-goal');
            
            return {
                goalAdded: !!addedGoal,
                goalsCount: goals.length,
                goalText: addedGoal?.text
            };
        });
        
        expect(goalCreation.goalAdded).toBe(true);
        expect(goalCreation.goalText).toBe('Complete Integration Test');
        
        // Step 4: Navigate to Bingo Grid
        const bingoGridBtn = page.locator('text=🎲 Play Bingo');
        await bingoGridBtn.click();
        
        // Wait for scene transition
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'BingoGridScene'
        );
        
        // Step 5: Capture visual state after bingo grid navigation
        const bingoGridCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Step 6: Test bingo grid functionality
        const bingoGridData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            // Check if goals are available in bingo grid
            const goals = appStateManager.getGoals();
            const gameState = appStateManager.getGameState();
            
            return {
                goalsAvailable: goals.length > 0,
                gameStateInitialized: !!gameState,
                currentScene: game.scene.getActiveScene()?.scene?.key
            };
        });
        
        expect(bingoGridData.goalsAvailable).toBe(true);
        expect(bingoGridData.gameStateInitialized).toBe(true);
        expect(bingoGridData.currentScene).toBe('BingoGridScene');
        
        // Step 7: Verify visual changes occurred
        expect(goalLibraryCanvas).not.toBe(bingoGridCanvas);
    });
    
    test('Data Persistence Across Scene Transitions', async ({ page }) => {
        // Step 1: Add data in one scene
        const initialData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            // Add test data
            appStateManager.addGoal({
                id: 'persistence-test',
                text: 'Persistence Test Goal',
                category: 'Test',
                completed: false,
                createdAt: Date.now()
            });
            
            appStateManager.updateGameState({
                score: 100,
                level: 1,
                testData: 'persistent'
            });
            
            return {
                goalsCount: appStateManager.getGoals().length,
                gameState: appStateManager.getGameState()
            };
        });
        
        // Step 2: Navigate through multiple scenes
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.click();
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'GoalLibraryScene'
        );
        
        const bingoGridBtn = page.locator('text=🎲 Play Bingo');
        await bingoGridBtn.click();
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'BingoGridScene'
        );
        
        const rewardsBtn = page.locator('text=🏆 Rewards');
        await rewardsBtn.click();
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'RewardsScene'
        );
        
        // Step 3: Verify data persisted across transitions
        const persistedData = await page.evaluate(() => {
            const game = window.game;
            const appStateManager = game.appStateManager;
            
            return {
                goalsCount: appStateManager.getGoals().length,
                gameState: appStateManager.getGameState(),
                registryData: game.registry.get('goals')
            };
        });
        
        expect(persistedData.goalsCount).toBe(initialData.goalsCount);
        expect(persistedData.gameState.score).toBe(100);
        expect(persistedData.gameState.testData).toBe('persistent');
        expect(persistedData.registryData).toBeDefined();
    });
    
    test('Visual Feedback for User Interactions', async ({ page }) => {
        // Step 1: Capture initial visual state
        const initialCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Step 2: Perform user interaction
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.hover();
        
        // Step 3: Capture hover state
        const hoverCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Step 4: Click button
        await goalLibraryBtn.click();
        
        // Step 5: Capture clicked state
        const clickedCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Step 6: Verify visual changes occurred
        expect(initialCanvas).not.toBe(hoverCanvas);
        expect(hoverCanvas).not.toBe(clickedCanvas);
        
        // Step 7: Verify scene transition occurred
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('GoalLibraryScene');
    });
    
    test('Performance During Complex Interactions', async ({ page }) => {
        // Step 1: Start performance monitoring
        const startPerformance = await page.evaluate(() => {
            const game = window.game;
            return {
                startTime: Date.now(),
                startFps: game.loop.actualFps,
                startDrawCalls: game.renderer.drawCalls
            };
        });
        
        // Step 2: Perform complex interactions
        const interactions = [
            () => page.locator('text=📚 Goal Library').click(),
            () => page.locator('text=🎲 Play Bingo').click(),
            () => page.locator('text=🏆 Rewards').click(),
            () => page.goBack(),
            () => page.goBack(),
            () => page.goBack()
        ];
        
        for (const interaction of interactions) {
            await interaction();
            await page.waitForTimeout(500); // Wait for scene transitions
        }
        
        // Step 3: Check performance metrics
        const endPerformance = await page.evaluate(() => {
            const game = window.game;
            return {
                endTime: Date.now(),
                endFps: game.loop.actualFps,
                endDrawCalls: game.renderer.drawCalls,
                isRunning: game.isRunning
            };
        });
        
        // Step 4: Verify performance is acceptable
        const duration = endPerformance.endTime - startPerformance.startTime;
        const avgFps = (startPerformance.startFps + endPerformance.endFps) / 2;
        
        expect(endPerformance.isRunning).toBe(true);
        expect(avgFps).toBeGreaterThan(30);
        expect(duration).toBeLessThan(10000); // Less than 10 seconds
    });
    
    test('Error Recovery and State Consistency', async ({ page }) => {
        // Step 1: Trigger an error and verify recovery
        const errorRecovery = await page.evaluate(() => {
            const game = window.game;
            let errorCaught = false;
            
            // Override console.error to catch errors
            const originalConsoleError = console.error;
            console.error = (message) => {
                errorCaught = true;
                originalConsoleError(message);
            };
            
            // Try to trigger an error
            try {
                game.scene.start('NonExistentScene');
            } catch (error) {
                errorCaught = true;
            }
            
            // Restore console.error
            console.error = originalConsoleError;
            
            return {
                errorCaught,
                gameStillRunning: game.isRunning,
                activeScene: game.scene.getActiveScene()?.scene?.key,
                systemsIntact: !!game.appStateManager && !!game.storageManager
            };
        });
        
        expect(errorRecovery.errorCaught).toBe(true);
        expect(errorRecovery.gameStillRunning).toBe(true);
        expect(errorRecovery.systemsIntact).toBe(true);
        
        // Step 2: Verify UI is still responsive after error
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await expect(goalLibraryBtn).toBeVisible();
        await goalLibraryBtn.click();
        
        // Step 3: Verify scene transition still works
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('GoalLibraryScene');
    });
    
    test('Cross-Browser Game Flow Consistency', async ({ page, browserName }) => {
        // Test that game flow works consistently across browsers
        const browserConsistency = await page.evaluate(() => {
            const game = window.game;
            const canvas = document.querySelector('canvas');
            
            return {
                browserName: navigator.userAgent,
                gameRunning: game.isRunning,
                canvasVisible: canvas.width > 0 && canvas.height > 0,
                webglSupported: !!game.renderer.gl,
                systemsReady: !!game.appStateManager && !!game.storageManager
            };
        });
        
        expect(browserConsistency.gameRunning).toBe(true);
        expect(browserConsistency.canvasVisible).toBe(true);
        expect(browserConsistency.systemsReady).toBe(true);
        
        console.log(`Game flow consistency for ${browserName}:`, browserConsistency);
    });
});
