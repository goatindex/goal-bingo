const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Phaser Scene API Detection', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Test scene detection using proper Phaser API
  const sceneDetectionResult = await page.evaluate(() => {
    if (window.game) {
      const sceneManager = window.game.scene;
      
      // Use the proper Phaser API methods
      const activeScenes = sceneManager.getScenes(true); // Only active scenes
      const allScenes = sceneManager.getScenes(); // All scenes
      
      // Check individual scenes using the proper API
      const sceneChecks = {
        'BootScene': sceneManager.isActive('BootScene'),
        'PreloadScene': sceneManager.isActive('PreloadScene'),
        'MainMenuScene': sceneManager.isActive('MainMenuScene'),
        'GoalLibraryScene': sceneManager.isActive('GoalLibraryScene'),
        'BingoGridScene': sceneManager.isActive('BingoGridScene'),
        'RewardsScene': sceneManager.isActive('RewardsScene'),
        'TestScene': sceneManager.isActive('TestScene')
      };
      
      return {
        gameExists: true,
        activeScenesCount: activeScenes.length,
        activeScenesKeys: activeScenes.map(scene => scene.sys.settings.key),
        allScenesCount: allScenes.length,
        allScenesKeys: allScenes.map(scene => scene.sys.settings.key),
        sceneChecks: sceneChecks,
        sceneManagerMethods: Object.getOwnPropertyNames(sceneManager).filter(name => typeof sceneManager[name] === 'function')
      };
    }
    return { gameExists: false };
  });
  
  console.log('Scene detection result:', sceneDetectionResult);
  
  // Test starting TestScene
  const testSceneResult = await page.evaluate(() => {
    if (window.game) {
      try {
        console.log('Starting TestScene...');
        window.game.scene.start('TestScene');
        
        // Wait a moment and check using proper API
        return new Promise((resolve) => {
          setTimeout(() => {
            const sceneManager = window.game.scene;
            const activeScenes = sceneManager.getScenes(true);
            const sceneChecks = {
              'MainMenuScene': sceneManager.isActive('MainMenuScene'),
              'TestScene': sceneManager.isActive('TestScene')
            };
            
            resolve({
              success: true,
              activeScenesCount: activeScenes.length,
              activeScenesKeys: activeScenes.map(scene => scene.sys.settings.key),
              sceneChecks: sceneChecks,
              error: null
            });
          }, 1000);
        });
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
    return { success: false, error: 'Game not available' };
  });
  
  console.log('TestScene result:', testSceneResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/phaser-scene-api-test.png' });
  
  // Verify results
  expect(sceneDetectionResult.gameExists).toBe(true);
  expect(sceneDetectionResult.activeScenesCount).toBe(1);
  expect(sceneDetectionResult.activeScenesKeys).toContain('MainMenuScene');
  
  console.log('Test completed successfully');
});

