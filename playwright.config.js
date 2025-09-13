import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Goal Bingo Application
 * 
 * ARCHITECTURE NOTES:
 * - Configured for E2E and integration testing only
 * - Uses Vite dev server on port 3008 (matches current setup)
 * - Supports UI testing and user interaction validation
 * - WebGL tests are handled by a separate tool (not Playwright)
 * - Includes proper browser flags for game testing
 */
export default defineConfig({
  // Test directory structure - include ONLY E2E and integration tests
  // WebGL tests should be handled by a different tool (not Playwright)
  testDir: './tests',
  testIgnore: [
    '**/archive/**',
    '**/unit/**',
    '**/webgl/**',
    '**/setup.js'
  ],
  
  // Parallel execution for faster testing
  fullyParallel: true,
  
  // Fail build on CI if test.only is left in code
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,
  
  // Limit workers on CI to avoid resource issues
  workers: process.env.CI ? 1 : undefined,
  
  // HTML reporter for detailed test results
  reporter: 'html',
  
  // Global test configuration
  use: {
    // Base URL matches Vite dev server
    baseURL: 'http://localhost:3008',
    
    // Trace on first retry for debugging
    trace: 'on-first-retry',
    
    // Screenshots on failure for visual debugging
    screenshot: 'only-on-failure',
    
    // Video recording for failed tests
    video: 'retain-on-failure',
    
    // Timeout for individual actions
    actionTimeout: 10000,
    
    // Timeout for navigation
    navigationTimeout: 30000,
  },
  
  // Browser projects for cross-browser testing
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // WebGL and GPU acceleration flags
        launchOptions: {
          args: [
            '--enable-webgl',
            '--enable-gpu',
            '--enable-gpu-rasterization',
            '--enable-zero-copy',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox WebGL support
        launchOptions: {
          firefoxUserPrefs: {
            'webgl.force-enabled': true,
            'webgl.disabled': false,
            'gfx.webrender.all': true
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit WebGL support
        launchOptions: {
          args: ['--enable-webgl']
        }
      },
    },
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3008',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // Test timeout (30 seconds per test)
  timeout: 30000,
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-setup.js'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.js'),
  
  // Test output directory
  outputDir: 'test-results/',
  
  // Test artifacts
  expect: {
    // Screenshot comparison threshold
    threshold: 0.2,
    // Animation handling
    toHaveScreenshot: { 
      animations: 'disabled',
      threshold: 0.2 
    },
    toMatchSnapshot: { 
      threshold: 0.2 
    },
  },
});
