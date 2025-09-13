const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test PreloadScene Functionality', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for the initial scene to load
  await page.waitForTimeout(2000);
  
  // Check if we can see the PreloadScene loading bar
  const preloadStatus = await page.evaluate(() => {
    if (window.game) {
      const sceneManager = window.game.scene;
      const preloadScene = sceneManager?.scenes?.find(scene => scene.scene.key === 'PreloadScene');
      const activeScene = sceneManager?.scenes?.find(scene => scene.scene.isActive());
      
      // Check if PreloadScene has loading elements
      let loadingElements = [];
      if (preloadScene && preloadScene.scene.children) {
        loadingElements = preloadScene.scene.children.list.map(child => ({
          type: child.type,
          text: child.text || child.texture?.key || 'unknown'
        }));
      }
      
      return {
        gameExists: true,
        preloadSceneExists: !!preloadScene,
        activeSceneKey: activeScene?.scene?.key || 'none',
        preloadSceneActive: preloadScene?.scene?.isActive() || false,
        loadingElements: loadingElements,
        totalElements: loadingElements.length
      };
    }
    return { gameExists: false };
  });
  
  console.log('PreloadScene status:', preloadStatus);
  
  // Wait for the scene transition to complete
  await page.waitForTimeout(6000);
  
  // Check final scene state
  const finalSceneState = await page.evaluate(() => {
    if (window.game) {
      const sceneManager = window.game.scene;
      const activeScene = sceneManager?.scenes?.find(scene => scene.scene.isActive());
      return {
        activeSceneKey: activeScene?.scene?.key || 'none',
        totalScenes: sceneManager?.scenes?.length || 0
      };
    }
    return { activeSceneKey: 'none', totalScenes: 0 };
  });
  
  console.log('Final scene state:', finalSceneState);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/preload-scene-test.png' });
  
  // Verify that the PreloadScene exists and transitions properly
  expect(preloadStatus.gameExists).toBe(true);
  expect(preloadStatus.preloadSceneExists).toBe(true);
  expect(finalSceneState.activeSceneKey).toBe('MainMenuScene');
  expect(finalSceneState.totalScenes).toBe(6);
});

