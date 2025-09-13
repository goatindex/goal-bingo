const { test, expect } = require('@playwright/test');

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('System Initialization Debug', async ({ page }) => {
    // Navigate to the game
    await page.goto('http://localhost:3000');
    
    // Wait for the game to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for systems to initialize
    await page.waitForTimeout(2000);
    
    // Check if systems are initialized by examining the global objects
    const systemStatus = await page.evaluate(() => {
        return {
            game: !!window.game,
            stateManager: !!window.stateManager,
            storageManager: !!window.storageManager,
            logger: !!window.logger,
            performanceLogger: !!window.performanceLogger,
            userActionLogger: !!window.userActionLogger,
            debugTools: !!window.debugTools,
            sceneStateLogger: !!window.sceneStateLogger,
            // Check if systems are attached to game object
            gameStateManager: !!window.game?.stateManager,
            gameLogger: !!window.game?.logger,
            // Check if logger has session ID
            sessionId: window.logger?.sessionId || 'No session ID',
            // Check if logger is working
            loggerLevel: window.logger?.level || 'No level',
            // Check if performance logger is monitoring
            performanceMonitoring: window.performanceLogger?.isMonitoring || false
        };
    });
    
    console.log('System Status:', JSON.stringify(systemStatus, null, 2));
    
    // Check if all systems are initialized
    expect(systemStatus.game).toBe(true);
    expect(systemStatus.stateManager).toBe(true);
    expect(systemStatus.storageManager).toBe(true);
    expect(systemStatus.logger).toBe(true);
    expect(systemStatus.performanceLogger).toBe(true);
    expect(systemStatus.userActionLogger).toBe(true);
    expect(systemStatus.debugTools).toBe(true);
    expect(systemStatus.sceneStateLogger).toBe(true);
    
    // Check if systems are properly attached to game object
    expect(systemStatus.gameStateManager).toBe(true);
    expect(systemStatus.gameLogger).toBe(true);
    
    // Check if logger is working
    expect(systemStatus.sessionId).not.toBe('No session ID');
    expect(systemStatus.loggerLevel).not.toBe('No level');
    expect(systemStatus.performanceMonitoring).toBe(true);
    
    // Test if we can actually use the logger
    const loggerTest = await page.evaluate(() => {
        if (window.logger) {
            window.logger.info('Test log message from Playwright', { test: true }, 'PlaywrightTest');
            return 'Logger working';
        }
        return 'Logger not available';
    });
    
    console.log('Logger Test Result:', loggerTest);
    expect(loggerTest).toBe('Logger working');
});

