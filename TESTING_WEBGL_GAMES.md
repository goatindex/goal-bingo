# Testing WebGL Games with Playwright MCP

## 🚨 **CRITICAL LIMITATION - READ THIS FIRST**

**Playwright snapshots DO NOT capture WebGL content!**

This is a known limitation of Playwright's accessibility snapshot functionality when testing games that use WebGL renderers (like Phaser.js games).

## ✅ **Correct Testing Methods**

### 1. **Visual Verification**
```javascript
// ✅ CORRECT - Use screenshots to verify visual content
await page.screenshot({ fullPage: true, filename: 'game-screenshot.png' });
```

### 2. **Programmatic State Checking**
```javascript
// ✅ CORRECT - Check game state programmatically
await page.evaluate(() => {
  const game = window.game;
  const scene = game.scene.getScene('MainMenuScene');
  return {
    sceneActive: scene.scene.isActive(),
    childrenCount: scene.children.list.length,
    rendererType: game.renderer.type,
    canvasExists: !!document.querySelector('canvas')
  };
});
```

### 3. **Canvas Element Verification**
```javascript
// ✅ CORRECT - Check canvas element directly
await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  return {
    exists: !!canvas,
    width: canvas?.width,
    height: canvas?.height,
    visible: canvas?.style.display !== 'none'
  };
});
```

## ❌ **What NOT to Use**

```javascript
// ❌ WRONG - Snapshots will always be empty for WebGL content
await page.snapshot(); // This will show empty content!
```

## 🔍 **Debugging WebGL Issues**

### Check Renderer Type
```javascript
const rendererType = await page.evaluate(() => window.game.renderer.type);
// 1 = Canvas, 2 = WebGL, 3 = Headless
```

### Verify Scene State
```javascript
const sceneState = await page.evaluate(() => {
  const scene = window.game.scene.getScene('MainMenuScene');
  return {
    isActive: scene.scene.isActive(),
    isVisible: scene.scene.isVisible(),
    childrenCount: scene.children.list.length,
    rendererAvailable: !!scene.sys.renderer
  };
});
```

### Test Canvas Context
```javascript
const canvasInfo = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  return {
    exists: !!canvas,
    context: canvas?.getContext('webgl') ? 'WebGL' : 'Canvas',
    dimensions: { width: canvas?.width, height: canvas?.height }
  };
});
```

## 📋 **Testing Checklist for WebGL Games**

- [ ] **Use `browser_take_screenshot`** for visual verification
- [ ] **Use `browser_evaluate`** for state checking
- [ ] **Check canvas element** exists and has correct dimensions
- [ ] **Verify renderer type** is WebGL (type 2)
- [ ] **Check scene state** (active, visible, children count)
- [ ] **Test interactive elements** programmatically
- [ ] **Verify game objects** are properly positioned
- [ ] **Check for console errors** that might affect rendering

## 🎯 **Common WebGL Testing Patterns**

### Pattern 1: Visual + State Verification
```javascript
// Take screenshot for visual verification
await page.screenshot({ fullPage: true, filename: 'test.png' });

// Check game state programmatically
const gameState = await page.evaluate(() => {
  const game = window.game;
  const scene = game.scene.getScene('MainMenuScene');
  return {
    gameRunning: game.isRunning,
    sceneActive: scene.scene.isActive(),
    childrenCount: scene.children.list.length,
    rendererWorking: game.renderer.type === 2
  };
});

// Assert expected state
expect(gameState.gameRunning).toBe(true);
expect(gameState.sceneActive).toBe(true);
expect(gameState.childrenCount).toBeGreaterThan(0);
```

### Pattern 2: Interactive Element Testing
```javascript
// Check if interactive elements are working
const interactiveElements = await page.evaluate(() => {
  const scene = window.game.scene.getScene('MainMenuScene');
  return scene.children.list
    .filter(child => child.input && child.input.enabled)
    .map(child => ({ type: child.type, interactive: true }));
});

expect(interactiveElements.length).toBeGreaterThan(0);
```

## ⚠️ **Important Notes**

1. **Screenshots are essential** for visual verification of WebGL content
2. **Programmatic checks** are more reliable than visual snapshots
3. **Canvas element** must exist and have correct dimensions
4. **Renderer type** should be 2 (WebGL) for Phaser games
5. **Scene state** must be active and visible for proper rendering
6. **Console errors** can indicate WebGL context issues

## 🔧 **Troubleshooting WebGL Issues**

### Empty Screenshots
- Check if canvas element exists
- Verify WebGL context is working
- Check for JavaScript errors in console
- Ensure scene is active and visible

### Scene Not Rendering
- Verify `scene.setVisible(true)` is called
- Check camera viewport configuration
- Ensure renderer is available before object creation
- Validate scene lifecycle methods are called

### Performance Issues
- Check for continuous render warnings
- Verify object pooling is implemented
- Monitor FPS and frame times
- Check for memory leaks in update loops

---

**Remember: Always use screenshots and programmatic checks when testing WebGL games with Playwright!**
