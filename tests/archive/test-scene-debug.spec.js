// Debug test for scene transitions

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

import { test, expect } from '@playwright/test';

test.describe('Scene Debug Test', () => {
    test('should debug scene transitions', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Check initial scene
        const initialScene = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const activeScene = scenes.find(scene => scene.scene.isActive());
                return activeScene ? activeScene.scene.key : null;
            }
            return null;
        });
        
        console.log('Initial scene:', initialScene);
        
        // Try to start GoalLibraryScene directly
        const startResult = await page.evaluate(() => {
            try {
                if (window.game && window.game.scene) {
                    window.game.scene.start('GoalLibraryScene');
                    return { success: true, error: null };
                }
                return { success: false, error: 'Game not available' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Start result:', startResult);
        
        // Wait for transition
        await page.waitForTimeout(2000);
        
        // Check scene after transition
        const finalScene = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const activeScene = scenes.find(scene => scene.scene.isActive());
                return activeScene ? activeScene.scene.key : null;
            }
            return null;
        });
        
        console.log('Final scene:', finalScene);
        
        // Check for errors in console
        const consoleErrors = await page.evaluate(() => {
            return window.consoleErrors || [];
        });
        
        console.log('Console errors:', consoleErrors);
        
        // Check if GoalLibraryScene exists
        const sceneExists = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const goalLibraryScene = scenes.find(scene => scene.scene.key === 'GoalLibraryScene');
                return {
                    exists: !!goalLibraryScene,
                    isActive: goalLibraryScene ? goalLibraryScene.scene.isActive() : false,
                    isVisible: goalLibraryScene ? goalLibraryScene.scene.isVisible() : false,
                    isSleeping: goalLibraryScene ? goalLibraryScene.scene.isSleeping() : false
                };
            }
            return { exists: false, isActive: false, isVisible: false, isSleeping: false };
        });
        
        console.log('Scene exists:', sceneExists);
        
        expect(startResult.success).toBe(true);
        expect(finalScene).toBe('GoalLibraryScene');
    });
});