const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Debug Scene Transitions', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize
  await page.waitForTimeout(5000);
  
  // Check what's actually in the DOM
  const bodyText = await page.locator('body').textContent();
  console.log('Body text content:', bodyText);
  
  // Check if there are any Phaser scenes
  const sceneInfo = await page.evaluate(() => {
    if (window.game && window.game.scene) {
      const scenes = window.game.scene.scenes;
      return {
        sceneCount: scenes.length,
        sceneKeys: scenes.map(s => s.scene.key),
        activeScene: window.game.scene?.manager?.getActiveScene()?.scene?.key || 'none'
      };
    }
    return { sceneCount: 0, sceneKeys: [], activeScene: 'none' };
  });
  
  console.log('Scene info:', sceneInfo);
  
  // Check if the game container has any children
  const gameContainerChildren = await page.locator('#game-container').count();
  console.log('Game container children count:', gameContainerChildren);
  
  // Check if there are any canvas elements
  const canvasCount = await page.locator('canvas').count();
  console.log('Canvas count:', canvasCount);
  
  // Check if there are any text elements
  const textElements = await page.locator('text').count();
  console.log('Text elements count:', textElements);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/debug-scenes.png' });
  
  // The test will pass regardless
  expect(true).toBe(true);
});
