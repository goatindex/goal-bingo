import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test.describe('Browser Console Debug', () => {
    test('Capture all console messages', async ({ page }) => {
        // Navigate to the game
        await page.goto('http://localhost:3001');
        
        // Capture ALL console messages
        const allMessages = [];
        page.on('console', msg => {
            allMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: Date.now()
            });
        });
        
        // Wait for everything to load
        await page.waitForTimeout(8000);
        
        // Log all messages
        console.log('\n=== ALL CONSOLE MESSAGES ===');
        allMessages.forEach(msg => {
            console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
        });
        
        // Check for any error messages
        const errorMessages = allMessages.filter(msg => msg.type === 'error');
        console.log('\n=== ERROR MESSAGES ===');
        errorMessages.forEach(msg => {
            console.log(`[ERROR] ${msg.text}`);
        });
        
        // Check for any warning messages
        const warningMessages = allMessages.filter(msg => msg.type === 'warning');
        console.log('\n=== WARNING MESSAGES ===');
        warningMessages.forEach(msg => {
            console.log(`[WARNING] ${msg.text}`);
        });
        
        // Basic check
        expect(allMessages.length).toBeGreaterThan(0);
    });
});

