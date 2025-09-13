import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test.describe('System Initialization Debug', () => {
    test('Debug system initialization process', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Wait for game to load
        await page.waitForTimeout(5000);
        
        // Check if the READY event is firing
        const readyEventStatus = await page.evaluate(() => {
            return {
                game: !!window.game,
                gameEvents: window.game ? !!window.game.events : false,
                gameReady: window.game ? window.game.isReady : false,
                hasReadyListener: false
            };
        });
        
        console.log('Ready Event Status:', JSON.stringify(readyEventStatus, null, 2));
        
        // Check console for any initialization errors
        const consoleMessages = [];
        page.on('console', msg => {
            if (msg.text().includes('Game READY') || msg.text().includes('Creating') || msg.text().includes('Failed to initialize') || msg.text().includes('Error')) {
                consoleMessages.push({
                    type: msg.type(),
                    text: msg.text(),
                    timestamp: Date.now()
                });
            }
        });
        
        // Wait a bit more to catch any delayed messages
        await page.waitForTimeout(3000);
        
        console.log('\n=== INITIALIZATION CONSOLE MESSAGES ===');
        consoleMessages.forEach(msg => {
            console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
        });
        
        // Check if systems are available after waiting
        const finalStatus = await page.evaluate(() => {
            return {
                game: !!window.game,
                stateManager: !!window.stateManager,
                storageManager: !!window.storageManager,
                logger: !!window.logger,
                sceneStateLogger: !!window.sceneStateLogger,
                allWindowProperties: Object.keys(window).filter(key => key.includes('Manager') || key.includes('Logger') || key.includes('Tools'))
            };
        });
        
        console.log('Final Status:', JSON.stringify(finalStatus, null, 2));
        
        // Basic check
        expect(readyEventStatus.game).toBe(true);
    });
});

