const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Simple Scene Transition', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Check initial scene state
  const initialSceneState = await page.evaluate(() => {
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
  
  console.log('Initial scene state:', initialSceneState);
  
  // Test simple scene transition to GoalLibraryScene (which should be simpler)
  const transitionResult = await page.evaluate(() => {
    if (window.game) {
      try {
        // Try to start the GoalLibraryScene
        window.game.scene.start('GoalLibraryScene');
        
        // Wait a moment for the transition
        return new Promise((resolve) => {
          setTimeout(() => {
            const sceneManager = window.game.scene;
            const activeScene = sceneManager?.scenes?.find(scene => scene.scene.isActive());
            resolve({
              success: true,
              activeSceneKey: activeScene?.scene?.key || 'none',
              error: null
            });
          }, 1000);
        });
      } catch (error) {
        return {
          success: false,
          activeSceneKey: 'none',
          error: error.message
        };
      }
    }
    return { success: false, activeSceneKey: 'none', error: 'Game not available' };
  });
  
  console.log('Transition result:', transitionResult);
  
  // Test transition back to MainMenuScene
  const backTransitionResult = await page.evaluate(() => {
    if (window.game) {
      try {
        // Try to start the MainMenuScene
        window.game.scene.start('MainMenuScene');
        
        // Wait a moment for the transition
        return new Promise((resolve) => {
          setTimeout(() => {
            const sceneManager = window.game.scene;
            const activeScene = sceneManager?.scenes?.find(scene => scene.scene.isActive());
            resolve({
              success: true,
              activeSceneKey: activeScene?.scene?.key || 'none',
              error: null
            });
          }, 1000);
        });
      } catch (error) {
        return {
          success: false,
          activeSceneKey: 'none',
          error: error.message
        };
      }
    }
    return { success: false, activeSceneKey: 'none', error: 'Game not available' };
  });
  
  console.log('Back transition result:', backTransitionResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/simple-scene-transition-test.png' });
  
  // Verify that scene transitions work
  expect(initialSceneState.activeSceneKey).toBe('MainMenuScene');
  expect(transitionResult.success).toBe(true);
  expect(backTransitionResult.success).toBe(true);
  expect(backTransitionResult.activeSceneKey).toBe('MainMenuScene');
});

