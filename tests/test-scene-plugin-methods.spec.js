const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Scene Plugin Methods', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Test what methods are available on the scene plugin
  const pluginMethodsResult = await page.evaluate(() => {
    if (window.game) {
      try {
        const sceneManager = window.game.scene;
        const activeScene = sceneManager.getScenes(true)[0];
        
        if (activeScene) {
          const scenePlugin = activeScene.scene;
          const availableMethods = Object.getOwnPropertyNames(scenePlugin).filter(name => 
            typeof scenePlugin[name] === 'function'
          );
          
          // Check if transition method exists
          const hasTransition = typeof scenePlugin.transition === 'function';
          const hasStart = typeof scenePlugin.start === 'function';
          const hasStop = typeof scenePlugin.stop === 'function';
          const hasSwitch = typeof scenePlugin.switch === 'function';
          
          return {
            success: true,
            sceneKey: activeScene.sys.settings.key,
            availableMethods: availableMethods,
            hasTransition: hasTransition,
            hasStart: hasStart,
            hasStop: hasStop,
            hasSwitch: hasSwitch,
            transitionType: typeof scenePlugin.transition,
            error: null
          };
        } else {
          return {
            success: false,
            error: 'No active scene found'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
    return { success: false, error: 'Game not available' };
  });
  
  console.log('Plugin methods result:', pluginMethodsResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/scene-plugin-methods-test.png' });
  
  // Verify results
  expect(pluginMethodsResult.success).toBe(true);
  expect(pluginMethodsResult.hasStart).toBe(true);
  expect(pluginMethodsResult.hasStop).toBe(true);
  
  console.log('Scene plugin methods test completed');
});

