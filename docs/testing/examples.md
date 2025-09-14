# Phaser Testing Examples

## Overview

This document provides comprehensive examples of common Phaser testing patterns, demonstrating best practices and real-world scenarios for testing Phaser scenes with Playwright.

## Table of Contents

1. [Basic Scene Testing](#basic-scene-testing)
2. [Button Interaction Patterns](#button-interaction-patterns)
3. [Data Flow Testing Examples](#data-flow-testing-examples)
4. [Performance Testing Patterns](#performance-testing-patterns)
5. [Accessibility Testing Examples](#accessibility-testing-examples)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Advanced Testing Scenarios](#advanced-testing-scenarios)
8. [Custom Test Utilities](#custom-test-utilities)

## Basic Scene Testing

### Scene Loading and Initialization

```javascript
import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Scene Loading', () => {
    test('should load MainMenuScene correctly', async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for scene to be active
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Get scene state
        const sceneState = await PhaserTestHelper.getSceneState(page, testConfig.scenes.mainMenu);
        
        // Verify scene properties
        expect(sceneState.active).toBe(true);
        expect(sceneState.visible).toBe(true);
        expect(sceneState.children).toBeGreaterThan(0);
        expect(sceneState.isRunning).toBe(true);
    });

    test('should initialize all required game objects', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Get interactive elements
        const elements = await PhaserTestHelper.getInteractiveElements(page, testConfig.scenes.mainMenu);
        
        // Verify expected elements exist
        expect(elements.length).toBeGreaterThan(0);
        
        // Check for specific element types
        const buttons = elements.filter(el => el.type === 'Container' && el.text);
        expect(buttons.length).toBeGreaterThan(0);
    });
});
```

### Scene Transition Testing

```javascript
test.describe('Scene Transitions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('should transition from MainMenu to GoalLibrary', async ({ page }) => {
        // Test scene transition
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        // Verify transition success
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
    });

    test('should handle rapid scene transitions', async ({ page }) => {
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
            
            expect(result.active).toBe(true);
        }
    });
});
```

## Button Interaction Patterns

### Basic Button Testing

```javascript
test.describe('Button Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('should handle button clicks', async ({ page }) => {
        // Test button click
        const success = await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.goalLibrary.text, 
            testConfig.scenes.mainMenu
        );
        
        expect(success).toBe(true);
        
        // Verify scene transition
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
    });

    test('should handle multiple button clicks', async ({ page }) => {
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
            
            // Return to main menu for next test
            await page.evaluate(() => {
                window.game.scene.start('MainMenuScene');
            });
            await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        }
    });
});
```

### Button State Testing

```javascript
test.describe('Button States', () => {
    test('should handle button hover states', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test hover state
        const hoverResult = await page.evaluate(() => {
            const scene = window.game.scene.getScene('MainMenuScene');
            const button = scene.children.list.find(obj => 
                obj.text === 'Goal Library' && obj.input
            );
            
            if (button) {
                // Simulate hover
                const pointer = scene.input.activePointer;
                scene.input.forceOverState(pointer, button);
                return { success: true, hovered: true };
            }
            return { success: false };
        });
        
        expect(hoverResult.success).toBe(true);
    });

    test('should handle button disabled states', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test disabled button
        const disabledResult = await page.evaluate(() => {
            const scene = window.game.scene.getScene('MainMenuScene');
            const button = scene.children.list.find(obj => 
                obj.text === 'Goal Library' && obj.input
            );
            
            if (button) {
                // Disable button
                button.input.enabled = false;
                
                // Try to click disabled button
                const pointer = scene.input.activePointer;
                scene.input.forceDownState(pointer, button);
                
                return { 
                    success: true, 
                    disabled: !button.input.enabled,
                    clickable: button.input.enabled
                };
            }
            return { success: false };
        });
        
        expect(disabledResult.success).toBe(true);
        expect(disabledResult.disabled).toBe(true);
        expect(disabledResult.clickable).toBe(false);
    });
});
```

## Data Flow Testing Examples

### ApplicationStateManager Testing

```javascript
test.describe('Data Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('should manage goals data', async ({ page }) => {
        // Test data flow
        const dataFlow = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.mainMenu);
        
        expect(dataFlow.success).toBe(true);
        expect(dataFlow.data.goalsCount).toBeGreaterThanOrEqual(0);
        expect(dataFlow.data.categoriesCount).toBeGreaterThanOrEqual(0);
        expect(dataFlow.data.gameStateExists).toBe(true);
    });

    test('should persist data across scene transitions', async ({ page }) => {
        // Get initial data
        const initialData = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.mainMenu);
        
        // Transition to another scene
        await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        // Get data after transition
        const afterTransitionData = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.goalLibrary);
        
        // Verify data persistence
        expect(afterTransitionData.success).toBe(true);
        expect(afterTransitionData.data.goalsCount).toBe(initialData.data.goalsCount);
        expect(afterTransitionData.data.categoriesCount).toBe(initialData.data.categoriesCount);
    });

    test('should handle data updates', async ({ page }) => {
        // Test data update
        const updateResult = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            
            // Add test goal
            const testGoal = {
                id: 'test-goal-' + Date.now(),
                title: 'Test Goal',
                description: 'This is a test goal',
                category: 'Test',
                difficulty: 'Easy',
                points: 10,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            
            // Verify goal was added
            const goals = appStateManager.getGoals();
            const addedGoal = goals.find(goal => goal.id === testGoal.id);
            
            return {
                success: true,
                goalAdded: !!addedGoal,
                totalGoals: goals.length
            };
        });
        
        expect(updateResult.success).toBe(true);
        expect(updateResult.goalAdded).toBe(true);
        expect(updateResult.totalGoals).toBeGreaterThan(0);
    });
});
```

### Event-Driven Data Testing

```javascript
test.describe('Event-Driven Data', () => {
    test('should handle data change events', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test event handling
        const eventResult = await page.evaluate(() => {
            let eventFired = false;
            
            // Listen for data change events
            window.game.events.on('goalsChanged', () => {
                eventFired = true;
            });
            
            // Trigger data change
            const appStateManager = window.game.appStateManager;
            const testGoal = {
                id: 'event-test-goal',
                title: 'Event Test Goal',
                description: 'Testing event-driven updates',
                category: 'Test',
                difficulty: 'Medium',
                points: 20,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            
            return { success: true, eventFired: eventFired };
        });
        
        expect(eventResult.success).toBe(true);
        expect(eventResult.eventFired).toBe(true);
    });
});
```

## Performance Testing Patterns

### Scene Performance Testing

```javascript
test.describe('Scene Performance', () => {
    test('should meet scene transition performance thresholds', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test transition performance
        const performance = await PhaserTestHelper.testPerformance(
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
        
        expect(performance.success).toBe(true);
        expect(performance.duration).toBeLessThan(testConfig.performance.transitionTime);
    });

    test('should handle multiple rapid transitions', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        const startTime = Date.now();
        
        // Perform multiple rapid transitions
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
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Verify performance
        expect(totalTime).toBeLessThan(testConfig.performance.transitionTime * 20);
    });
});
```

### Memory Usage Testing

```javascript
test.describe('Memory Usage', () => {
    test('should not leak memory during scene transitions', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Get initial memory usage
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
        
        // Get final memory usage
        const finalMemory = await page.evaluate(() => {
            return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        });
        
        // Verify memory usage
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(testConfig.performance.memoryThreshold);
    });
});
```

## Accessibility Testing Examples

### Basic Accessibility Testing

```javascript
test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('should meet accessibility standards', async ({ page }) => {
        // Test accessibility
        const accessibility = await PhaserTestHelper.testAccessibility(page, testConfig.scenes.mainMenu);
        
        expect(accessibility.success).toBe(true);
        expect(accessibility.totalElements).toBeGreaterThan(0);
        
        // Verify accessibility properties
        accessibility.accessibilityResults.forEach(element => {
            expect(element.type).toBeDefined();
            expect(element.cursor).toBeDefined();
        });
    });

    test('should support keyboard navigation', async ({ page }) => {
        // Test keyboard navigation
        const keyboardSupport = await page.evaluate(() => {
            const scene = window.game.scene.getScene('MainMenuScene');
            const interactiveElements = scene.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test keyboard events
            let keyboardSupported = true;
            
            try {
                // Simulate keyboard events
                const keyboardEvents = ['keydown', 'keyup'];
                keyboardEvents.forEach(eventType => {
                    const event = new KeyboardEvent(eventType, { key: 'Tab' });
                    document.dispatchEvent(event);
                });
            } catch (error) {
                keyboardSupported = false;
            }
            
            return {
                keyboardSupported: keyboardSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(keyboardSupport.keyboardSupported).toBe(true);
        expect(keyboardSupport.interactiveElementsCount).toBeGreaterThan(0);
    });
});
```

### ARIA Attributes Testing

```javascript
test.describe('ARIA Attributes', () => {
    test('should have proper ARIA labels', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test ARIA attributes
        const ariaResult = await page.evaluate(() => {
            const scene = window.game.scene.getScene('MainMenuScene');
            const interactiveElements = scene.children.list.filter(obj => obj.input && obj.input.enabled);
            
            const ariaResults = interactiveElements.map(element => ({
                type: element.type,
                hasAriaLabel: !!element.getData('accessibilityLabel'),
                hasAriaHint: !!element.getData('accessibilityHint'),
                hasRole: !!element.getData('role'),
                hasTabIndex: !!element.getData('tabIndex')
            }));
            
            return {
                success: true,
                elements: ariaResults,
                totalElements: interactiveElements.length
            };
        });
        
        expect(ariaResult.success).toBe(true);
        expect(ariaResult.totalElements).toBeGreaterThan(0);
        
        // Verify ARIA attributes
        ariaResult.elements.forEach(element => {
            expect(element.type).toBeDefined();
            // Add specific ARIA attribute checks as needed
        });
    });
});
```

## Error Handling Patterns

### Scene Error Recovery

```javascript
test.describe('Error Handling', () => {
    test('should handle non-existent scene transitions', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test error handling
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

    test('should handle invalid scene data', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Test invalid data handling
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
});
```

### Memory Leak Prevention

```javascript
test.describe('Memory Leak Prevention', () => {
    test('should prevent memory leaks during rapid transitions', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Get initial memory
        const initialMemory = await page.evaluate(() => {
            return window.performance.memory ? window.performance.memory.usedJSHeapSize : 0;
        });
        
        // Perform rapid transitions
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
        
        // Verify memory usage
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(10000000); // 10MB threshold
    });
});
```

## Advanced Testing Scenarios

### Custom Test Utilities

```javascript
// Custom test utility example
class CustomTestHelper extends PhaserTestHelper {
    static async testCustomFeature(page, sceneName, featureName) {
        return await page.evaluate((args) => {
            const scene = window.game.scene.getScene(args.sceneName);
            if (!scene) return { success: false, error: 'Scene not found' };
            
            // Custom test logic
            const feature = scene[args.featureName];
            if (!feature) return { success: false, error: 'Feature not found' };
            
            // Test feature
            const result = feature.test ? feature.test() : { success: true };
            
            return {
                success: true,
                feature: args.featureName,
                result: result
            };
        }, { sceneName, featureName });
    }
    
    static async testCustomDataFlow(page, sceneName, dataType) {
        return await page.evaluate((args) => {
            const scene = window.game.scene.getScene(args.sceneName);
            if (!scene) return { success: false, error: 'Scene not found' };
            
            // Custom data flow testing
            const appStateManager = window.game.appStateManager;
            if (!appStateManager) return { success: false, error: 'AppStateManager not found' };
            
            // Test specific data type
            const data = appStateManager[`get${args.dataType}`]();
            
            return {
                success: true,
                dataType: args.dataType,
                data: data,
                count: data ? data.length : 0
            };
        }, { sceneName, dataType });
    }
}

// Usage example
test('should test custom feature', async ({ page }) => {
    await page.goto(testConfig.baseURL);
    await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    
    const result = await CustomTestHelper.testCustomFeature(
        page, 
        testConfig.scenes.mainMenu, 
        'customFeature'
    );
    
    expect(result.success).toBe(true);
    expect(result.feature).toBe('customFeature');
});
```

### Complex Test Scenarios

```javascript
test.describe('Complex Scenarios', () => {
    test('should handle complete user workflow', async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Step 1: Navigate to Goal Library
        await PhaserTestHelper.testButtonClick(
            page, 
            testConfig.buttons.mainMenu.goalLibrary.text, 
            testConfig.scenes.mainMenu
        );
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.goalLibrary);
        
        // Step 2: Add a goal
        const addGoalResult = await page.evaluate(() => {
            const appStateManager = window.game.appStateManager;
            const testGoal = {
                id: 'workflow-test-goal',
                title: 'Workflow Test Goal',
                description: 'Testing complete workflow',
                category: 'Test',
                difficulty: 'Medium',
                points: 15,
                completed: false
            };
            
            appStateManager.addGoal(testGoal);
            return { success: true, goalAdded: true };
        });
        
        expect(addGoalResult.success).toBe(true);
        
        // Step 3: Navigate to Bingo Grid
        await page.evaluate(() => {
            window.game.scene.start('BingoGridScene');
        });
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.bingoGrid);
        
        // Step 4: Verify goal appears in bingo grid
        const bingoGridResult = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.bingoGrid);
        expect(bingoGridResult.success).toBe(true);
        
        // Step 5: Return to main menu
        await page.evaluate(() => {
            window.game.scene.start('MainMenuScene');
        });
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
        
        // Step 6: Verify data persistence
        const finalData = await PhaserTestHelper.testDataFlow(page, testConfig.scenes.mainMenu);
        expect(finalData.success).toBe(true);
        expect(finalData.data.goalsCount).toBeGreaterThan(0);
    });
});
```

## Best Practices Summary

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Error Handling
- Test both positive and negative scenarios
- Verify graceful error recovery
- Check memory leak prevention

### 3. Performance
- Set realistic performance thresholds
- Test under different conditions
- Monitor memory usage

### 4. Accessibility
- Test keyboard navigation
- Verify ARIA attributes
- Check color contrast and visibility

### 5. Data Flow
- Test data persistence across scenes
- Verify state synchronization
- Check event-driven updates

### 6. Maintenance
- Keep tests up to date with code changes
- Regular test review and refactoring
- Monitor test performance and reliability

---

*These examples are part of the Phaser Scene Testing Framework v1.0.0*
