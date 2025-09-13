import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test.describe('Scene Logger Initialization', () => {
    test('Check if SceneStateLogger is properly initialized', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Wait for game to load
        await page.waitForTimeout(5000);
        
        // Check if SceneStateLogger is available
        const loggerStatus = await page.evaluate(() => {
            return {
                game: !!window.game,
                sceneStateLogger: !!window.sceneStateLogger,
                gameSceneStateLogger: !!(window.game && window.game.sceneStateLogger),
                allSystems: {
                    stateManager: !!window.stateManager,
                    storageManager: !!window.storageManager,
                    logger: !!window.logger,
                    performanceLogger: !!window.performanceLogger,
                    userActionLogger: !!window.userActionLogger,
                    debugTools: !!window.debugTools,
                    sceneStateLogger: !!window.sceneStateLogger
                }
            };
        });
        
        console.log('Logger Status:', JSON.stringify(loggerStatus, null, 2));
        
        // Check console for any errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Wait a bit more to catch any delayed errors
        await page.waitForTimeout(2000);
        
        console.log('Console Errors:', consoleErrors);
        
        // Basic assertions
        expect(loggerStatus.game).toBe(true);
        expect(loggerStatus.sceneStateLogger).toBe(true);
        expect(loggerStatus.gameSceneStateLogger).toBe(true);
        
        // Check if all systems are initialized
        expect(loggerStatus.allSystems.stateManager).toBe(true);
        expect(loggerStatus.allSystems.storageManager).toBe(true);
        expect(loggerStatus.allSystems.logger).toBe(true);
        expect(loggerStatus.allSystems.sceneStateLogger).toBe(true);
    });
    
    test('Test scene transition with logging', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Wait for game to load
        await page.waitForTimeout(5000);
        
        // Set up console monitoring
        const sceneLogs = [];
        page.on('console', msg => {
            if (msg.text().includes('Scene Transition') || msg.text().includes('Scene Manager Event') || msg.text().includes('Scene Event')) {
                sceneLogs.push({
                    type: msg.type(),
                    text: msg.text(),
                    timestamp: Date.now()
                });
            }
        });
        
        // Try to click Goal Library button
        try {
            await page.click('text=📚 Goal Library', { timeout: 10000 });
            
            // Wait for transition
            await page.waitForTimeout(3000);
            
            // Try to click back button
            await page.click('text=← Back', { timeout: 10000 });
            
            // Wait for transition back
            await page.waitForTimeout(3000);
            
        } catch (error) {
            console.log('Click error:', error.message);
        }
        
        // Log all scene-related console messages
        console.log('\n=== SCENE TRANSITION LOGS ===');
        sceneLogs.forEach(log => {
            console.log(`[${log.type.toUpperCase()}] ${log.text}`);
        });
        
        // Check if we have any scene logs
        expect(sceneLogs.length).toBeGreaterThan(0);
    });
});

