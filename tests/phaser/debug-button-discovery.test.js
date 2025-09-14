/**
 * Debug Button Discovery Test
 * 
 * This test helps debug button discovery issues by using the new debugging methods
 * in PhaserTestHelper to understand what buttons are actually found.
 */

import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Debug Button Discovery', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto(testConfig.baseURL);
        
        // Wait for Phaser game to initialize
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('Debug button discovery in MainMenuScene', async ({ page }) => {
        // Use our new debugging method
        const debugInfo = await PhaserTestHelper.debugButtonDiscovery(page, testConfig.scenes.mainMenu);
        
        console.log('=== DEBUG BUTTON DISCOVERY ===');
        console.log('Total children:', debugInfo.totalChildren);
        console.log('Interactive elements:', debugInfo.interactiveElements);
        console.log('Text elements:', debugInfo.textElements);
        
        // Test finding specific buttons
        const goalLibraryButton = await PhaserTestHelper.findButtonByText(page, 'Goal Library', testConfig.scenes.mainMenu);
        console.log('Goal Library button found:', goalLibraryButton);
        
        const playBingoButton = await PhaserTestHelper.findButtonByText(page, 'Play Bingo', testConfig.scenes.mainMenu);
        console.log('Play Bingo button found:', playBingoButton);
        
        const rewardsButton = await PhaserTestHelper.findButtonByText(page, '🏆 Rewards', testConfig.scenes.mainMenu);
        console.log('Rewards button found:', rewardsButton);
        
        // Basic assertions
        expect(debugInfo.totalChildren).toBeGreaterThan(0);
        expect(debugInfo.interactiveElements.length).toBeGreaterThan(0);
        expect(debugInfo.textElements.length).toBeGreaterThan(0);
    });
});
