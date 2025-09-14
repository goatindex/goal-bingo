/**
 * Scene Transition Tests
 * 
 * This test suite validates scene transitions in the Phaser game using Playwright.
 * It follows both Phaser and Playwright best practices for testing canvas-based games.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Scene Transitions', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('MainMenuScene to GoalLibraryScene transition', async ({ page }) => {
        // Test transition using Phaser's native API
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        // Verify transition was successful
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
        expect(result.isRunning).toBe(true);
    });

    test('MainMenuScene to BingoGridScene transition', async ({ page }) => {
        // Test transition using Phaser's native API
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.bingoGrid
        );
        
        // Verify transition was successful
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
        expect(result.isRunning).toBe(true);
    });

    test('MainMenuScene to RewardsScene transition', async ({ page }) => {
        // Test transition using Phaser's native API
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.rewards
        );
        
        // Verify transition was successful
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
        expect(result.isRunning).toBe(true);
    });

    test('GoalLibraryScene back to MainMenuScene', async ({ page }) => {
        // First transition to GoalLibraryScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        // Then transition back to MainMenuScene
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.goalLibrary, 
            testConfig.scenes.mainMenu
        );
        
        // Verify transition back was successful
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
        expect(result.isRunning).toBe(true);
    });

    test('BingoGridScene back to MainMenuScene', async ({ page }) => {
        // First transition to BingoGridScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.bingoGrid
        );
        
        // Then transition back to MainMenuScene
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.bingoGrid, 
            testConfig.scenes.mainMenu
        );
        
        // Verify transition back was successful
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
        expect(result.isRunning).toBe(true);
    });

    test('RewardsScene back to MainMenuScene', async ({ page }) => {
        // First transition to RewardsScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.rewards
        );
        
        // Then transition back to MainMenuScene
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.rewards, 
            testConfig.scenes.mainMenu
        );
        
        // Verify transition back was successful
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
        expect(result.isRunning).toBe(true);
    });

    test('Scene transition performance', async ({ page }) => {
        const startTime = Date.now();
        
        // Test transition performance
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        const endTime = Date.now();
        const transitionTime = endTime - startTime;
        
        // Verify transition time is within acceptable limits
        expect(transitionTime).toBeLessThan(testConfig.performance.transitionTime);
    });

    test('Multiple rapid scene transitions', async ({ page }) => {
        // Test multiple rapid transitions to ensure stability
        const scenes = [
            testConfig.scenes.goalLibrary,
            testConfig.scenes.bingoGrid,
            testConfig.scenes.rewards,
            testConfig.scenes.mainMenu
        ];
        
        for (const scene of scenes) {
            const result = await PhaserTestHelper.testSceneTransition(
                page, 
                testConfig.scenes.mainMenu, 
                scene
            );
            
            // Verify each transition was successful
            expect(result.active).toBe(true);
            expect(result.visible).toBe(true);
            expect(result.children).toBeGreaterThan(0);
        }
    });

    test('Scene state validation after transition', async ({ page }) => {
        // Transition to GoalLibraryScene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        // Get detailed scene state
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.goalLibrary);
        
        // Verify scene state is valid
        expect(sceneState.active).toBe(true);
        expect(sceneState.visible).toBe(true);
        expect(sceneState.isRunning).toBe(true);
        expect(sceneState.isVisible).toBe(true);
        expect(sceneState.children).toBeGreaterThan(0);
        expect(sceneState.state).toBe('RUNNING');
    });

    test('Scene transition with data passing', async ({ page }) => {
        // Test scene transition with data
        const testData = { test: true, timestamp: Date.now() };
        
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
});
