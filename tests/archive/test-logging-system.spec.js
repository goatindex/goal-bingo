import { test, expect } from '@playwright/test';

// 🚨 CRITICAL WEBGL TESTING WARNING 🚨
// Playwright snapshots DO NOT capture WebGL content!
// Use page.screenshot() for visual verification and page.evaluate() for state checking
// See TESTING_WEBGL_GAMES.md for detailed guidance

test('Test Logging System Integration', async ({ page }) => {
  await page.goto('http://localhost:3001');

  // Wait for the game to initialize
  await page.waitForTimeout(5000);

  const loggingResult = await page.evaluate(() => {
    return new Promise(async (resolve) => {
      try {
        // Check if logging system is available
        const hasLogger = !!window.logger;
        const hasPerformanceLogger = !!window.performanceLogger;
        const hasUserActionLogger = !!window.userActionLogger;
        const hasDebugTools = !!window.debugTools;

        if (!hasLogger) {
          resolve({ success: false, error: 'Logger not available' });
          return;
        }

        // Test logger functionality
        const loggerConfig = window.logger.getConfig();
        const sessionId = window.logger.sessionId;
        const logCount = window.logger.getLogs().length;

        // Test performance logger
        let performanceMetrics = null;
        if (hasPerformanceLogger) {
          performanceMetrics = window.performanceLogger.getMetrics();
        }

        // Test user action logger
        let actionStats = null;
        if (hasUserActionLogger) {
          actionStats = window.userActionLogger.getActionStats();
        }

        // Test debug tools
        let debugInfo = null;
        if (hasDebugTools) {
          debugInfo = {
            gameState: window.debugTools.getGameState(),
            activeScenes: window.debugTools.getActiveScenes(),
            gameInfo: window.debugTools.getGameInfo()
          };
        }

        // Test logging different levels
        window.logger.debug('Test debug message', { test: true }, 'Test');
        window.logger.info('Test info message', { test: true }, 'Test');
        window.logger.warn('Test warning message', { test: true }, 'Test');
        window.logger.error('Test error message', { test: true }, 'Test');

        // Get logs after testing
        const logsAfterTest = window.logger.getLogs();
        const testLogs = logsAfterTest.filter(log => log.source === 'Test');

        resolve({
          success: true,
          logger: {
            available: hasLogger,
            config: loggerConfig,
            sessionId: sessionId,
            logCount: logCount,
            testLogsCount: testLogs.length
          },
          performanceLogger: {
            available: hasPerformanceLogger,
            metrics: performanceMetrics
          },
          userActionLogger: {
            available: hasUserActionLogger,
            stats: actionStats
          },
          debugTools: {
            available: hasDebugTools,
            info: debugInfo
          },
          testLogs: testLogs.slice(-4) // Last 4 test logs
        });
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });
  });

  console.log('Logging system test result:', loggingResult);

  // Verify results
  expect(loggingResult.success).toBe(true);
  expect(loggingResult.logger.available).toBe(true);
  expect(loggingResult.logger.sessionId).toBeDefined();
  expect(loggingResult.logger.testLogsCount).toBe(4); // 4 test log messages
  expect(loggingResult.performanceLogger.available).toBe(true);
  expect(loggingResult.userActionLogger.available).toBe(true);
  expect(loggingResult.debugTools.available).toBe(true);

  // Verify test logs were created
  expect(loggingResult.testLogs).toHaveLength(4);
  expect(loggingResult.testLogs[0].level).toBe('DEBUG');
  expect(loggingResult.testLogs[1].level).toBe('INFO');
  expect(loggingResult.testLogs[2].level).toBe('WARN');
  expect(loggingResult.testLogs[3].level).toBe('ERROR');
});

test('Test Debug Tools Functionality', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(5000);

  const debugToolsResult = await page.evaluate(() => {
    try {
      if (!window.debugTools) {
        return { success: false, error: 'Debug tools not available' };
      }

      // Test various debug tools functions
      const gameState = window.debugTools.getGameState();
      const activeScenes = window.debugTools.getActiveScenes();
      const gameInfo = window.debugTools.getGameInfo();
      const dataManager = window.debugTools.getDataManager();
      const storageInfo = window.debugTools.getStorageInfo();
      const performance = window.debugTools.getPerformance();
      const actionStats = window.debugTools.getActionStats();
      const systemInfo = window.debugTools.getSystemInfo();

      return {
        success: true,
        gameState: !!gameState,
        activeScenes: activeScenes.activeScenes?.length || 0,
        gameInfo: !!gameInfo,
        dataManager: !!dataManager,
        storageInfo: !!storageInfo,
        performance: !!performance,
        actionStats: !!actionStats,
        systemInfo: !!systemInfo
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('Debug tools test result:', debugToolsResult);

  expect(debugToolsResult.success).toBe(true);
  expect(debugToolsResult.gameState).toBe(true);
  expect(debugToolsResult.activeScenes).toBeGreaterThan(0);
  expect(debugToolsResult.gameInfo).toBe(true);
  expect(debugToolsResult.dataManager).toBe(true);
  expect(debugToolsResult.storageInfo).toBe(true);
  expect(debugToolsResult.performance).toBe(true);
  expect(debugToolsResult.actionStats).toBe(true);
  expect(debugToolsResult.systemInfo).toBe(true);
});

