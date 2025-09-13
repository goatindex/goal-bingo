// Simple test for Goal Library Scene functionality

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

import { test, expect } from '@playwright/test';

test.describe('Goal Library Scene - Simple Test', () => {
    test('should navigate to Goal Library and display content', async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3004/');
        
        // Wait for the game to load
        await page.waitForTimeout(3000);
        
        // Check if the game is loaded
        const gameLoaded = await page.evaluate(() => {
            return window.game && window.game.scene && window.game.scene.scenes.length > 0;
        });
        expect(gameLoaded).toBe(true);
        
        // Click the Goal Library button
        await page.click('canvas');
        
        // Wait for scene transition
        await page.waitForTimeout(2000);
        
        // Check if Goal Library scene is active
        const activeScene = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const activeScene = scenes.find(scene => scene.scene.isActive());
                return activeScene ? activeScene.scene.key : null;
            }
            return null;
        });
        
        console.log('Active scene:', activeScene);
        
        // Check for Goal Library UI elements
        const hasGoalLibraryContent = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const goalLibraryScene = scenes.find(scene => scene.scene.key === 'GoalLibraryScene');
                
                if (goalLibraryScene) {
                    return {
                        hasHeaderContainer: !!goalLibraryScene.headerContainer,
                        hasFiltersContainer: !!goalLibraryScene.filtersContainer,
                        hasGoalsListContainer: !!goalLibraryScene.goalsListContainer,
                        hasAddGoalContainer: !!goalLibraryScene.addGoalContainer,
                        hasFilterButtons: goalLibraryScene.filterButtonsGroup && goalLibraryScene.filterButtonsGroup.children.size > 0,
                        hasStatsText: !!goalLibraryScene.statsText
                    };
                }
            }
            return null;
        });
        
        console.log('Goal Library content:', hasGoalLibraryContent);
        
        // The scene should be active and have the expected content
        expect(activeScene).toBe('GoalLibraryScene');
        expect(hasGoalLibraryContent).not.toBeNull();
        expect(hasGoalLibraryContent.hasHeaderContainer).toBe(true);
        expect(hasGoalLibraryContent.hasFiltersContainer).toBe(true);
        expect(hasGoalLibraryContent.hasGoalsListContainer).toBe(true);
        expect(hasGoalLibraryContent.hasAddGoalContainer).toBe(true);
    });

    test('should handle filter button clicks', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Navigate to Goal Library
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Test filter functionality
        const filterTest = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const goalLibraryScene = scenes.find(scene => scene.scene.key === 'GoalLibraryScene');
                
                if (goalLibraryScene) {
                    // Test filter change
                    goalLibraryScene.setFilter('to-do');
                    return {
                        currentFilter: goalLibraryScene.currentFilter,
                        filterChanged: goalLibraryScene.currentFilter === 'to-do'
                    };
                }
            }
            return { currentFilter: null, filterChanged: false };
        });
        
        expect(filterTest.filterChanged).toBe(true);
        expect(filterTest.currentFilter).toBe('to-do');
    });
});

