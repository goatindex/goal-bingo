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

            // Find button by text content
            const button = sceneInstance.children.list.find(obj => 
                obj.text === text && obj.input && obj.input.enabled
            );
            
            if (button) {
                // Use Phaser's force input methods
                const pointer = sceneInstance.input.activePointer;
                sceneInstance.input.forceDownState(pointer, button);
                sceneInstance.input.forceOutState(pointer, button);
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
}

export default PhaserTestHelper;
