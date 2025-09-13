const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Debug Manager Initialization', async ({ page }) => {
  const consoleLogs = [];
  
  // Capture console logs
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize
  await page.waitForTimeout(8000);
  
  // Check manager status
  const managerStatus = await page.evaluate(() => {
    return {
      gameExists: typeof window.game !== 'undefined',
      stateManagerExists: typeof window.stateManager !== 'undefined',
      storageManagerExists: typeof window.storageManager !== 'undefined',
      gameStateManager: typeof window.game?.stateManager !== 'undefined',
      gameStorageManager: typeof window.game?.storageManager !== 'undefined',
      stateManagerInitialized: window.stateManager?.isInitialized || false,
      storageManagerInitialized: window.storageManager?.isInitialized || false
    };
  });
  
  console.log('Manager status:', managerStatus);
  
  // Print all console logs
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // The test will pass regardless
  expect(true).toBe(true);
});
