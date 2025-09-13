const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Scene Errors and Debug', async ({ page }) => {
  const consoleLogs = [];
  const errors = [];
  
  // Capture console logs and errors
  page.on('console', msg => {
    consoleLogs.push({
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
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Try to start GoalLibraryScene and capture any errors
  const sceneTestResult = await page.evaluate(() => {
    if (window.game) {
      try {
        console.log('Attempting to start GoalLibraryScene...');
        window.game.scene.start('GoalLibraryScene');
        
        // Wait a moment and check the result
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
        console.error('Error starting GoalLibraryScene:', error);
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
  
  console.log('Scene test result:', sceneTestResult);
  
  // Print all console logs
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });
  
  // Print errors
  console.log('\n=== ERRORS ===');
  errors.forEach(error => {
    console.log(`Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  });
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/scene-errors-test.png' });
  
  // The test will pass regardless to see the debug info
  expect(true).toBe(true);
});

