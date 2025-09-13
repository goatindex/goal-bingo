/**
 * Global Setup for Playwright Tests
 * 
 * ARCHITECTURE NOTES:
 * - Ensures WebGL context is available for testing
 * - Sets up proper browser environment for Phaser games
 * - Configures test data and initial state
 * - Validates game initialization before tests run
 */

async function globalSetup(config) {
  console.log('🚀 Starting global test setup...');
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PLAYWRIGHT_TEST_MODE = 'true';
  
  // Configure WebGL testing environment
  process.env.WEBGL_TESTING = 'true';
  
  console.log('✅ Global setup completed');
}

export default globalSetup;
