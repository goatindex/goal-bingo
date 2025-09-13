const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Phaser Game Functionality', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Check if the Phaser game is working
  const gameStatus = await page.evaluate(() => {
    if (window.game) {
      const sceneManager = window.game.scene;
      
      // First, let's inspect what properties are actually available
      const sceneInspection = sceneManager?.scenes?.map(scene => {
        const sceneObj = scene.scene;
        return {
          key: sceneObj.key,
          // Check what properties exist
          availableProperties: Object.getOwnPropertyNames(sceneObj),
          // Try to access common properties safely
          isActive: typeof sceneObj.isActive === 'function' ? sceneObj.isActive() : sceneObj.isActive,
          isVisible: typeof sceneObj.isVisible === 'function' ? sceneObj.isVisible() : sceneObj.isVisible,
          isPaused: typeof sceneObj.isPaused === 'function' ? sceneObj.isPaused() : sceneObj.isPaused,
          isSleeping: typeof sceneObj.isSleeping === 'function' ? sceneObj.isSleeping() : sceneObj.isSleeping,
          // Check for other common properties
          isRunning: sceneObj.isRunning,
          isProcessing: sceneObj.isProcessing,
          isBooted: sceneObj.isBooted
        };
      }) || [];
      
      // Find active scene using the most reliable method
      const activeScene = sceneManager?.scenes?.find(scene => {
        const sceneObj = scene.scene;
        // Try different ways to detect active scene
        return (typeof sceneObj.isActive === 'function' ? sceneObj.isActive() : sceneObj.isActive) ||
               sceneObj.isRunning ||
               sceneObj.isProcessing;
      });
      
      return {
        gameExists: true,
        gameRunning: window.game.isRunning,
        activeSceneKey: activeScene?.scene?.key || 'none',
        activeSceneExists: !!activeScene,
        sceneManagerExists: !!sceneManager,
        sceneManagerType: typeof sceneManager,
        totalScenes: sceneManager?.scenes?.length || 0,
        sceneInspection: sceneInspection,
        // Additional debugging info
        sceneManagerKeys: Object.keys(sceneManager || {}),
        activeSceneInfo: activeScene ? {
          key: activeScene.scene.key,
          availableProperties: Object.getOwnPropertyNames(activeScene.scene)
        } : null
      };
    }
    return { gameExists: false };
  });
  
  console.log('Game status:', gameStatus);
  
  // Check if we can access the state manager
  const stateManagerStatus = await page.evaluate(() => {
    if (window.stateManager) {
      return {
        stateManagerExists: true,
        isInitialized: window.stateManager.isInitialized,
        goalsCount: window.stateManager.getGoals().length,
        rewardsCount: window.stateManager.getRewards().length,
        categoriesCount: window.stateManager.getCategories().length
      };
    }
    return { stateManagerExists: false };
  });
  
  console.log('State manager status:', stateManagerStatus);
  
  // Check if we can access the storage manager
  const storageManagerStatus = await page.evaluate(() => {
    if (window.storageManager) {
      return {
        storageManagerExists: true,
        isInitialized: window.storageManager.isInitialized,
        lastSaveTime: window.storageManager.lastSaveTime
      };
    }
    return { storageManagerExists: false };
  });
  
  console.log('Storage manager status:', storageManagerStatus);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/phaser-game-test.png' });
  
  // The test should pass if the game is running and MainMenuScene is active
  expect(gameStatus.gameExists).toBe(true);
  expect(gameStatus.gameRunning).toBe(true);
  expect(gameStatus.activeSceneKey).toBe('MainMenuScene');
  expect(stateManagerStatus.stateManagerExists).toBe(true);
  expect(storageManagerStatus.storageManagerExists).toBe(true);
});
