const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Debug Goal Bingo - Check for initialization issues', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot to see what's visible
  await page.screenshot({ path: 'tests/outputs/debug-screenshot.png' });
  
  // Check if the game container exists
  const gameContainer = await page.locator('#game-container');
  await expect(gameContainer).toBeVisible();
  
  // Check if Phaser is loaded
  const phaserLoaded = await page.evaluate(() => {
    return typeof window.Phaser !== 'undefined';
  });
  console.log('Phaser loaded:', phaserLoaded);
  
  // Check if the game object exists
  const gameExists = await page.evaluate(() => {
    return typeof window.game !== 'undefined';
  });
  console.log('Game object exists:', gameExists);
  
  // Check if StateManager exists
  const stateManagerExists = await page.evaluate(() => {
    return typeof window.stateManager !== 'undefined';
  });
  console.log('StateManager exists:', stateManagerExists);
  
  // Check if StorageManager exists
  const storageManagerExists = await page.evaluate(() => {
    return typeof window.storageManager !== 'undefined';
  });
  console.log('StorageManager exists:', storageManagerExists);
  
  // Check for JavaScript errors
  const errors = await page.evaluate(() => {
    return window.errors || [];
  });
  console.log('JavaScript errors:', errors);
  
  // Check console logs
  page.on('console', msg => {
    console.log('Console log:', msg.text());
  });
  
  // Check for any error messages in the page
  const errorMessages = await page.locator('text=/error/i').count();
  console.log('Error messages found:', errorMessages);
  
  // Wait a bit more to see if anything loads
  await page.waitForTimeout(3000);
  
  // Take another screenshot after waiting
  await page.screenshot({ path: 'tests/outputs/debug-screenshot-after-wait.png' });
  
  // Check if any scenes are active
  const activeScene = await page.evaluate(() => {
    if (window.game && window.game.scene) {
      return window.game.scene.getActiveScene()?.scene.key;
    }
    return null;
  });
  console.log('Active scene:', activeScene);
  
  // Check if the main menu is visible
  const mainMenuVisible = await page.locator('text=Goal Bingo').isVisible();
  console.log('Main menu visible:', mainMenuVisible);
});
