const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Basic Data Setup', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(10000);
  
  // Test basic setup
  const basicSetupResult = await page.evaluate(() => {
    try {
      // Check if game exists
      const gameExists = !!window.game;
      const gameDataEnabled = window.stateManager?.dataManager ? true : false;
      
      // Check if managers exist
      const stateManagerExists = !!window.stateManager;
      const storageManagerExists = !!window.storageManager;
      
      // Check if data is available
      let dataAvailable = false;
      if (gameExists && window.stateManager?.dataManager) {
        dataAvailable = window.stateManager.dataManager.has('appState') || 
                       window.stateManager.dataManager.has('goals') || 
                       window.stateManager.dataManager.has('rewards');
      }
      
      // Check console logs for any errors
      const consoleLogs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        consoleLogs.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      return {
        success: true,
        gameExists: gameExists,
        gameDataEnabled: gameDataEnabled,
        stateManagerExists: stateManagerExists,
        storageManagerExists: storageManagerExists,
        dataAvailable: dataAvailable,
        consoleLogs: consoleLogs.slice(-10), // Last 10 log messages
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  });
  
  console.log('Basic setup result:', basicSetupResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/basic-data-setup-test.png' });
  
  // Verify results
  expect(basicSetupResult.success).toBe(true);
  expect(basicSetupResult.gameExists).toBe(true);
  expect(basicSetupResult.gameDataEnabled).toBe(true);
  expect(basicSetupResult.stateManagerExists).toBe(true);
  expect(basicSetupResult.storageManagerExists).toBe(true);
  
  console.log('Basic data setup test completed');
});
