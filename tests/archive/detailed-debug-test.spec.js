const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Detailed Debug - Check console logs and errors', async ({ page }) => {
  const consoleLogs = [];
  const errors = [];
  
  // Capture console logs
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  // Capture JavaScript errors
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait a bit more for any async initialization
  await page.waitForTimeout(5000);
  
  // Check the game container visibility
  const gameContainer = await page.locator('#game-container');
  const isVisible = await gameContainer.isVisible();
  const boundingBox = await gameContainer.boundingBox();
  
  console.log('Game container visible:', isVisible);
  console.log('Game container bounding box:', boundingBox);
  
  // Check if Phaser is loaded
  const phaserInfo = await page.evaluate(() => {
    return {
      phaserLoaded: typeof window.Phaser !== 'undefined',
      phaserVersion: window.Phaser?.VERSION || 'not loaded',
      gameExists: typeof window.game !== 'undefined',
      stateManagerExists: typeof window.stateManager !== 'undefined',
      storageManagerExists: typeof window.storageManager !== 'undefined',
      gameInitialized: window.game?.isBooted || false,
      activeScene: window.game?.scene?.manager?.getActiveScene()?.scene?.key || 'none'
    };
  });
  
  console.log('Phaser info:', phaserInfo);
  
  // Check for any error messages in the DOM
  const errorElements = await page.locator('text=/error/i').all();
  console.log('Error elements found:', errorElements.length);
  
  // Check the body content
  const bodyContent = await page.locator('body').textContent();
  console.log('Body content length:', bodyContent.length);
  console.log('Body content preview:', bodyContent.substring(0, 200));
  
  // Check if there are any script tags that failed to load
  const scriptTags = await page.locator('script').all();
  console.log('Script tags found:', scriptTags.length);
  
  // Check for any network errors
  const networkErrors = [];
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  // Print all console logs
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // Print all errors
  console.log('\n=== ERRORS ===');
  errors.forEach(error => {
    console.log(`Error: ${error.message}`);
    if (error.stack) {
      console.log(`Stack: ${error.stack}`);
    }
  });
  
  // Print network errors
  console.log('\n=== NETWORK ERRORS ===');
  networkErrors.forEach(error => {
    console.log(`Network error: ${error.status} ${error.statusText} - ${error.url}`);
  });
  
  // Take a final screenshot
  await page.screenshot({ path: 'tests/outputs/detailed-debug-screenshot.png' });
  
  // The test will pass regardless of the issues found
  expect(true).toBe(true);
});
