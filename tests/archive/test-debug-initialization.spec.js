import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test.describe('Debug Initialization', () => {
    test('Debug system initialization', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Wait for game to load
        await page.waitForTimeout(5000);
        
        // Get detailed debug information
        const debugInfo = await page.evaluate(() => {
            const info = {
                game: !!window.game,
                gameReady: window.game ? window.game.isReady : false,
                gameEvents: window.game ? !!window.game.events : false,
                gameScene: window.game ? !!window.game.scene : false,
                allWindowProperties: Object.keys(window).filter(key => key.includes('Manager') || key.includes('Logger') || key.includes('Tools')),
                consoleLogs: []
            };
            
            // Check if systems are attached to game
            if (window.game) {
                info.gameProperties = Object.keys(window.game).filter(key => key.includes('Manager') || key.includes('Logger') || key.includes('Tools'));
                info.sceneManager = !!window.game.scene;
                info.sceneEvents = window.game.scene ? !!window.game.scene.events : false;
            }
            
            return info;
        });
        
        console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
        
        // Also check console for any errors
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: Date.now()
            });
        });
        
        // Wait a bit more to catch any delayed messages
        await page.waitForTimeout(2000);
        
        console.log('\n=== CONSOLE MESSAGES ===');
        consoleMessages.forEach(msg => {
            console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
        });
        
        // Basic check
        expect(debugInfo.game).toBe(true);
    });
});

