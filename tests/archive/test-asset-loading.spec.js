const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Asset Loading', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Check if assets are loaded
  const assetStatus = await page.evaluate(() => {
    if (window.game) {
      const textureManager = window.game.textures;
      const cache = window.game.cache;
      
      // Check if basic textures are loaded
      const loadedTextures = [
        'button-bg',
        'cell-bg', 
        'grid-bg',
        'goal-card',
        'reward-button',
        'background'
      ];
      
      const textureResults = loadedTextures.map(key => ({
        key: key,
        exists: textureManager.exists(key),
        isLoaded: textureManager.exists(key) // In Phaser, if it exists, it's loaded
      }));
      
      // Check cache status
      const cacheKeys = cache.texture ? Object.keys(cache.texture.entries || {}) : [];
      
      return {
        gameExists: true,
        textureManagerExists: !!textureManager,
        cacheExists: !!cache,
        textureResults: textureResults,
        cacheKeys: cacheKeys,
        totalTextures: textureResults.length,
        loadedTextures: textureResults.filter(t => t.exists).length
      };
    }
    return { gameExists: false };
  });
  
  console.log('Asset loading status:', assetStatus);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/asset-loading-test.png' });
  
  // Verify that assets are loaded
  expect(assetStatus.gameExists).toBe(true);
  expect(assetStatus.textureManagerExists).toBe(true);
  expect(assetStatus.cacheExists).toBe(true);
  expect(assetStatus.loadedTextures).toBeGreaterThan(0);
  
  // Check that at least some basic textures are loaded
  const hasBasicTextures = assetStatus.textureResults.some(t => t.exists);
  expect(hasBasicTextures).toBe(true);
});
