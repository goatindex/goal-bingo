import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Check Console Messages During Initialization', async ({ page }) => {
  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  await page.goto('http://localhost:3001');
  await page.waitForTimeout(5000);

  // Filter for relevant messages
  const relevantMessages = consoleMessages.filter(msg => 
    msg.text.includes('Creating') || 
    msg.text.includes('Logger') || 
    msg.text.includes('StateManager') || 
    msg.text.includes('StorageManager') ||
    msg.text.includes('Error') ||
    msg.text.includes('Failed')
  );

  console.log('All console messages:', consoleMessages);
  console.log('Relevant messages:', relevantMessages);

  // Check if we see the initialization messages
  const hasCreatingLogger = relevantMessages.some(msg => msg.text.includes('Creating Logger'));
  const hasLoggerCreated = relevantMessages.some(msg => msg.text.includes('Logger created'));
  const hasCreatingStateManager = relevantMessages.some(msg => msg.text.includes('Creating StateManager'));

  console.log('Initialization status:', {
    hasCreatingLogger,
    hasLoggerCreated,
    hasCreatingStateManager
  });

  // The game should exist
  expect(consoleMessages.length).toBeGreaterThan(0);
});

