import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Simple Logging Test', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    try {
      return {
        game: !!window.game,
        logger: !!window.logger,
        stateManager: !!window.stateManager,
        storageManager: !!window.storageManager,
        performanceLogger: !!window.performanceLogger,
        userActionLogger: !!window.userActionLogger,
        debugTools: !!window.debugTools,
        error: null
      };
    } catch (error) {
      return {
        game: false,
        logger: false,
        stateManager: false,
        storageManager: false,
        performanceLogger: false,
        userActionLogger: false,
        debugTools: false,
        error: error.message
      };
    }
  });

  console.log('Simple logging test result:', result);
  
  // At minimum, the game should exist
  expect(result.game).toBe(true);
  
  // If there's an error, log it
  if (result.error) {
    console.error('Error in logging system:', result.error);
  }
});

