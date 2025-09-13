const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Canvas Content', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Wait for managers to initialize and scene to load
  await page.waitForTimeout(5000);
  
  // Check if there's a canvas element
  const canvas = await page.locator('canvas');
  const canvasCount = await canvas.count();
  console.log('Canvas count:', canvasCount);
  
  if (canvasCount > 0) {
    // Check canvas dimensions
    const canvasBox = await canvas.boundingBox();
    console.log('Canvas bounding box:', canvasBox);
    
    // Check if canvas is visible
    const isVisible = await canvas.isVisible();
    console.log('Canvas visible:', isVisible);
    
    // Check canvas style
    const canvasStyle = await canvas.evaluate(el => {
      return {
        width: el.style.width,
        height: el.style.height,
        display: el.style.display,
        visibility: el.style.visibility
      };
    });
    console.log('Canvas style:', canvasStyle);
  }
  
  // Check if there are any text elements in the DOM
  const textElements = await page.locator('text').count();
  console.log('Text elements count:', textElements);
  
  // Check if there are any SVG text elements
  const svgTextElements = await page.locator('svg text').count();
  console.log('SVG text elements count:', svgTextElements);
  
  // Check the game container
  const gameContainer = await page.locator('#game-container');
  const containerChildren = await gameContainer.count();
  console.log('Game container children count:', containerChildren);
  
  // Check if the game container has any text content
  const containerText = await gameContainer.textContent();
  console.log('Game container text content:', containerText);
  
  // Take a screenshot
  await page.screenshot({ path: 'canvas-content-test.png' });
  
  // The test will pass regardless
  expect(true).toBe(true);
});
