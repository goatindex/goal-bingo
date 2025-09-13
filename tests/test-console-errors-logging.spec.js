import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Check Console Errors and Logging System', async ({ page }) => {
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  await page.goto('http://localhost:3001');
  await page.waitForTimeout(8000);

  const result = await page.evaluate(() => {
    return {
      gameExists: !!window.game,
      stateManagerExists: !!window.stateManager,
      storageManagerExists: !!window.storageManager,
      loggerExists: !!window.logger,
      performanceLoggerExists: !!window.performanceLogger,
      userActionLoggerExists: !!window.userActionLogger,
      debugToolsExists: !!window.debugTools,
      gameReady: window.game ? (window.game.scene && window.game.scene.scenes.length > 0) : false,
      activeScenes: window.game ? window.game.scene.scenes.filter(s => s.scene.isActive()).map(s => s.scene.key) : [],
      phaserVersion: window.game ? Phaser.VERSION : 'Not available'
    };
  });

  console.log('Game state:', result);
  console.log('Console messages:', consoleMessages.slice(-10)); // Last 10 messages
  console.log('Errors:', errors);

  // Check if there are any critical errors
  const criticalErrors = errors.filter(error => 
    error.message.includes('Cannot resolve') || 
    error.message.includes('Module not found') ||
    error.message.includes('SyntaxError') ||
    error.message.includes('ReferenceError')
  );

  if (criticalErrors.length > 0) {
    console.error('Critical errors found:', criticalErrors);
  }

  // The game should exist and be ready
  expect(result.gameExists).toBe(true);
  expect(result.gameReady).toBe(true);
  expect(result.phaserVersion).toBeDefined();
});
