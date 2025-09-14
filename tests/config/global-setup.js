/**
 * Global Setup for Playwright Tests
 * 
 * This file runs before all tests to set up the testing environment
 * and ensure the Phaser game is ready for testing.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global test setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for Phaser game to initialize
    await page.waitForFunction(() => {
      return window.game && window.game.scene && window.game.scene.isActive('MainMenuScene');
    }, { timeout: 30000 });
    
    console.log('✅ Phaser game initialized successfully');
    
    // Verify all required scenes are registered
    const scenes = await page.evaluate(() => {
      return window.game.scene.scenes.map(scene => scene.sys.settings.key);
    });
    
    const requiredScenes = ['BootScene', 'PreloadScene', 'MainMenuScene', 'GoalLibraryScene', 'BingoGridScene', 'RewardsScene', 'TestScene'];
    const missingScenes = requiredScenes.filter(scene => !scenes.includes(scene));
    
    if (missingScenes.length > 0) {
      throw new Error(`Missing required scenes: ${missingScenes.join(', ')}`);
    }
    
    console.log('✅ All required scenes are registered');
    
    // Test basic functionality
    const gameState = await page.evaluate(() => {
      return {
        isRunning: window.game.isRunning,
        sceneCount: window.game.scene.scenes.length,
        activeScene: window.game.scene.isActive('MainMenuScene')
      };
    });
    
    if (!gameState.isRunning || !gameState.activeScene) {
      throw new Error('Game is not running or MainMenuScene is not active');
    }
    
    console.log('✅ Game is running and MainMenuScene is active');
    
    // Store setup data for tests
    global.__TEST_SETUP__ = {
      scenes,
      gameState,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global test setup completed successfully');
}

module.exports = globalSetup;
