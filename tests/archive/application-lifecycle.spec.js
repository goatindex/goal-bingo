/**
 * Application Lifecycle E2E Tests
 * 
 * ARCHITECTURE NOTES:
 * - Tests complete application initialization flow
 * - Validates Phaser game startup and scene transitions
 * - Ensures all systems initialize correctly
 * - Uses Playwright for UI testing, page.evaluate() for game state
 */

import { test, expect } from '@playwright/test';

test.describe('Application Lifecycle', () => {
    test('Game Initialization Flow', async ({ page }) => {
        // Navigate to the application
        await page.goto('/');
        
        // Wait for Phaser to initialize
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Validate game state (not visual)
        const gameState = await page.evaluate(() => ({
            isRunning: window.game.isRunning,
            activeScene: window.game.scene.getActiveScene()?.scene?.key,
            systemsReady: window.game.registry.get('systemsInitialized'),
            rendererType: window.game.renderer.type,
            canvasWidth: window.game.canvas.width,
            canvasHeight: window.game.canvas.height
        }));
        
        expect(gameState.isRunning).toBe(true);
        expect(gameState.activeScene).toBe('MainMenuScene');
        expect(gameState.systemsReady).toBe(true);
        expect(gameState.rendererType).toBeGreaterThan(0); // WebGL or Canvas
        expect(gameState.canvasWidth).toBeGreaterThan(0);
        expect(gameState.canvasHeight).toBeGreaterThan(0);
    });
    
    test('Scene Transition Sequence', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test BootScene → PreloadScene → MainMenuScene sequence
        const sceneSequence = await page.evaluate(() => {
            const game = window.game;
            const scenes = game.scene.scenes;
            
            return scenes.map(scene => ({
                key: scene.scene.key,
                isActive: scene.scene.isActive(),
                isVisible: scene.scene.isVisible(),
                isSleeping: scene.scene.isSleeping()
            }));
        });
        
        // Should have MainMenuScene active
        const mainMenuScene = sceneSequence.find(s => s.key === 'MainMenuScene');
        expect(mainMenuScene).toBeDefined();
        expect(mainMenuScene.isActive).toBe(true);
        expect(mainMenuScene.isVisible).toBe(true);
    });
    
    test('System Initialization Validation', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Check that all systems are initialized
        const systemStatus = await page.evaluate(() => {
            const game = window.game;
            return {
                logger: !!game.logger,
                appStateManager: !!game.appStateManager,
                storageManager: !!game.storageManager,
                performanceLogger: !!game.performanceLogger,
                userActionLogger: !!game.userActionLogger,
                sceneStateLogger: !!game.sceneStateLogger,
                debugTools: !!game.debugTools
            };
        });
        
        expect(systemStatus.logger).toBe(true);
        expect(systemStatus.appStateManager).toBe(true);
        expect(systemStatus.storageManager).toBe(true);
        expect(systemStatus.performanceLogger).toBe(true);
        expect(systemStatus.userActionLogger).toBe(true);
        expect(systemStatus.sceneStateLogger).toBe(true);
        expect(systemStatus.debugTools).toBe(true);
    });
    
    test('Error Handling and Recovery', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test error handling by triggering a scene error
        const errorHandling = await page.evaluate(() => {
            const game = window.game;
            const originalConsoleError = console.error;
            let errorCaught = false;
            
            // Override console.error to catch errors
            console.error = (message) => {
                errorCaught = true;
                originalConsoleError(message);
            };
            
            // Try to access a non-existent scene
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
                activeScene: game.scene.getActiveScene()?.scene?.key
            };
        });
        
        // Game should still be running after error
        expect(errorHandling.gameStillRunning).toBe(true);
        expect(errorHandling.activeScene).toBe('MainMenuScene');
    });
    
    test('Memory Usage and Performance', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Check memory usage and performance metrics
        const performanceData = await page.evaluate(() => {
            const game = window.game;
            return {
                frameRate: game.loop.actualFps,
                drawCalls: game.renderer.drawCalls,
                textureMemory: game.renderer.textureManager.usedTextureSlots,
                memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : null,
                sceneCount: game.scene.scenes.length
            };
        });
        
        expect(performanceData.frameRate).toBeGreaterThan(30);
        expect(performanceData.drawCalls).toBeLessThan(1000);
        expect(performanceData.sceneCount).toBeGreaterThan(0);
        
        if (performanceData.memoryUsage) {
            expect(performanceData.memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
        }
    });
});
