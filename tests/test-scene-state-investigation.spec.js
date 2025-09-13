import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test.describe('Scene State Investigation', () => {
    test('Investigate scene transition internal state', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Wait for game to load
        await page.waitForTimeout(3000);
        
        // Get initial scene state
        const initialState = await page.evaluate(() => {
            if (!window.game || !window.sceneStateLogger) {
                return { error: 'Game or SceneStateLogger not available' };
            }
            
            const activeScenes = window.sceneStateLogger.getActiveScenes();
            const sceneStates = window.sceneStateLogger.getSceneStates();
            const transitionHistory = window.sceneStateLogger.getTransitionHistory();
            
            return {
                activeScenes: activeScenes.map(s => s.scene.key),
                totalScenes: window.game.scene.scenes.length,
                sceneStates,
                transitionHistory: transitionHistory.slice(-10),
                allScenes: window.game.scene.scenes.map(s => ({
                    key: s.scene.key,
                    isActive: s.scene.isActive(),
                    isVisible: s.scene.isVisible(),
                    isSleeping: s.scene.isSleeping(),
                    isPaused: s.scene.isPaused()
                }))
            };
        });
        
        console.log('Initial State:', JSON.stringify(initialState, null, 2));
        
        // Click Goal Library button
        await page.click('text=📚 Goal Library');
        
        // Wait for transition
        await page.waitForTimeout(2000);
        
        // Get state after transition
        const afterTransitionState = await page.evaluate(() => {
            if (!window.game || !window.sceneStateLogger) {
                return { error: 'Game or SceneStateLogger not available' };
            }
            
            const activeScenes = window.sceneStateLogger.getActiveScenes();
            const sceneStates = window.sceneStateLogger.getSceneStates();
            const transitionHistory = window.sceneStateLogger.getTransitionHistory();
            
            return {
                activeScenes: activeScenes.map(s => s.scene.key),
                totalScenes: window.game.scene.scenes.length,
                sceneStates,
                transitionHistory: transitionHistory.slice(-10),
                allScenes: window.game.scene.scenes.map(s => ({
                    key: s.scene.key,
                    isActive: s.scene.isActive(),
                    isVisible: s.scene.isVisible(),
                    isSleeping: s.scene.isSleeping(),
                    isPaused: s.scene.isPaused()
                }))
            };
        });
        
        console.log('After Transition State:', JSON.stringify(afterTransitionState, null, 2));
        
        // Click back button
        await page.click('text=← Back');
        
        // Wait for transition back
        await page.waitForTimeout(2000);
        
        // Get final state
        const finalState = await page.evaluate(() => {
            if (!window.game || !window.sceneStateLogger) {
                return { error: 'Game or SceneStateLogger not available' };
            }
            
            const activeScenes = window.sceneStateLogger.getActiveScenes();
            const sceneStates = window.sceneStateLogger.getSceneStates();
            const transitionHistory = window.sceneStateLogger.getTransitionHistory();
            
            return {
                activeScenes: activeScenes.map(s => s.scene.key),
                totalScenes: window.game.scene.scenes.length,
                sceneStates,
                transitionHistory: transitionHistory.slice(-10),
                allScenes: window.game.scene.scenes.map(s => ({
                    key: s.scene.key,
                    isActive: s.scene.isActive(),
                    isVisible: s.scene.isVisible(),
                    isSleeping: s.scene.isSleeping(),
                    isPaused: s.scene.isPaused()
                }))
            };
        });
        
        console.log('Final State:', JSON.stringify(finalState, null, 2));
        
        // Log current state for debugging
        await page.evaluate(() => {
            if (window.sceneStateLogger) {
                window.sceneStateLogger.logCurrentState();
            }
        });
        
        // Basic assertions
        expect(initialState.error).toBeUndefined();
        expect(afterTransitionState.error).toBeUndefined();
        expect(finalState.error).toBeUndefined();
        
        // Log the investigation results
        console.log('\n=== SCENE STATE INVESTIGATION RESULTS ===');
        console.log('Initial Active Scenes:', initialState.activeScenes);
        console.log('After Transition Active Scenes:', afterTransitionState.activeScenes);
        console.log('Final Active Scenes:', finalState.activeScenes);
        console.log('\nTransition History:', afterTransitionState.transitionHistory);
        console.log('\nAll Scenes State:', afterTransitionState.allScenes);
    });
    
    test('Monitor scene events in real-time', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Wait for game to load
        await page.waitForTimeout(3000);
        
        // Set up console monitoring
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.text().includes('SceneStateLogger') || msg.text().includes('Scene Manager Event') || msg.text().includes('Scene Event')) {
                consoleLogs.push({
                    type: msg.type(),
                    text: msg.text(),
                    timestamp: Date.now()
                });
            }
        });
        
        // Click Goal Library button
        await page.click('text=📚 Goal Library');
        
        // Wait for transition
        await page.waitForTimeout(2000);
        
        // Click back button
        await page.click('text=← Back');
        
        // Wait for transition back
        await page.waitForTimeout(2000);
        
        // Log all scene-related console messages
        console.log('\n=== REAL-TIME SCENE EVENT LOGS ===');
        consoleLogs.forEach(log => {
            console.log(`[${log.type.toUpperCase()}] ${log.text}`);
        });
        
        // Verify we captured some scene events
        expect(consoleLogs.length).toBeGreaterThan(0);
    });
});

