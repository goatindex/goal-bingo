const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Direct Scene Manager Usage', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Test using scene manager directly
  const sceneManagerResult = await page.evaluate(() => {
    if (window.game) {
      try {
        const sceneManager = window.game.scene;
        
        // Get initial state
        const initialActiveScenes = sceneManager.getScenes(true);
        console.log('Initial active scenes:', initialActiveScenes.map(s => s.sys.settings.key));
        
        // Stop all active scenes first
        initialActiveScenes.forEach(scene => {
          console.log('Stopping scene:', scene.sys.settings.key);
          sceneManager.stop(scene.sys.settings.key);
        });
        
        // Wait a moment
        return new Promise((resolve) => {
          setTimeout(() => {
            // Check state after stopping
            const afterStopActiveScenes = sceneManager.getScenes(true);
            console.log('After stop active scenes:', afterStopActiveScenes.map(s => s.sys.settings.key));
            
            // Start TestScene
            console.log('Starting TestScene...');
            sceneManager.start('TestScene');
            
            // Wait and check final state
            setTimeout(() => {
              const finalActiveScenes = sceneManager.getScenes(true);
              console.log('Final active scenes:', finalActiveScenes.map(s => s.sys.settings.key));
              
              resolve({
                success: true,
                initialCount: initialActiveScenes.length,
                afterStopCount: afterStopActiveScenes.length,
                finalCount: finalActiveScenes.length,
                initialKeys: initialActiveScenes.map(s => s.sys.settings.key),
                afterStopKeys: afterStopActiveScenes.map(s => s.sys.settings.key),
                finalKeys: finalActiveScenes.map(s => s.sys.settings.key),
                error: null
              });
            }, 1000);
          }, 500);
        });
      } catch (error) {
        console.error('Error with scene manager:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
    return { success: false, error: 'Game not available' };
  });
  
  console.log('Scene manager result:', sceneManagerResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/scene-manager-direct-test.png' });
  
  // Verify results
  expect(sceneManagerResult.success).toBe(true);
  expect(sceneManagerResult.afterStopCount).toBe(0);
  expect(sceneManagerResult.finalCount).toBe(1);
  expect(sceneManagerResult.finalKeys).toContain('TestScene');
  
  console.log('Direct scene manager test completed');
});

