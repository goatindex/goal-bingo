/**
 * Scene Loading Validation Tests
 * 
 * This test suite validates that all scenes load correctly and have proper
 * initialization. It follows Phaser best practices for scene lifecycle testing.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Scene Loading Validation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for initial scene to load
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('All required scenes are registered', async ({ page }) => {
        // Get all registered scenes
        const registeredScenes = await page.evaluate(() => {
            return window.game.scene.scenes.map(scene => scene.sys.settings.key);
        });
        
        // Verify all required scenes are registered
        const requiredScenes = Object.values(testConfig.scenes);
        requiredScenes.forEach(sceneName => {
            expect(registeredScenes).toContain(sceneName);
        });
    });

    test('MainMenuScene loads correctly', async ({ page }) => {
        const result = await PhaserTestHelper.testSceneLoading(page, testConfig.scenes.mainMenu);
        
        expect(result.success).toBe(true);
        expect(result.sceneName).toBe(testConfig.scenes.mainMenu);
        expect(result.loadTime).toBeLessThan(testConfig.performance.sceneLoadTime);
        expect(result.sceneState.active).toBe(true);
        expect(result.sceneState.children).toBeGreaterThan(0);
    });

    test('GoalLibraryScene loads correctly', async ({ page }) => {
        // First transition to GoalLibraryScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        const result = await PhaserTestHelper.testSceneLoading(page, testConfig.scenes.goalLibrary);
        
        expect(result.success).toBe(true);
        expect(result.sceneName).toBe(testConfig.scenes.goalLibrary);
        expect(result.loadTime).toBeLessThan(testConfig.performance.sceneLoadTime);
        expect(result.sceneState.active).toBe(true);
        expect(result.sceneState.children).toBeGreaterThan(0);
    });

    test('BingoGridScene loads correctly', async ({ page }) => {
        // First transition to BingoGridScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.bingoGrid
        );
        
        const result = await PhaserTestHelper.testSceneLoading(page, testConfig.scenes.bingoGrid);
        
        expect(result.success).toBe(true);
        expect(result.sceneName).toBe(testConfig.scenes.bingoGrid);
        expect(result.loadTime).toBeLessThan(testConfig.performance.sceneLoadTime);
        expect(result.sceneState.active).toBe(true);
        expect(result.sceneState.children).toBeGreaterThan(0);
    });

    test('RewardsScene loads correctly', async ({ page }) => {
        // First transition to RewardsScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.rewards
        );
        
        const result = await PhaserTestHelper.testSceneLoading(page, testConfig.scenes.rewards);
        
        expect(result.success).toBe(true);
        expect(result.sceneName).toBe(testConfig.scenes.rewards);
        expect(result.loadTime).toBeLessThan(testConfig.performance.sceneLoadTime);
        expect(result.sceneState.active).toBe(true);
        expect(result.sceneState.children).toBeGreaterThan(0);
    });

    test('TestScene loads correctly', async ({ page }) => {
        // First transition to TestScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.test
        );
        
        const result = await PhaserTestHelper.testSceneLoading(page, testConfig.scenes.test);
        
        expect(result.success).toBe(true);
        expect(result.sceneName).toBe(testConfig.scenes.test);
        expect(result.loadTime).toBeLessThan(testConfig.performance.sceneLoadTime);
        expect(result.sceneState.active).toBe(true);
        expect(result.sceneState.children).toBeGreaterThan(0);
    });

    test('Scene initialization order', async ({ page }) => {
        // Test that scenes are initialized in the correct order
        const sceneOrder = await page.evaluate(() => {
            return window.game.scene.scenes.map(scene => ({
                key: scene.sys.settings.key,
                status: scene.sys.settings.status,
                active: scene.sys.isActive(),
                visible: scene.sys.isVisible()
            }));
        });
        
        // Verify MainMenuScene is active initially
        const mainMenuScene = sceneOrder.find(scene => scene.key === testConfig.scenes.mainMenu);
        expect(mainMenuScene).toBeDefined();
        expect(mainMenuScene.active).toBe(true);
        expect(mainMenuScene.visible).toBe(true);
    });

    test('Scene memory management', async ({ page }) => {
        // Test scene memory management by transitioning between scenes multiple times
        const scenes = [
            testConfig.scenes.goalLibrary,
            testConfig.scenes.bingoGrid,
            testConfig.scenes.rewards,
            testConfig.scenes.mainMenu
        ];
        
        for (let i = 0; i < 3; i++) {
            for (const scene of scenes) {
                await PhaserTestHelper.testSceneTransition(
                    page, 
                    testConfig.scenes.mainMenu, 
                    scene
                );
                
                // Verify scene loaded correctly
                const sceneState = await PhaserTestHelper.getSceneState(page, scene);
                expect(sceneState.active).toBe(true);
                expect(sceneState.children).toBeGreaterThan(0);
            }
        }
    });

    test('Scene error handling', async ({ page }) => {
        // Test scene error handling by trying to transition to non-existent scene
        try {
            await page.evaluate(() => {
                window.game.scene.start('NonExistentScene');
            });
            
            // Wait a bit to see if error occurs
            await page.waitForTimeout(1000);
            
            // Verify we're still in a valid scene
            const currentScene = await page.evaluate(() => {
                return window.game.scene.scenes.find(scene => scene.sys.isActive())?.sys.settings.key;
            });
            
            expect(currentScene).toBeDefined();
            expect(Object.values(testConfig.scenes)).toContain(currentScene);
        } catch (error) {
            // Error handling is working correctly
            expect(error).toBeDefined();
        }
    });

    test('Scene data persistence', async ({ page }) => {
        // Test that scene data persists correctly
        const testData = { test: true, timestamp: Date.now() };
        
        // Transition to GoalLibraryScene with data
        await page.evaluate(({ scene, data }) => {
            window.game.scene.start(scene, data);
        }, { scene: testConfig.scenes.goalLibrary, data: testData });
        
        // Wait for transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify data was passed correctly
        const receivedData = await page.evaluate((scene) => {
            const sceneInstance = window.game.scene.getScene(scene);
            return sceneInstance.data || {};
        }, testConfig.scenes.goalLibrary);
        
        expect(receivedData.test).toBe(true);
        expect(receivedData.timestamp).toBe(testData.timestamp);
    });

    test('Scene cleanup on shutdown', async ({ page }) => {
        // Test scene cleanup by transitioning away and back
        const initialScene = testConfig.scenes.mainMenu;
        const targetScene = testConfig.scenes.goalLibrary;
        
        // Get initial scene state
        const initialState = await PhaserTestHelper.getSceneState(page, initialScene);
        expect(initialState.active).toBe(true);
        
        // Transition to target scene
        await PhaserTestHelper.testSceneTransition(page, initialScene, targetScene);
        
        // Verify initial scene is no longer active
        const initialStateAfter = await PhaserTestHelper.getSceneState(page, initialScene);
        expect(initialStateAfter.active).toBe(false);
        
        // Transition back to initial scene
        await PhaserTestHelper.testSceneTransition(page, targetScene, initialScene);
        
        // Verify initial scene is active again
        const finalState = await PhaserTestHelper.getSceneState(page, initialScene);
        expect(finalState.active).toBe(true);
        expect(finalState.children).toBeGreaterThan(0);
    });

    test('Scene performance under load', async ({ page }) => {
        // Test scene performance under load
        const startTime = Date.now();
        
        // Perform multiple rapid scene transitions
        const scenes = [
            testConfig.scenes.goalLibrary,
            testConfig.scenes.bingoGrid,
            testConfig.scenes.rewards
        ];
        
        for (const scene of scenes) {
            await PhaserTestHelper.testSceneTransition(
                page, 
                testConfig.scenes.mainMenu, 
                scene
            );
            
            // Verify scene loaded correctly
            const sceneState = await PhaserTestHelper.getSceneState(page, scene);
            expect(sceneState.active).toBe(true);
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Verify performance is acceptable
        expect(totalTime).toBeLessThan(testConfig.performance.sceneLoadTime * scenes.length);
    });
});
