/**
 * Phaser-Compliant UI Interaction Tests
 * 
 * ARCHITECTURE NOTES:
 * - Tests UI elements through DOM interactions (Playwright's strength)
 * - Validates scene transitions using Phaser's scene manager
 * - Uses standard Phaser properties for game state validation
 * - Focuses on what Playwright can actually test (DOM, not WebGL)
 */

import { test, expect } from '@playwright/test';

test.describe('Phaser-Compliant UI Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
    });
    
    test('Main Menu Button Visibility and Interaction', async ({ page }) => {
        // Test button visibility (DOM-based)
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        const bingoGridBtn = page.locator('text=🎲 Play Bingo');
        const rewardsBtn = page.locator('text=🏆 Rewards');
        
        await expect(goalLibraryBtn).toBeVisible();
        await expect(bingoGridBtn).toBeVisible();
        await expect(rewardsBtn).toBeVisible();
        
        // Test button interaction and scene transition
        await goalLibraryBtn.click();
        
        // Validate scene change using Phaser's scene manager
        const activeScene = await page.evaluate(() => {
            const activeScenes = window.game.scene.getScenes(true);
            return activeScenes.length > 0 ? activeScenes[0].scene.key : null;
        });
        expect(activeScene).toBe('GoalLibraryScene');
    });
    
    test('Scene Navigation Sequence', async ({ page }) => {
        // Test complete navigation sequence
        const scenes = [
            { button: 'text=📚 Goal Library', expectedScene: 'GoalLibraryScene' },
            { button: 'text=🎲 Play Bingo', expectedScene: 'BingoGridScene' },
            { button: 'text=🏆 Rewards', expectedScene: 'RewardsScene' }
        ];
        
        for (const scene of scenes) {
            const button = page.locator(scene.button);
            await button.click();
            
            // Wait for scene transition
            await page.waitForFunction((expectedScene) => {
                const activeScenes = window.game.scene.getScenes(true);
                return activeScenes.length > 0 && activeScenes[0].scene.key === expectedScene;
            }, scene.expectedScene);
            
            // Validate scene change
            const activeScene = await page.evaluate(() => {
                const activeScenes = window.game.scene.getScenes(true);
                return activeScenes.length > 0 ? activeScenes[0].scene.key : null;
            });
            expect(activeScene).toBe(scene.expectedScene);
        }
    });
    
    test('Canvas Element Properties', async ({ page }) => {
        // Test canvas element (what Playwright can access)
        const canvasData = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const game = window.game;
            
            return {
                canvasExists: !!canvas,
                canvasWidth: canvas?.width,
                canvasHeight: canvas?.height,
                canvasClientWidth: canvas?.clientWidth,
                canvasClientHeight: canvas?.clientHeight,
                canvasStyle: canvas?.style.display,
                gameCanvas: game.canvas === canvas,
                canvasInDOM: document.body.contains(canvas)
            };
        });
        
        expect(canvasData.canvasExists).toBe(true);
        expect(canvasData.canvasWidth).toBeGreaterThan(0);
        expect(canvasData.canvasHeight).toBeGreaterThan(0);
        expect(canvasData.gameCanvas).toBe(true);
        expect(canvasData.canvasInDOM).toBe(true);
    });
    
    test('Game Container Element', async ({ page }) => {
        // Test game container element
        const containerData = await page.evaluate(() => {
            const container = document.getElementById('game-container');
            const game = window.game;
            
            return {
                containerExists: !!container,
                containerHasCanvas: container?.querySelector('canvas') !== null,
                gameParent: game.config.parent === 'game-container',
                containerChildren: container?.children.length
            };
        });
        
        expect(containerData.containerExists).toBe(true);
        expect(containerData.containerHasCanvas).toBe(true);
        expect(containerData.gameParent).toBe(true);
        expect(containerData.containerChildren).toBeGreaterThan(0);
    });
    
    test('Responsive Design and Scaling', async ({ page }) => {
        // Test responsive behavior
        const initialCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight
            };
        });
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        
        const mobileCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight
            };
        });
        
        // Canvas should still be visible and functional
        expect(mobileCanvas.width).toBeGreaterThan(0);
        expect(mobileCanvas.height).toBeGreaterThan(0);
        expect(mobileCanvas.clientWidth).toBeGreaterThan(0);
        expect(mobileCanvas.clientHeight).toBeGreaterThan(0);
        
        // Test desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        const desktopCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return {
                width: canvas.width,
                height: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight
            };
        });
        
        expect(desktopCanvas.width).toBeGreaterThan(0);
        expect(desktopCanvas.height).toBeGreaterThan(0);
    });
    
    test('Keyboard Navigation', async ({ page }) => {
        // Test keyboard interactions
        await page.keyboard.press('Escape');
        
        // Check if scene changed (depends on implementation)
        const activeScene = await page.evaluate(() => {
            const activeScenes = window.game.scene.getScenes(true);
            return activeScenes.length > 0 ? activeScenes[0].scene.key : null;
        });
        
        // Scene should still be valid
        expect(activeScene).toBeDefined();
        expect(activeScene).not.toBe('');
    });
    
    test('Game State Persistence During Interactions', async ({ page }) => {
        // Test that game state remains consistent during UI interactions
        const initialState = await page.evaluate(() => {
            const game = window.game;
            const activeScenes = game.scene.getScenes(true);
            return {
                isRunning: game.isRunning,
                activeScene: activeScenes.length > 0 ? activeScenes[0].scene.key : null,
                hasRegistry: !!game.registry,
                hasEvents: !!game.events
            };
        });
        
        // Perform UI interactions
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.click();
        
        const bingoGridBtn = page.locator('text=🎲 Play Bingo');
        await bingoGridBtn.click();
        
        // Check state after interactions
        const finalState = await page.evaluate(() => {
            const game = window.game;
            const activeScenes = game.scene.getScenes(true);
            return {
                isRunning: game.isRunning,
                activeScene: activeScenes.length > 0 ? activeScenes[0].scene.key : null,
                hasRegistry: !!game.registry,
                hasEvents: !!game.events
            };
        });
        
        // Core game state should remain intact
        expect(finalState.isRunning).toBe(initialState.isRunning);
        expect(finalState.hasRegistry).toBe(initialState.hasRegistry);
        expect(finalState.hasEvents).toBe(initialState.hasEvents);
        
        // Scene should have changed
        expect(finalState.activeScene).not.toBe(initialState.activeScene);
    });
    
    test('Error Recovery in UI Interactions', async ({ page }) => {
        // Test error handling during UI interactions
        const errorHandling = await page.evaluate(() => {
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
            
            const activeScenes = game.scene.getScenes(true);
            return {
                errorCaught,
                gameStillRunning: game.isRunning,
                activeScene: activeScenes.length > 0 ? activeScenes[0].scene.key : null,
                canvasVisible: document.querySelector('canvas') !== null
            };
        });
        
        // Game should still be functional after error
        expect(errorHandling.gameStillRunning).toBe(true);
        expect(errorHandling.canvasVisible).toBe(true);
        
        // UI should still be responsive
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await expect(goalLibraryBtn).toBeVisible();
    });
});
