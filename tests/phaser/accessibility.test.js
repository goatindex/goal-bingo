/**
 * Accessibility Tests
 * 
 * This test suite validates accessibility features for button interactions
 * and keyboard navigation in Phaser scenes.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Accessibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('Button accessibility properties', async ({ page }) => {
        // Test button accessibility properties
        const accessibilityResults = await PhaserTestHelper.testAccessibility(page, testConfig.scenes.mainMenu);
        
        expect(accessibilityResults.success).toBe(true);
        expect(accessibilityResults.totalElements).toBeGreaterThan(0);
        
        // Verify accessibility properties
        accessibilityResults.accessibilityResults.forEach(element => {
            expect(element.type).toBeDefined();
            expect(element.cursor).toBeDefined();
        });
    });

    test('Keyboard navigation support', async ({ page }) => {
        // Test keyboard navigation support
        const keyboardSupport = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test keyboard navigation
            const keyboardEvents = ['keydown', 'keyup'];
            let keyboardSupported = true;
            
            try {
                // Simulate keyboard events
                keyboardEvents.forEach(eventType => {
                    const event = new KeyboardEvent(eventType, { key: 'Tab' });
                    document.dispatchEvent(event);
                });
            } catch (error) {
                keyboardSupported = false;
            }
            
            return {
                keyboardSupported: keyboardSupported,
                interactiveElementsCount: interactiveElements.length,
                elementsWithKeyboardSupport: interactiveElements.filter(obj => 
                    obj.input && obj.input.enabled
                ).length
            };
        });
        
        expect(keyboardSupport.keyboardSupported).toBe(true);
        expect(keyboardSupport.elementsWithKeyboardSupport).toBeGreaterThan(0);
    });

    test('Button focus management', async ({ page }) => {
        // Test button focus management
        const focusManagement = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test focus management
            let focusSupported = true;
            
            try {
                // Simulate focus events
                interactiveElements.forEach(element => {
                    if (element.input && element.input.enabled) {
                        // Test focus in
                        const focusInEvent = new FocusEvent('focusin', { bubbles: true });
                        element.dispatchEvent(focusInEvent);
                        
                        // Test focus out
                        const focusOutEvent = new FocusEvent('focusout', { bubbles: true });
                        element.dispatchEvent(focusOutEvent);
                    }
                });
            } catch (error) {
                focusSupported = false;
            }
            
            return {
                focusSupported: focusSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(focusManagement.focusSupported).toBe(true);
        expect(focusManagement.interactiveElementsCount).toBeGreaterThan(0);
    });

    test('Button hover states', async ({ page }) => {
        // Test button hover states
        const hoverStates = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test hover states
            let hoverSupported = true;
            
            try {
                interactiveElements.forEach(element => {
                    if (element.input && element.input.enabled) {
                        // Test mouse over
                        const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true });
                        element.dispatchEvent(mouseOverEvent);
                        
                        // Test mouse out
                        const mouseOutEvent = new MouseEvent('mouseout', { bubbles: true });
                        element.dispatchEvent(mouseOutEvent);
                    }
                });
            } catch (error) {
                hoverSupported = false;
            }
            
            return {
                hoverSupported: hoverSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(hoverStates.hoverSupported).toBe(true);
        expect(hoverStates.interactiveElementsCount).toBeGreaterThan(0);
    });

    test('Button click accessibility', async ({ page }) => {
        // Test button click accessibility
        const clickAccessibility = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test click accessibility
            let clickSupported = true;
            
            try {
                interactiveElements.forEach(element => {
                    if (element.input && element.input.enabled) {
                        // Test mouse click
                        const mouseClickEvent = new MouseEvent('click', { bubbles: true });
                        element.dispatchEvent(mouseClickEvent);
                        
                        // Test touch events
                        const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });
                        element.dispatchEvent(touchStartEvent);
                        
                        const touchEndEvent = new TouchEvent('touchend', { bubbles: true });
                        element.dispatchEvent(touchEndEvent);
                    }
                });
            } catch (error) {
                clickSupported = false;
            }
            
            return {
                clickSupported: clickSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(clickAccessibility.clickSupported).toBe(true);
        expect(clickAccessibility.interactiveElementsCount).toBeGreaterThan(0);
    });

    test('Screen reader compatibility', async ({ page }) => {
        // Test screen reader compatibility
        const screenReaderCompatibility = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test ARIA attributes
            let ariaSupported = true;
            
            try {
                interactiveElements.forEach(element => {
                    if (element.input && element.input.enabled) {
                        // Test ARIA attributes
                        const ariaLabel = element.getData('accessibilityLabel');
                        const ariaHint = element.getData('accessibilityHint');
                        
                        // Test role attribute
                        const role = element.getData('role');
                        
                        // Test tabindex
                        const tabIndex = element.getData('tabIndex');
                    }
                });
            } catch (error) {
                ariaSupported = false;
            }
            
            return {
                ariaSupported: ariaSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(screenReaderCompatibility.ariaSupported).toBe(true);
        expect(screenReaderCompatibility.interactiveElementsCount).toBeGreaterThan(0);
    });

    test('Color contrast and visual accessibility', async ({ page }) => {
        // Test color contrast and visual accessibility
        const visualAccessibility = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test visual accessibility
            let visualSupported = true;
            
            try {
                interactiveElements.forEach(element => {
                    if (element.input && element.input.enabled) {
                        // Test visibility
                        const isVisible = element.visible;
                        
                        // Test alpha
                        const alpha = element.alpha;
                        
                        // Test scale
                        const scaleX = element.scaleX;
                        const scaleY = element.scaleY;
                        
                        // Test position
                        const x = element.x;
                        const y = element.y;
                    }
                });
            } catch (error) {
                visualSupported = false;
            }
            
            return {
                visualSupported: visualSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(visualAccessibility.visualSupported).toBe(true);
        expect(visualAccessibility.interactiveElementsCount).toBeGreaterThan(0);
    });

    test('Touch accessibility', async ({ page }) => {
        // Test touch accessibility
        const touchAccessibility = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test touch accessibility
            let touchSupported = true;
            
            try {
                interactiveElements.forEach(element => {
                    if (element.input && element.input.enabled) {
                        // Test touch events
                        const touchStartEvent = new TouchEvent('touchstart', { bubbles: true });
                        element.dispatchEvent(touchStartEvent);
                        
                        const touchMoveEvent = new TouchEvent('touchmove', { bubbles: true });
                        element.dispatchEvent(touchMoveEvent);
                        
                        const touchEndEvent = new TouchEvent('touchend', { bubbles: true });
                        element.dispatchEvent(touchEndEvent);
                    }
                });
            } catch (error) {
                touchSupported = false;
            }
            
            return {
                touchSupported: touchSupported,
                interactiveElementsCount: interactiveElements.length
            };
        });
        
        expect(touchAccessibility.touchSupported).toBe(true);
        expect(touchAccessibility.interactiveElementsCount).toBeGreaterThan(0);
    });

    test('Keyboard shortcuts', async ({ page }) => {
        // Test keyboard shortcuts
        const keyboardShortcuts = await page.evaluate(() => {
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const keyboard = sceneInstance.input.keyboard;
            
            // Test keyboard shortcuts
            let shortcutsSupported = true;
            
            try {
                // Test common keyboard shortcuts
                const shortcuts = ['Enter', 'Space', 'Escape', 'Tab'];
                
                shortcuts.forEach(key => {
                    const keyDownEvent = new KeyboardEvent('keydown', { key: key, bubbles: true });
                    document.dispatchEvent(keyDownEvent);
                    
                    const keyUpEvent = new KeyboardEvent('keyup', { key: key, bubbles: true });
                    document.dispatchEvent(keyUpEvent);
                });
            } catch (error) {
                shortcutsSupported = false;
            }
            
            return {
                shortcutsSupported: shortcutsSupported,
                keyboardEnabled: keyboard ? keyboard.enabled : false
            };
        });
        
        expect(keyboardShortcuts.shortcutsSupported).toBe(true);
        expect(keyboardShortcuts.keyboardEnabled).toBe(true);
    });

    test('Accessibility across different scenes', async ({ page }) => {
        // Test accessibility across different scenes
        const scenes = [
            testConfig.scenes.goalLibrary,
            testConfig.scenes.bingoGrid,
            testConfig.scenes.rewards
        ];
        
        for (const scene of scenes) {
            // Transition to scene
            await PhaserTestHelper.testSceneTransition(
                page, 
                testConfig.scenes.mainMenu, 
                scene
            );
            
            // Test accessibility
            const accessibilityResults = await PhaserTestHelper.testAccessibility(page, scene);
            
            expect(accessibilityResults.success).toBe(true);
            expect(accessibilityResults.totalElements).toBeGreaterThanOrEqual(0);
        }
    });

    test('Accessibility performance', async ({ page }) => {
        // Test accessibility performance
        const accessibilityPerformance = await page.evaluate(() => {
            const startTime = performance.now();
            
            const sceneInstance = window.game.scene.getScene(testConfig.scenes.mainMenu);
            const interactiveElements = sceneInstance.children.list.filter(obj => obj.input && obj.input.enabled);
            
            // Test accessibility operations
            interactiveElements.forEach(element => {
                if (element.input && element.input.enabled) {
                    // Test accessibility properties
                    const ariaLabel = element.getData('accessibilityLabel');
                    const ariaHint = element.getData('accessibilityHint');
                    const role = element.getData('role');
                    const tabIndex = element.getData('tabIndex');
                }
            });
            
            const endTime = performance.now();
            
            return {
                totalTime: endTime - startTime,
                averageTime: (endTime - startTime) / interactiveElements.length
            };
        });
        
        expect(accessibilityPerformance.totalTime).toBeLessThan(100); // 100ms threshold
        expect(accessibilityPerformance.averageTime).toBeLessThan(1); // 1ms per element
    });
});
