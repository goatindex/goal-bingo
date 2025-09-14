/**
 * PhaserTestHelper - Utility class for testing Phaser scenes with Playwright
 * 
 * This class provides methods to interact with Phaser games through Playwright's
 * page.evaluate() method, following both Phaser and Playwright best practices.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

export class PhaserTestHelper {
    /**
     * Check if a character is an emoji
     * @param {string} char - Character to check
     * @returns {boolean} True if character is an emoji
     */
    static isEmoji(char) {
        // Comprehensive emoji detection using Unicode ranges
        return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(char);
    }

    /**
     * Enhanced text matching for buttons with emoji prefixes
     * @param {string} textObject - Text from the scene object
     * @param {string} buttonText - Text we're looking for
     * @returns {boolean} True if text matches
     */
    static matchesButtonText(textObject, buttonText) {
        // Exact match
        if (textObject === buttonText) return true;
        
        // Check if text ends with the button text (handles emoji prefixes)
        if (textObject.endsWith(buttonText) && textObject.length > buttonText.length) {
            // Check if the prefix is an emoji (single character before space)
            const prefix = textObject.substring(0, textObject.length - buttonText.length - 1);
            if (prefix.length === 1 && this.isEmoji(prefix)) {
                return true;
            }
        }
        
        // Check if text contains the button text (fallback)
        if (textObject.includes(buttonText)) return true;
        
        return false;
    }

    /**
     * Wait for a specific scene to become active
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Name of the scene to wait for
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {Promise<void>}
     */
    static async waitForScene(page, sceneName, timeout = 5000) {
        await page.waitForFunction(
            (scene) => window.game?.scene?.isActive(scene),
            sceneName,
            { timeout }
        );
    }

    /**
     * Get comprehensive scene state information
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Name of the scene to inspect
     * @returns {Promise<Object>} Scene state object
     */
    static async getSceneState(page, sceneName) {
        return await page.evaluate((scene) => {
            const sceneInstance = window.game.scene.getScene(scene);
            return {
                active: window.game.scene.isActive(scene),
                visible: window.game.scene.isVisible(scene),
                children: sceneInstance?.children?.list?.length || 0,
                state: sceneInstance?.sys?.settings?.status || 'unknown',
                isRunning: sceneInstance?.sys?.isActive() || false,
                isVisible: sceneInstance?.sys?.isVisible() || false
            };
        }, sceneName);
    }

    /**
     * Test scene transition from one scene to another
     * @param {Page} page - Playwright page object
     * @param {string} fromScene - Source scene name
     * @param {string} toScene - Target scene name
     * @returns {Promise<Object>} Target scene state after transition
     */
    static async testSceneTransition(page, fromScene, toScene) {
        // Ensure we're on the source scene
        await this.waitForScene(page, fromScene);
        
        // Trigger transition using Phaser's native API
        await page.evaluate((scene) => {
            window.game.scene.start(scene);
        }, toScene);
        
        // Wait for transition to complete
        await this.waitForScene(page, toScene);
        
        // Return target scene state
        return await this.getSceneState(page, toScene);
    }

    /**
     * Test button click using Phaser's force input methods
     * @param {Page} page - Playwright page object
     * @param {string} buttonText - Text content of the button to click
     * @param {string} sceneName - Scene containing the button
     * @returns {Promise<boolean>} Success status
     */
    static async testButtonClick(page, buttonText, sceneName) {
        return await page.evaluate(({ text, scene }) => {
            const sceneInstance = window.game.scene.getScene(scene);
            if (!sceneInstance) return false;

            // Enhanced text matching with comprehensive emoji prefix handling
            const textObject = sceneInstance.children.list.find(obj => {
                if (obj.type !== 'Text') return false;
                
                const objText = obj.text;
                
                // Exact match
                if (objText === text) return true;
                
                // Check if text ends with the button text (handles emoji prefixes)
                if (objText.endsWith(text) && objText.length > text.length) {
                    // Check if the prefix is an emoji (single character before space)
                    const prefix = objText.substring(0, objText.length - text.length - 1);
                    if (prefix.length === 1 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(prefix)) {
                        return true;
                    }
                }
                
                // Check if text contains the button text (fallback)
                if (objText.includes(text)) return true;
                
                return false;
            });
            
            if (!textObject) return false;

            // Find associated interactive rectangle
            const button = sceneInstance.children.list.find(obj => 
                obj.type === 'Rectangle' && 
                obj.input && obj.input.enabled &&
                Math.abs(obj.x - textObject.x) < 10 && 
                Math.abs(obj.y - textObject.y) < 10
            );

            if (button) {
                // Use Phaser's force input methods with correct sequence
                const pointer = sceneInstance.input.activePointer;
                sceneInstance.input.forceDownState(pointer, button);
                sceneInstance.input.forceUpState(pointer, button);
                return true;
            }
            return false;
        }, { text: buttonText, scene: sceneName });
    }

    /**
     * Get all interactive elements in a scene
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Scene to inspect
     * @returns {Promise<Array>} Array of interactive elements
     */
    static async getInteractiveElements(page, sceneName) {
        return await page.evaluate((scene) => {
            const sceneInstance = window.game.scene.getScene(scene);
            if (!sceneInstance) return [];

            return sceneInstance.children.list
                .filter(obj => obj.input && obj.input.enabled)
                .map(obj => ({
                    type: obj.type,
                    text: obj.text || 'unnamed',
                    x: obj.x,
                    y: obj.y,
                    visible: obj.visible,
                    active: obj.active
                }));
        }, sceneName);
    }

    /**
     * Test scene loading and initialization
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Scene to test
     * @returns {Promise<Object>} Loading test results
     */
    static async testSceneLoading(page, sceneName) {
        const startTime = Date.now();
        
        // Wait for scene to be active
        await this.waitForScene(page, sceneName);
        
        const loadTime = Date.now() - startTime;
        const sceneState = await this.getSceneState(page, sceneName);
        
        return {
            sceneName,
            loadTime,
            success: sceneState.active && sceneState.children > 0,
            sceneState
        };
    }

    /**
     * Test data flow between scenes using ApplicationStateManager
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Scene to test
     * @returns {Promise<Object>} Data flow test results
     */
    static async testDataFlow(page, sceneName) {
        return await page.evaluate((scene) => {
            const sceneInstance = window.game.scene.getScene(scene);
            if (!sceneInstance) return { success: false, error: 'Scene not found' };

            try {
                // Test ApplicationStateManager access
                const appStateManager = window.game.appStateManager;
                if (!appStateManager) {
                    return { success: false, error: 'ApplicationStateManager not available' };
                }

                // Test data access
                const goals = appStateManager.getGoals();
                const categories = appStateManager.getCategories();
                const gameState = appStateManager.getGameState();

                return {
                    success: true,
                    data: {
                        goalsCount: goals ? goals.length : 0,
                        categoriesCount: categories ? categories.length : 0,
                        gameStateExists: !!gameState
                    }
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }, sceneName);
    }

    /**
     * Test performance metrics for scene operations
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Scene to test
     * @param {Function} operation - Operation to measure
     * @returns {Promise<Object>} Performance metrics
     */
    static async testPerformance(page, sceneName, operation) {
        const startTime = performance.now();
        
        try {
            await operation();
            const endTime = performance.now();
            
            return {
                success: true,
                duration: endTime - startTime,
                sceneName
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                sceneName
            };
        }
    }

    /**
     * Test accessibility features
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Scene to test
     * @returns {Promise<Object>} Accessibility test results
     */
    static async testAccessibility(page, sceneName) {
        return await page.evaluate((scene) => {
            const sceneInstance = window.game.scene.getScene(scene);
            if (!sceneInstance) return { success: false, error: 'Scene not found' };

            const interactiveElements = sceneInstance.children.list
                .filter(obj => obj.input && obj.input.enabled);

            const accessibilityResults = interactiveElements.map(element => ({
                type: element.type,
                hasData: !!element.data,
                hasAccessibilityLabel: !!element.data?.get('accessibilityLabel'),
                hasAccessibilityHint: !!element.data?.get('accessibilityHint'),
                cursor: element.input?.cursor || 'default'
            }));

            return {
                success: true,
                totalElements: interactiveElements.length,
                accessibilityResults
            };
        }, sceneName);
    }

    /**
     * Debug button discovery - helps identify button structure issues
     * @param {Page} page - Playwright page object
     * @param {string} sceneName - Scene to debug
     * @returns {Promise<Object>} Debug information about buttons and text objects
     */
    static async debugButtonDiscovery(page, sceneName) {
        return await page.evaluate((scene) => {
            const sceneInstance = window.game.scene.getScene(scene);
            if (!sceneInstance) return { error: 'Scene not found' };

            const interactiveElements = sceneInstance.children.list
                .filter(obj => obj.input && obj.input.enabled)
                .map(obj => ({
                    type: obj.type,
                    text: obj.text || 'no text',
                    x: obj.x,
                    y: obj.y,
                    hasInput: !!obj.input,
                    inputEnabled: obj.input?.enabled
                }));

            const textElements = sceneInstance.children.list
                .filter(obj => obj.type === 'Text')
                .map(obj => ({
                    text: obj.text,
                    x: obj.x,
                    y: obj.y
                }));

            return {
                interactiveElements,
                textElements,
                totalChildren: sceneInstance.children.list.length
            };
        }, sceneName);
    }

    /**
     * Find button by text content with detailed information
     * @param {Page} page - Playwright page object
     * @param {string} buttonText - Text content of the button to find
     * @param {string} sceneName - Scene containing the button
     * @returns {Promise<Object|null>} Button information or null if not found
     */
    static async findButtonByText(page, buttonText, sceneName) {
        return await page.evaluate(({ text, scene }) => {
            const sceneInstance = window.game.scene.getScene(scene);
            if (!sceneInstance) return null;

            // Enhanced text matching with comprehensive emoji prefix handling
            const textObject = sceneInstance.children.list.find(obj => {
                if (obj.type !== 'Text') return false;
                
                const objText = obj.text;
                
                // Exact match
                if (objText === text) return true;
                
                // Check if text ends with the button text (handles emoji prefixes)
                if (objText.endsWith(text) && objText.length > text.length) {
                    // Check if the prefix is an emoji (single character before space)
                    const prefix = objText.substring(0, objText.length - text.length - 1);
                    if (prefix.length === 1 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/u.test(prefix)) {
                        return true;
                    }
                }
                
                // Check if text contains the button text (fallback)
                if (objText.includes(text)) return true;
                
                return false;
            });
            
            if (!textObject) return null;

            // Find associated interactive rectangle
            const button = sceneInstance.children.list.find(obj => 
                obj.type === 'Rectangle' && 
                obj.input && obj.input.enabled &&
                Math.abs(obj.x - textObject.x) < 10 && 
                Math.abs(obj.y - textObject.y) < 10
            );

            return button ? {
                button: button,
                text: textObject,
                x: button.x,
                y: button.y,
                type: button.type,
                hasInput: !!button.input,
                inputEnabled: button.input?.enabled
            } : null;
        }, { text: buttonText, scene: sceneName });
    }
}

export default PhaserTestHelper;
