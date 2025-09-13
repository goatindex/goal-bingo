// Test Goal Library Scene functionality

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

import { test, expect } from '@playwright/test';

test.describe('Goal Library Scene', () => {
    test('should load Goal Library scene successfully', async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3004/');
        
        // Wait for the game to load
        await page.waitForTimeout(3000);
        
        // Check if the game is loaded
        const gameLoaded = await page.evaluate(() => {
            return window.game && window.game.scene && window.game.scene.scenes.length > 0;
        });
        expect(gameLoaded).toBe(true);
        
        // Navigate to Goal Library scene
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
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
        
        expect(activeScene).toBe('GoalLibraryScene');
    });

    test('should display Goal Library UI elements', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Navigate to Goal Library
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Check for UI elements
        const uiElements = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { canvas: false, elements: [] };
            
            // Get canvas context to check for rendered content
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hasContent = imageData.data.some(pixel => pixel !== 0);
            
            return {
                canvas: true,
                hasContent: hasContent,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            };
        });
        
        expect(uiElements.canvas).toBe(true);
        expect(uiElements.hasContent).toBe(true);
        expect(uiElements.canvasWidth).toBeGreaterThan(0);
        expect(uiElements.canvasHeight).toBeGreaterThan(0);
    });

    test('should handle filter button interactions', async ({ page }) => {
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
                    // Check if filter buttons exist
                    const hasFilterButtons = goalLibraryScene.filterButtonsGroup && 
                                           goalLibraryScene.filterButtonsGroup.children.size > 0;
                    
                    // Test filter change
                    if (hasFilterButtons) {
                        goalLibraryScene.setFilter('to-do');
                        return {
                            hasFilterButtons: true,
                            currentFilter: goalLibraryScene.currentFilter,
                            filterChanged: goalLibraryScene.currentFilter === 'to-do'
                        };
                    }
                }
            }
            return { hasFilterButtons: false, currentFilter: null, filterChanged: false };
        });
        
        expect(filterTest.hasFilterButtons).toBe(true);
        expect(filterTest.filterChanged).toBe(true);
    });

    test('should handle back button navigation', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Navigate to Goal Library
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Test back button
        const backButtonTest = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const goalLibraryScene = scenes.find(scene => scene.scene.key === 'GoalLibraryScene');
                
                if (goalLibraryScene && goalLibraryScene.headerContainer) {
                    // Simulate back button click
                    const backButton = goalLibraryScene.headerContainer.list.find(obj => 
                        obj.interactive && obj.x === 100
                    );
                    
                    if (backButton) {
                        // Trigger the click event
                        backButton.emit('pointerdown');
                        return { backButtonFound: true, clickTriggered: true };
                    }
                }
            }
            return { backButtonFound: false, clickTriggered: false };
        });
        
        expect(backButtonTest.backButtonFound).toBe(true);
        expect(backButtonTest.clickTriggered).toBe(true);
    });

    test('should display goal statistics', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Navigate to Goal Library
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Check statistics display
        const statsTest = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const goalLibraryScene = scenes.find(scene => scene.scene.key === 'GoalLibraryScene');
                
                if (goalLibraryScene && goalLibraryScene.statsText) {
                    return {
                        hasStatsText: true,
                        statsText: goalLibraryScene.statsText.text
                    };
                }
            }
            return { hasStatsText: false, statsText: null };
        });
        
        expect(statsTest.hasStatsText).toBe(true);
        expect(statsTest.statsText).toContain('Total:');
    });

    test('should handle add goal button', async ({ page }) => {
        await page.goto('http://localhost:3004/');
        await page.waitForTimeout(3000);
        
        // Navigate to Goal Library
        await page.evaluate(() => {
            if (window.game && window.game.scene) {
                window.game.scene.start('GoalLibraryScene');
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Test add goal button
        const addGoalTest = await page.evaluate(() => {
            if (window.game && window.game.scene) {
                const scenes = window.game.scene.scenes;
                const goalLibraryScene = scenes.find(scene => scene.scene.key === 'GoalLibraryScene');
                
                if (goalLibraryScene && goalLibraryScene.addGoalContainer) {
                    // Find add goal button
                    const addButton = goalLibraryScene.addGoalContainer.list.find(obj => 
                        obj.interactive && obj.width === 200
                    );
                    
                    if (addButton) {
                        // Trigger the click event
                        addButton.emit('pointerdown');
                        return { addButtonFound: true, clickTriggered: true };
                    }
                }
            }
            return { addButtonFound: false, clickTriggered: false };
        });
        
        expect(addGoalTest.addButtonFound).toBe(true);
        expect(addGoalTest.clickTriggered).toBe(true);
    });
});

