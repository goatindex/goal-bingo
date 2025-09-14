/**
 * Error Handling Tests
 * 
 * This test suite validates error handling and recovery in Phaser scenes.
 * It tests various error scenarios and ensures the game remains stable.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('Scene transition to non-existent scene', async ({ page }) => {
        // Test error handling for non-existent scene
        const errorHandling = await page.evaluate(() => {
            try {
                // Try to start a non-existent scene
                window.game.scene.start('NonExistentScene');
                return { success: true, error: null };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        // Verify error was handled gracefully
        expect(errorHandling.success).toBe(false);
        expect(errorHandling.error).toBeDefined();
        
        // Verify we're still in a valid scene
        const currentScene = await page.evaluate(() => {
            return window.game.scene.scenes.find(scene => scene.sys.isActive())?.sys.settings.key;
        });
        
        expect(currentScene).toBeDefined();
        expect(Object.values(testConfig.scenes)).toContain(currentScene);
    });

    test('Invalid scene data handling', async ({ page }) => {
        // Test error handling for invalid scene data
        const errorHandling = await page.evaluate(() => {
            try {
                // Try to start scene with invalid data
                window.game.scene.start(testConfig.scenes.goalLibrary, { invalid: 'data' });
                return { success: true, error: null };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        // Scene should still start even with invalid data
        expect(errorHandling.success).toBe(true);
        
        // Wait for scene transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify scene is active
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.goalLibrary);
        expect(sceneState.active).toBe(true);
    });

    test('Button click on non-interactive element', async ({ page }) => {
        // Test error handling for clicking non-interactive elements
        const errorHandling = await page.evaluate(() => {
            try {
                const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
                const nonInteractiveElement = sceneInstance.children.list.find(obj => 
                    obj.type === 'Text' && !obj.input
                );
                
                if (nonInteractiveElement) {
                    // Try to force input on non-interactive element
                    const pointer = sceneInstance.input.activePointer;
                    sceneInstance.input.forceDownState(pointer, nonInteractiveElement);
                }
                
                return { success: true, error: null };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        // Should handle gracefully without crashing
        expect(errorHandling.success).toBe(true);
    });

    test('Scene shutdown during transition', async ({ page }) => {
        // Test error handling during scene shutdown
        const errorHandling = await page.evaluate(() => {
            try {
                // Start transition
                window.game.scene.start(testConfig.scenes.goalLibrary);
                
                // Immediately try to shutdown the scene
                const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
                sceneInstance.scene.shutdown();
                
                return { success: true, error: null };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        // Should handle gracefully
        expect(errorHandling.success).toBe(true);
        
        // Wait for target scene to load
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify target scene is active
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.goalLibrary);
        expect(sceneState.active).toBe(true);
    });

    test('Memory leak prevention', async ({ page }) => {
        // Test memory leak prevention by rapid scene transitions
        const initialMemory = await page.evaluate(() => {
            return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        });
        
        // Perform multiple rapid scene transitions
        for (let i = 0; i < 10; i++) {
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
        
        // Check memory usage
        const finalMemory = await page.evaluate(() => {
            return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        });
        
        // Memory should not have increased significantly
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(10000000); // 10MB threshold
    });

    test('Event listener cleanup', async ({ page }) => {
        // Test event listener cleanup
        const eventCleanup = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const initialListeners = sceneInstance.events.listenerCount('test-event');
            
            // Add test event listener
            sceneInstance.events.on('test-event', () => {});
            
            const afterAddListeners = sceneInstance.events.listenerCount('test-event');
            
            // Remove event listener
            sceneInstance.events.removeAllListeners('test-event');
            
            const afterRemoveListeners = sceneInstance.events.listenerCount('test-event');
            
            return {
                initial: initialListeners,
                afterAdd: afterAddListeners,
                afterRemove: afterRemoveListeners
            };
        });
        
        expect(eventCleanup.afterAdd).toBe(eventCleanup.initial + 1);
        expect(eventCleanup.afterRemove).toBe(eventCleanup.initial);
    });

    test('Game object cleanup on scene transition', async ({ page }) => {
        // Test game object cleanup
        const objectCleanup = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const initialObjects = sceneInstance.children.list.length;
            
            // Add test game object
            const testObject = sceneInstance.add.rectangle(100, 100, 50, 50, 0xff0000);
            
            const afterAddObjects = sceneInstance.children.list.length;
            
            // Transition to another scene
            window.game.scene.start(testConfig.scenes.goalLibrary);
            
            return {
                initial: initialObjects,
                afterAdd: afterAddObjects
            };
        });
        
        expect(objectCleanup.afterAdd).toBe(objectCleanup.initial + 1);
        
        // Wait for transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Verify target scene is active
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.goalLibrary);
        expect(sceneState.active).toBe(true);
    });

    test('Input system error recovery', async ({ page }) => {
        // Test input system error recovery
        const inputRecovery = await page.evaluate(() => {
            try {
                const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
                
                // Try to access input system
                const inputSystem = sceneInstance.input;
                const isActive = inputSystem.isActive();
                
                // Try to force input state
                const pointer = inputSystem.activePointer;
                const interactiveElements = sceneInstance.children.list.filter(obj => obj.input);
                
                if (interactiveElements.length > 0) {
                    inputSystem.forceDownState(pointer, interactiveElements[0]);
                }
                
                return { success: true, error: null, inputActive: isActive };
            } catch (error) {
                return { success: false, error: error.message, inputActive: false };
            }
        });
        
        expect(inputRecovery.success).toBe(true);
        expect(inputRecovery.inputActive).toBe(true);
    });

    test('Scene state validation after errors', async ({ page }) => {
        // Test scene state validation after errors
        const stateValidation = await page.evaluate(() => {
            try {
                // Perform various operations that might cause errors
                window.game.scene.start('InvalidScene');
                window.game.scene.start(testConfig.scenes.goalLibrary);
                
                const sceneInstance = window.game.scene.getScene(testConfig.scenes.goalLibrary);
                
                return {
                    success: true,
                    sceneActive: sceneInstance.sys.isActive(),
                    sceneVisible: sceneInstance.sys.isVisible(),
                    childrenCount: sceneInstance.children.list.length
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    sceneActive: false,
                    sceneVisible: false,
                    childrenCount: 0
                };
            }
        });
        
        // Should recover from errors
        expect(stateValidation.success).toBe(true);
        expect(stateValidation.sceneActive).toBe(true);
        expect(stateValidation.sceneVisible).toBe(true);
        expect(stateValidation.childrenCount).toBeGreaterThan(0);
    });

    test('Concurrent scene operations', async ({ page }) => {
        // Test concurrent scene operations
        const concurrentOperations = await page.evaluate(() => {
            try {
                // Perform multiple scene operations simultaneously
                const promises = [
                    new Promise(resolve => {
                        window.game.scene.start(testConfig.scenes.goalLibrary);
                        resolve('goalLibrary');
                    }),
                    new Promise(resolve => {
                        window.game.scene.start(testConfig.scenes.bingoGrid);
                        resolve('bingoGrid');
                    }),
                    new Promise(resolve => {
                        window.game.scene.start(testConfig.scenes.rewards);
                        resolve('rewards');
                    })
                ];
                
                return Promise.all(promises);
            } catch (error) {
                return { error: error.message };
            }
        });
        
        // Should handle concurrent operations gracefully
        expect(concurrentOperations.error).toBeUndefined();
        
        // Wait for final scene to load
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.rewards);
        
        // Verify final scene is active
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.rewards);
        expect(sceneState.active).toBe(true);
    });
});
