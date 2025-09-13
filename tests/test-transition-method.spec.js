const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Phaser Transition Method', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Test transition method specifically
  const transitionResult = await page.evaluate(() => {
    if (window.game) {
      try {
        const sceneManager = window.game.scene;
        
        // Get initial state
        const initialActiveScenes = sceneManager.getScenes(true);
        console.log('Initial active scenes:', initialActiveScenes.map(s => s.sys.settings.key));
        
        // Use transition method on the active scene's plugin
        const activeScene = initialActiveScenes[0];
        console.log('Starting transition to TestScene...');
        activeScene.scene.transition({
          target: 'TestScene',
          duration: 1000,
          sleep: false,
          remove: false,
          allowInput: false
        });
        
        // Wait for transition to complete
        return new Promise((resolve) => {
          setTimeout(() => {
            const finalActiveScenes = sceneManager.getScenes(true);
            console.log('Final active scenes after transition:', finalActiveScenes.map(s => s.sys.settings.key));
            
            resolve({
              success: true,
              initialCount: initialActiveScenes.length,
              finalCount: finalActiveScenes.length,
              initialKeys: initialActiveScenes.map(s => s.sys.settings.key),
              finalKeys: finalActiveScenes.map(s => s.sys.settings.key),
              error: null
            });
          }, 2000); // Wait 2 seconds for transition to complete
        });
      } catch (error) {
        console.error('Error with transition:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
    return { success: false, error: 'Game not available' };
  });
  
  console.log('Transition result:', transitionResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/transition-method-test.png' });
  
  // Verify results
  expect(transitionResult.success).toBe(true);
  expect(transitionResult.finalCount).toBe(1);
  expect(transitionResult.finalKeys).toContain('TestScene');
  
  console.log('Transition method test completed');
});
