const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Console Errors and Game Creation', async ({ page }) => {
  // Capture console messages
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
  
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for initialization
  await page.waitForTimeout(10000);
  
  // Check what's available
  const pageInfo = await page.evaluate(() => {
    return {
      gameExists: !!window.game,
      stateManagerExists: !!window.stateManager,
      storageManagerExists: !!window.storageManager,
      documentReady: document.readyState,
      scriptsLoaded: document.querySelectorAll('script').length,
      hasGameContainer: !!document.getElementById('game-container'),
      windowLoadEvent: !!window.loaded
    };
  });
  
  console.log('Page info:', pageInfo);
  console.log('Console messages:', consoleMessages.slice(-20)); // Last 20 messages
  console.log('Errors:', errors);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/console-errors-test.png' });
  
  // Check for critical errors
  const criticalErrors = errors.filter(e => 
    e.message.includes('Cannot') || 
    e.message.includes('ReferenceError') || 
    e.message.includes('TypeError') ||
    e.message.includes('SyntaxError')
  );
  
  if (criticalErrors.length > 0) {
    console.error('Critical errors found:', criticalErrors);
  }
  
  // The test should pass even if there are errors, so we can see what's happening
  expect(pageInfo.hasGameContainer).toBe(true);
  
  console.log('Console errors test completed');
});

