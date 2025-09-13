// Test scene detection logic

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

import { test, expect } from '@playwright/test';

test.describe('Scene Detection Test', () => {
    test('should properly detect active scenes', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Check all scenes
        const allScenes = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                return scenes.map(scene => ({
                    key: scene.scene.key,
                    isActive: scene.scene.isActive(),
                    isVisible: scene.scene.isVisible(),
                    isSleeping: scene.scene.isSleeping(),
                    isPaused: scene.scene.isPaused()
                }));
            }
            return [];
        });
        
        console.log('All scenes:', allScenes);
        
        // Try to start GoalLibraryScene
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Check all scenes again
        const allScenesAfter = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                return scenes.map(scene => ({
                    key: scene.scene.key,
                    isActive: scene.scene.isActive(),
                    isVisible: scene.scene.isVisible(),
                    isSleeping: scene.scene.isSleeping(),
                    isPaused: scene.scene.isPaused()
                }));
            }
            return [];
        });
        
        console.log('All scenes after start:', allScenesAfter);
        
        // Find active scenes
        const activeScenes = allScenesAfter.filter(scene => scene.isActive);
        console.log('Active scenes:', activeScenes);
        
        // Check if GoalLibraryScene is in the active scenes
        const goalLibraryActive = activeScenes.find(scene => scene.key === 'GoalLibraryScene');
        console.log('GoalLibraryScene active:', goalLibraryActive);
        
        expect(goalLibraryActive).toBeDefined();
        expect(goalLibraryActive.isActive).toBe(true);
    });
});

