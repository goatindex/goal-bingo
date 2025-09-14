/**
 * Performance Tests
 * 
 * This test suite validates performance metrics for scene transitions,
 * button interactions, and overall game performance.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Performance Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('Scene transition performance', async ({ page }) => {
        // Test scene transition performance
        const transitionPerformance = await PhaserTestHelper.testPerformance(
            page, 
            testConfig.scenes.mainMenu,
            async () => {
                await PhaserTestHelper.testSceneTransition(
                    page, 
                    testConfig.scenes.mainMenu, 
                    testConfig.scenes.goalLibrary
                );
            }
        );
        
        expect(transitionPerformance.success).toBe(true);
        expect(transitionPerformance.duration).toBeLessThan(testConfig.performance.transitionTime);
    });

    test('Button click performance', async ({ page }) => {
        // Test button click performance
        const buttonPerformance = await PhaserTestHelper.testPerformance(
            page, 
            testConfig.scenes.mainMenu,
            async () => {
                await PhaserTestHelper.testButtonClick(
                    page, 
                    testConfig.buttons.mainMenu.goalLibrary.text, 
                    testConfig.scenes.mainMenu
                );
            }
        );
        
        expect(buttonPerformance.success).toBe(true);
        expect(buttonPerformance.duration).toBeLessThan(testConfig.performance.buttonClickTime);
    });

    test('Scene loading performance', async ({ page }) => {
        // Test scene loading performance
        const loadingPerformance = await PhaserTestHelper.testPerformance(
            page, 
            testConfig.scenes.mainMenu,
            async () => {
                await PhaserTestHelper.testSceneLoading(page, testConfig.scenes.mainMenu);
            }
        );
        
        expect(loadingPerformance.success).toBe(true);
        expect(loadingPerformance.duration).toBeLessThan(testConfig.performance.sceneLoadTime);
    });

    test('Multiple rapid scene transitions', async ({ page }) => {
        // Test performance with multiple rapid scene transitions
        const startTime = Date.now();
        
        const scenes = [
            testConfig.scenes.goalLibrary,
            testConfig.scenes.bingoGrid,
            testConfig.scenes.rewards,
            testConfig.scenes.mainMenu
        ];
        
        for (const scene of scenes) {
            await PhaserTestHelper.testSceneTransition(
                page, 
                testConfig.scenes.mainMenu, 
                scene
            );
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Verify performance is acceptable
        expect(totalTime).toBeLessThan(testConfig.performance.transitionTime * scenes.length);
    });

    test('Memory usage during scene transitions', async ({ page }) => {
        // Test memory usage during scene transitions
        const initialMemory = await page.evaluate(() => {
            return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        });
        
        // Perform multiple scene transitions
        for (let i = 0; i < 5; i++) {
            await PhaserTestHelper.testSceneTransition(
                page, 
                testConfig.scenes.mainMenu, 
                testConfig.scenes.goalLibrary
            );
            
            await PhaserTestHelper.testSceneTransition(
                page, 
                testConfig.scenes.goalLibrary, 
                testConfig.scenes.mainMenu
            );
        }
        
        const finalMemory = await page.evaluate(() => {
            return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        });
        
        // Memory should not have increased significantly
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(5000000); // 5MB threshold
    });

    test('Button interaction performance under load', async ({ page }) => {
        // Test button interaction performance under load
        const startTime = Date.now();
        
        // Perform multiple rapid button clicks
        for (let i = 0; i < 10; i++) {
            await PhaserTestHelper.testButtonClick(
                page, 
                testConfig.buttons.mainMenu.goalLibrary.text, 
                testConfig.scenes.mainMenu
            );
            
            // Wait a bit between clicks
            await page.waitForTimeout(10);
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Verify performance is acceptable
        expect(totalTime).toBeLessThan(testConfig.performance.buttonClickTime * 10);
    });

    test('Scene rendering performance', async ({ page }) => {
        // Test scene rendering performance
        const renderingPerformance = await page.evaluate(() => {
            const startTime = performance.now();
            
            // Force a render
            window.game.render();
            
            const endTime = performance.now();
            
            return {
                renderTime: endTime - startTime,
                fps: window.game.loop.actualFps,
                delta: window.game.loop.delta
            };
        });
        
        expect(renderingPerformance.renderTime).toBeLessThan(16); // 60 FPS = 16ms per frame
        expect(renderingPerformance.fps).toBeGreaterThan(30); // Minimum 30 FPS
    });

    test('Data flow performance', async ({ page }) => {
        // Test data flow performance
        const dataFlowPerformance = await PhaserTestHelper.testPerformance(
            page, 
            testConfig.scenes.mainMenu,
            async () => {
                await PhaserTestHelper.testDataFlow(page, testConfig.scenes.mainMenu);
            }
        );
        
        expect(dataFlowPerformance.success).toBe(true);
        expect(dataFlowPerformance.duration).toBeLessThan(1000); // 1 second threshold
    });

    test('Event system performance', async ({ page }) => {
        // Test event system performance
        const eventPerformance = await page.evaluate(() => {
            const startTime = performance.now();
            
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            
            // Add multiple event listeners
            for (let i = 0; i < 100; i++) {
                sceneInstance.events.on('test-event-' + i, () => {});
            }
            
            // Fire events
            for (let i = 0; i < 100; i++) {
                sceneInstance.events.emit('test-event-' + i);
            }
            
            // Remove event listeners
            for (let i = 0; i < 100; i++) {
                sceneInstance.events.off('test-event-' + i);
            }
            
            const endTime = performance.now();
            
            return {
                totalTime: endTime - startTime,
                averageTime: (endTime - startTime) / 100
            };
        });
        
        expect(eventPerformance.totalTime).toBeLessThan(100); // 100ms threshold
        expect(eventPerformance.averageTime).toBeLessThan(1); // 1ms per event
    });

    test('Game object creation performance', async ({ page }) => {
        // Test game object creation performance
        const creationPerformance = await page.evaluate(() => {
            const startTime = performance.now();
            
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            
            // Create multiple game objects
            const objects = [];
            for (let i = 0; i < 100; i++) {
                const obj = sceneInstance.add.rectangle(i * 10, i * 10, 10, 10, 0xff0000);
                objects.push(obj);
            }
            
            // Destroy game objects
            objects.forEach(obj => obj.destroy());
            
            const endTime = performance.now();
            
            return {
                totalTime: endTime - startTime,
                averageTime: (endTime - startTime) / 100
            };
        });
        
        expect(creationPerformance.totalTime).toBeLessThan(200); // 200ms threshold
        expect(creationPerformance.averageTime).toBeLessThan(2); // 2ms per object
    });

    test('Input system performance', async ({ page }) => {
        // Test input system performance
        const inputPerformance = await page.evaluate(() => {
            const startTime = performance.now();
            
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const inputSystem = sceneInstance.input;
            
            // Get interactive elements
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input);
            
            // Test input operations
            for (let i = 0; i < 50; i++) {
                if (interactiveElements.length > 0) {
                    const pointer = inputSystem.activePointer;
                    inputSystem.forceOverState(pointer, interactiveElements[0]);
                    inputSystem.forceOutState(pointer, interactiveElements[0]);
                }
            }
            
            const endTime = performance.now();
            
            return {
                totalTime: endTime - startTime,
                averageTime: (endTime - startTime) / 50
            };
        });
        
        expect(inputPerformance.totalTime).toBeLessThan(100); // 100ms threshold
        expect(inputPerformance.averageTime).toBeLessThan(2); // 2ms per operation
    });

    test('Overall game performance', async ({ page }) => {
        // Test overall game performance
        const overallPerformance = await page.evaluate(() => {
            const startTime = performance.now();
            
            // Perform various game operations
            const operations = [
                () => window.game.scene.start(testConfig.scenes.goalLibrary),
                () => window.game.scene.start(testConfig.scenes.bingoGrid),
                () => window.game.scene.start(testConfig.scenes.rewards),
                () => window.game.scene.start(testConfig.scenes.mainMenu)
            ];
            
            operations.forEach(operation => operation());
            
            const endTime = performance.now();
            
            return {
                totalTime: endTime - startTime,
                fps: window.game.loop.actualFps,
                delta: window.game.loop.delta
            };
        });
        
        expect(overallPerformance.totalTime).toBeLessThan(1000); // 1 second threshold
        expect(overallPerformance.fps).toBeGreaterThan(30); // Minimum 30 FPS
    });
});
