const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Main Menu Scene', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize
  await page.waitForTimeout(3000);
  
  // Check if the main menu is visible
  const mainMenuTitle = await page.locator('text=🎯 Goal Bingo').isVisible();
  console.log('Main menu title visible:', mainMenuTitle);
  
  // Check if navigation buttons are visible
  const goalLibraryBtn = await page.locator('text=📚 Goal Library').isVisible();
  const bingoGridBtn = await page.locator('text=🎲 Play Bingo').isVisible();
  const rewardsBtn = await page.locator('text=🏆 Rewards').isVisible();
  
  console.log('Goal Library button visible:', goalLibraryBtn);
  console.log('Bingo Grid button visible:', bingoGridBtn);
  console.log('Rewards button visible:', rewardsBtn);
  
  // Check if state info is displayed
  const stateInfo = await page.locator('text=/Goals:/').isVisible();
  console.log('State info visible:', stateInfo);
  
  // Take a screenshot
  await page.screenshot({ path: 'main-menu-test.png' });
  
  // The test will pass if we can see the main menu
  expect(mainMenuTitle).toBe(true);
});
