const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Scene Transition with TestScene', async ({ page }) => {
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
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Test 1: Verify initial scene is MainMenuScene
  const initialScene = await page.evaluate(() => {
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
  
  console.log('Initial scene:', initialScene);
  expect(initialScene.activeSceneKey).toBe('MainMenuScene');
  expect(initialScene.totalScenes).toBe(7); // Now includes TestScene
  
  // Test 2: Test navigation to TestScene
  const testSceneResult = await page.evaluate(() => {
    if (window.game) {
      try {
        console.log('Attempting to start TestScene...');
        window.game.scene.start('TestScene');
        
        return new Promise((resolve) => {
          setTimeout(() => {
            const sceneManager = window.game.scene;
            const activeScene = sceneManager?.scenes?.find(scene => scene.scene.isActive());
            const allScenes = sceneManager?.scenes?.map(scene => ({
              key: scene.scene.key,
              isActive: scene.scene.isActive(),
              isVisible: scene.scene.isVisible(),
              isPaused: scene.scene.isPaused(),
              isSleeping: scene.scene.isSleeping()
            })) || [];
            
            resolve({
              success: true,
              activeSceneKey: activeScene?.scene?.key || 'none',
              allScenes: allScenes,
              error: null
            });
          }, 2000);
        });
      } catch (error) {
        console.error('Error starting TestScene:', error);
        return {
          success: false,
          activeSceneKey: 'none',
          allScenes: [],
          error: error.message
        };
      }
    }
    return { success: false, activeSceneKey: 'none', allScenes: [], error: 'Game not available' };
  });
  
  console.log('TestScene transition result:', testSceneResult);
  
  // Test 3: Wait for auto-return to MainMenuScene (TestScene has 3-second auto-return)
  await page.waitForTimeout(4000);
  
  const finalScene = await page.evaluate(() => {
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
  
  console.log('Final scene after auto-return:', finalScene);
  
  // Print console logs
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/scene-transition-test.png' });
  
  // Verify results
  expect(testSceneResult.success).toBe(true);
  expect(testSceneResult.activeSceneKey).toBe('TestScene');
  expect(finalScene.activeSceneKey).toBe('MainMenuScene');
  
  // Check that only one scene is active at a time
  const activeScenes = testSceneResult.allScenes.filter(scene => scene.isActive);
  expect(activeScenes.length).toBe(1);
  expect(activeScenes[0].key).toBe('TestScene');
});

