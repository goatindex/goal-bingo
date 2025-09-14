/**
 * Global Teardown for Playwright Tests
 * 
 * This file runs after all tests to clean up the testing environment
 * and generate test reports.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Generate test summary
    const setupData = global.__TEST_SETUP__;
    if (setupData) {
      const summary = {
        timestamp: new Date().toISOString(),
        setupTime: setupData.timestamp,
        duration: Date.now() - setupData.timestamp,
        scenes: setupData.scenes,
        gameState: setupData.gameState
      };
      
      // Write summary to file
      const summaryPath = path.join(__dirname, '../test-results/summary.json');
      fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log('✅ Test summary generated');
    }
    
    // Clean up any temporary files
    const tempDir = path.join(__dirname, '../temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('✅ Temporary files cleaned up');
    }
    
    // Generate coverage report if available
    const coveragePath = path.join(__dirname, '../coverage');
    if (fs.existsSync(coveragePath)) {
      console.log('📊 Coverage report available at:', coveragePath);
    }
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error.message);
    // Don't throw error to avoid masking test failures
  }
  
  console.log('✅ Global test teardown completed');
}

module.exports = globalTeardown;
