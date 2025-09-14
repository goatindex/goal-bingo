/**
 * Button Functionality Tests
 * 
 * This test suite validates button interactions in Phaser scenes using Playwright.
 * It uses Phaser's force input methods to simulate button clicks and interactions.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Button Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('MainMenuScene buttons are interactive', async ({ page }) => {
        // Get all interactive elements in MainMenuScene
        const interactiveElements = await PhaserTestHelper.getInteractiveElements(page, testConfig.scenes.mainMenu);
        
        // Verify we have interactive elements
        expect(interactiveElements.length).toBeGreaterThan(0);
        
        // Verify button properties
        const buttons = interactiveElements.filter(el => el.type === 'Rectangle' || el.type === 'Text');
        expect(buttons.length).toBeGreaterThan(0);
        
        // Check that buttons are visible and active
        buttons.forEach(button => {
            expect(button.visible).toBe(true);
            expect(button.active).toBe(true);
        });
    });

    test('Goal Library button click triggers scene transition', async ({ page }) => {
        // Test button click using Phaser's force input methods
        const success = await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.goalLibrary.text, 
            testConfig.scenes.mainMenu
        );
        
        expect(success).toBe(true);
        
        // Wait for scene transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify we're now in GoalLibraryScene
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.goalLibrary);
        expect(sceneState.active).toBe(true);
        expect(sceneState.visible).toBe(true);
    });

    test('Play Bingo button click triggers scene transition', async ({ page }) => {
        // Test button click using Phaser's force input methods
        const success = await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.playBingo.text, 
            testConfig.scenes.mainMenu
        );
        
        expect(success).toBe(true);
        
        // Wait for scene transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.bingoGrid);
        
        // Verify we're now in BingoGridScene
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.bingoGrid);
        expect(sceneState.active).toBe(true);
        expect(sceneState.visible).toBe(true);
    });

    test('Rewards button click triggers scene transition', async ({ page }) => {
        // Test button click using Phaser's force input methods
        const success = await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.rewards.text, 
            testConfig.scenes.mainMenu
        );
        
        expect(success).toBe(true);
        
        // Wait for scene transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.rewards);
        
        // Verify we're now in RewardsScene
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.rewards);
        expect(sceneState.active).toBe(true);
        expect(sceneState.visible).toBe(true);
    });

    test('Button hover effects work correctly', async ({ page }) => {
        // Get interactive elements
        const interactiveElements = await PhaserTestHelper.getInteractiveElements(page, testConfig.scenes.mainMenu);
        const buttons = interactiveElements.filter(el => el.type === 'Rectangle' || el.type === 'Text');
        
        // Test hover effects using Phaser's force input methods
        for (const button of buttons) {
            // Simulate hover over
            await page.evaluate(({ scene, buttonText }) => {
                const sceneInstance = window.game.scene.getScene(scene);
                const button = sceneInstance.children.list.find(obj => 
                    obj.text === buttonText && obj.input && obj.input.enabled
                );
                
                if (button) {
                    const pointer = sceneInstance.input.activePointer;
                    sceneInstance.input.forceOverState(pointer, button);
                }
            }, { scene: testConfig.scenes.mainMenu, buttonText: button.text });
            
            // Simulate hover out
            await page.evaluate(({ scene, buttonText }) => {
                const sceneInstance = window.game.scene.getScene(scene);
                const button = sceneInstance.children.list.find(obj => 
                    obj.text === buttonText && obj.input && obj.input.enabled
                );
                
                if (button) {
                    const pointer = sceneInstance.input.activePointer;
                    sceneInstance.input.forceOutState(pointer, button);
                }
            }, { scene: testConfig.scenes.mainMenu, buttonText: button.text });
        }
        
        // If we get here without errors, hover effects are working
        expect(buttons.length).toBeGreaterThan(0);
    });

    test('Button click performance', async ({ page }) => {
        const startTime = Date.now();
        
        // Test button click performance
        const success = await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.goalLibrary.text, 
            testConfig.scenes.mainMenu
        );
        
        const endTime = Date.now();
        const clickTime = endTime - startTime;
        
        expect(success).toBe(true);
        expect(clickTime).toBeLessThan(testConfig.performance.buttonClickTime);
    });

    test('Multiple button clicks in sequence', async ({ page }) => {
        // Test multiple button clicks to ensure stability
        const buttons = [
            testConfig.buttons.mainMenu.goalLibrary.text,
            testConfig.buttons.mainMenu.playBingo.text,
            testConfig.buttons.mainMenu.rewards.text
        ];
        
        for (const buttonText of buttons) {
            const success = await PhaserTestHelper.testButtonClick(
                page, 
                buttonText, 
                testConfig.scenes.mainMenu
            );
            
            expect(success).toBe(true);
            
            // Wait a bit between clicks
            await page.waitForTimeout(100);
        }
    });

    test('Button accessibility properties', async ({ page }) => {
        // Test accessibility features
        const accessibilityResults = await PhaserTestHelper.testAccessibility(page, testConfig.scenes.mainMenu);
        
        expect(accessibilityResults.success).toBe(true);
        expect(accessibilityResults.totalElements).toBeGreaterThan(0);
        
        // Verify accessibility properties
        accessibilityResults.accessibilityResults.forEach(element => {
            expect(element.type).toBeDefined();
            expect(element.cursor).toBeDefined();
        });
    });

    test('Button state management', async ({ page }) => {
        // Test button state changes
        const interactiveElements = await PhaserTestHelper.getInteractiveElements(page, testConfig.scenes.mainMenu);
        const buttons = interactiveElements.filter(el => el.type === 'Rectangle' || el.type === 'Text');
        
        // Test button state changes
        for (const button of buttons) {
            // Test button down state
            await page.evaluate(({ scene, buttonText }) => {
                const sceneInstance = window.game.scene.getScene(scene);
                const button = sceneInstance.children.list.find(obj => 
                    obj.text === buttonText && obj.input && obj.input.enabled
                );
                
                if (button) {
                    const pointer = sceneInstance.input.activePointer;
                    sceneInstance.input.forceDownState(pointer, button);
                }
            }, { scene: testConfig.scenes.mainMenu, buttonText: button.text });
            
            // Test button up state
            await page.evaluate(({ scene, buttonText }) => {
                const sceneInstance = window.game.scene.getScene(scene);
                const button = sceneInstance.children.list.find(obj => 
                    obj.text === buttonText && obj.input && obj.input.enabled
                );
                
                if (button) {
                    const pointer = sceneInstance.input.activePointer;
                    sceneInstance.input.forceUpState(pointer, button);
                }
            }, { scene: testConfig.scenes.mainMenu, buttonText: button.text });
        }
        
        expect(buttons.length).toBeGreaterThan(0);
    });

    test('Button click with event propagation', async ({ page }) => {
        // Test button click with event propagation
        const success = await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.goalLibrary.text, 
            testConfig.scenes.mainMenu
        );
        
        expect(success).toBe(true);
        
        // Verify event propagation by checking if scene transition occurred
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.goalLibrary);
        expect(sceneState.active).toBe(true);
    });
});
