const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Phaser Data Management Integration', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(8000);
  
  // Test Phaser data management
  const dataManagementResult = await page.evaluate(() => {
    if (window.game && window.stateManager && window.storageManager) {
      try {
        // Check if data management is enabled
        const hasDataManager = !!window.stateManager?.dataManager;
        const isDataEnabled = window.stateManager?.dataManager ? true : false;
        
        // Check if data is stored in our custom Data Manager
        const hasAppState = window.stateManager?.dataManager ? window.stateManager.dataManager.has('appState') : false;
        const hasGoals = window.stateManager?.dataManager ? window.stateManager.dataManager.has('goals') : false;
        const hasRewards = window.stateManager?.dataManager ? window.stateManager.dataManager.has('rewards') : false;
        const hasCategories = window.stateManager?.dataManager ? window.stateManager.dataManager.has('categories') : false;
        const hasGameState = window.stateManager?.dataManager ? window.stateManager.dataManager.has('gameState') : false;
        const hasSettings = window.stateManager?.dataManager ? window.stateManager.dataManager.has('settings') : false;
        const hasMetadata = window.stateManager?.dataManager ? window.stateManager.dataManager.has('metadata') : false;
        
        // Test data modification
        let dataChangeTest = false;
        if (window.stateManager?.dataManager) {
          // Listen for data change event
          window.stateManager.dataManager.events.once('changedata', (parent, key, value, previousValue) => {
            console.log(`Data change detected: ${key} = ${value}`);
            dataChangeTest = true;
          });
          
          // Modify some data to trigger event
          const currentGoals = window.stateManager.dataManager.get('goals') || [];
          window.stateManager.dataManager.set('goals', [...currentGoals, { id: 'test-goal', name: 'Test Goal' }]);
        }
        
        // Check event listeners
        const hasDataEventListeners = window.stateManager?.dataManager ? 
          window.stateManager.dataManager.events.listenerCount('setdata') > 0 &&
          window.stateManager.dataManager.events.listenerCount('changedata') > 0 &&
          window.stateManager.dataManager.events.listenerCount('removedata') > 0 : false;
        
        return {
          success: true,
          hasDataManager: hasDataManager,
          isDataEnabled: isDataEnabled,
          dataKeys: {
            appState: hasAppState,
            goals: hasGoals,
            rewards: hasRewards,
            categories: hasCategories,
            gameState: hasGameState,
            settings: hasSettings,
            metadata: hasMetadata
          },
          hasDataEventListeners: hasDataEventListeners,
          dataChangeTest: dataChangeTest,
          error: null
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }
    return { success: false, error: 'Game or managers not available' };
  });
  
  console.log('Data management result:', dataManagementResult);
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/outputs/phaser-data-management-test.png' });
  
  // Verify results
  expect(dataManagementResult.success).toBe(true);
  expect(dataManagementResult.hasDataManager).toBe(true);
  expect(dataManagementResult.isDataEnabled).toBe(true);
  expect(dataManagementResult.dataKeys.appState).toBe(true);
  expect(dataManagementResult.dataKeys.goals).toBe(true);
  expect(dataManagementResult.dataKeys.rewards).toBe(true);
  expect(dataManagementResult.dataKeys.categories).toBe(true);
  expect(dataManagementResult.dataKeys.gameState).toBe(true);
  expect(dataManagementResult.dataKeys.settings).toBe(true);
  expect(dataManagementResult.dataKeys.metadata).toBe(true);
  expect(dataManagementResult.hasDataEventListeners).toBe(true);
  
  console.log('Phaser data management test completed');
});
