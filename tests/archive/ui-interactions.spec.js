/**
 * UI Interactions E2E Tests
 * 
 * ARCHITECTURE NOTES:
 * - Tests UI element visibility and interaction
 * - Validates button functionality and navigation
 * - Tests form interactions and data input
 * - Uses Playwright for DOM-based UI testing
 */

import { test, expect } from '@playwright/test';

test.describe('UI Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
    });
    
    test('Main Menu Button Visibility', async ({ page }) => {
        // Test that main menu buttons are visible
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        const bingoGridBtn = page.locator('text=🎲 Play Bingo');
        const rewardsBtn = page.locator('text=🏆 Rewards');
        
        await expect(goalLibraryBtn).toBeVisible();
        await expect(bingoGridBtn).toBeVisible();
        await expect(rewardsBtn).toBeVisible();
    });
    
    test('Main Menu Button Interactions', async ({ page }) => {
        // Test Goal Library button click
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.click();
        
        // Validate scene change through game state
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('GoalLibraryScene');
        
        // Navigate back to main menu
        await page.goBack();
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'MainMenuScene'
        );
    });
    
    test('Bingo Grid Navigation', async ({ page }) => {
        // Test Bingo Grid button click
        const bingoGridBtn = page.locator('text=🎲 Play Bingo');
        await bingoGridBtn.click();
        
        // Validate scene change
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('BingoGridScene');
    });
    
    test('Rewards Scene Navigation', async ({ page }) => {
        // Test Rewards button click
        const rewardsBtn = page.locator('text=🏆 Rewards');
        await rewardsBtn.click();
        
        // Validate scene change
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('RewardsScene');
    });
    
    test('Scene Navigation with Keyboard', async ({ page }) => {
        // Test keyboard navigation
        await page.keyboard.press('Escape'); // Should go back to main menu
        
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('MainMenuScene');
    });
    
    test('UI Element Responsiveness', async ({ page }) => {
        // Test UI responsiveness by resizing viewport
        await page.setViewportSize({ width: 800, height: 600 });
        
        // Check that UI elements are still visible
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await expect(goalLibraryBtn).toBeVisible();
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(goalLibraryBtn).toBeVisible();
    });
    
    test('Button Hover States', async ({ page }) => {
        // Test button hover effects
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        
        // Hover over button
        await goalLibraryBtn.hover();
        
        // Check if button is still visible and interactive
        await expect(goalLibraryBtn).toBeVisible();
        
        // Click after hover
        await goalLibraryBtn.click();
        
        // Validate scene change
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('GoalLibraryScene');
    });
    
    test('Multiple Button Clicks', async ({ page }) => {
        // Test rapid button clicking
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        
        // Click multiple times rapidly
        await goalLibraryBtn.click();
        await goalLibraryBtn.click();
        await goalLibraryBtn.click();
        
        // Should still work correctly
        const activeScene = await page.evaluate(() => 
            window.game.scene.getActiveScene()?.scene?.key
        );
        expect(activeScene).toBe('GoalLibraryScene');
    });
    
    test('UI Error Handling', async ({ page }) => {
        // Test UI error handling by simulating errors
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
                // This should not cause a crash
                game.scene.start('NonExistentScene');
            } catch (error) {
                errorCaught = true;
            }
            
            // Restore console.error
            console.error = originalConsoleError;
            
            return {
                errorCaught,
                gameStillRunning: game.isRunning,
                uiStillResponsive: document.querySelector('canvas') !== null
            };
        });
        
        // UI should still be responsive after error
        expect(errorHandling.gameStillRunning).toBe(true);
        expect(errorHandling.uiStillResponsive).toBe(true);
    });
});
