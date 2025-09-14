# Phaser Scene Testing Framework

## Overview

A comprehensive testing framework for Phaser scenes using Playwright, designed to test game logic, API interactions, and user experience while working around Playwright's limitations with WebGL rendering.

## Features

- **Scene Testing**: Complete scene lifecycle and transition testing
- **Button Interactions**: Comprehensive button interaction and accessibility testing
- **Data Flow**: ApplicationStateManager integration and data persistence testing
- **Performance**: Performance monitoring and optimization testing
- **Accessibility**: ARIA compliance and keyboard navigation testing
- **Error Handling**: Robust error recovery and edge case testing
- **CI/CD Integration**: GitHub Actions pipeline with automated testing
- **Reporting**: Comprehensive test reporting and coverage analysis

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Install system dependencies (Linux/macOS)
npm run test:install-deps
```

### Running Tests

```bash
# Quick smoke tests
npm run test:smoke

# All Phaser tests
npm run test:phaser:full

# Interactive UI
npm run test:ui

# CI/CD tests
npm run test:ci
```

## Test Categories

### Smoke Tests
Quick validation tests for critical functionality.

```bash
npm run test:smoke
```

**Files**: `scene-transitions.test.js`, `button-functionality.test.js`

### Regression Tests
Comprehensive tests for existing functionality.

```bash
npm run test:regression
```

**Files**: `scene-loading.test.js`, `data-flow.test.js`

### Performance Tests
Performance monitoring and optimization testing.

```bash
npm run test:performance
```

**Files**: `performance.test.js`

### Accessibility Tests
Accessibility compliance and usability testing.

```bash
npm run test:accessibility
```

**Files**: `accessibility.test.js`

### Error Handling Tests
Error recovery and edge case testing.

```bash
npm run test:error-handling
```

**Files**: `error-handling.test.js`

## Test Architecture

### Directory Structure

```
tests/
├── phaser/                 # Phaser-specific tests
│   ├── scene-transitions.test.js
│   ├── button-functionality.test.js
│   ├── scene-loading.test.js
│   ├── error-handling.test.js
│   ├── data-flow.test.js
│   ├── performance.test.js
│   └── accessibility.test.js
├── utils/                  # Test utilities
│   └── PhaserTestHelper.js
└── config/                 # Test configuration
    ├── test-config.js
    ├── global-setup.js
    └── global-teardown.js
```

### Core Components

#### PhaserTestHelper
Central utility class providing methods for:
- Scene state management
- Button interactions
- Data flow testing
- Performance measurement
- Accessibility validation

#### Test Configuration
Centralized configuration for:
- Scene names and button positions
- Performance thresholds
- Timeout settings
- Browser configurations

## Writing Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';
import { PhaserTestHelper } from '../utils/PhaserTestHelper.js';
import { testConfig } from '../config/test-config.js';

test.describe('Scene Transitions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(testConfig.baseURL);
        await PhaserTestHelper.waitForScene(page, testConfig.scenes.mainMenu);
    });

    test('should transition from MainMenuScene to GoalLibraryScene', async ({ page }) => {
        const result = await PhaserTestHelper.testSceneTransition(
            page, 
            testConfig.scenes.mainMenu, 
            testConfig.scenes.goalLibrary
        );
        
        expect(result.active).toBe(true);
        expect(result.visible).toBe(true);
        expect(result.children).toBeGreaterThan(0);
    });
});
```

### Scene Transition Testing

```javascript
test('should transition between scenes', async ({ page }) => {
    // Wait for source scene
    await PhaserTestHelper.waitForScene(page, 'MainMenuScene');
    
    // Test transition
    const result = await PhaserTestHelper.testSceneTransition(
        page, 
        'MainMenuScene', 
        'GoalLibraryScene'
    );
    
    // Verify target scene state
    expect(result.active).toBe(true);
    expect(result.visible).toBe(true);
});
```

### Button Interaction Testing

```javascript
test('should handle button clicks', async ({ page }) => {
    const success = await PhaserTestHelper.testButtonClick(
        page, 
        'Goal Library', 
        'MainMenuScene'
    );
    
    expect(success).toBe(true);
    
    // Verify scene transition
    await PhaserTestHelper.waitForScene(page, 'GoalLibraryScene');
});
```

### Data Flow Testing

```javascript
test('should manage data flow between scenes', async ({ page }) => {
    const dataFlow = await PhaserTestHelper.testDataFlow(page, 'MainMenuScene');
    
    expect(dataFlow.success).toBe(true);
    expect(dataFlow.data.goalsCount).toBeGreaterThanOrEqual(0);
    expect(dataFlow.data.gameStateExists).toBe(true);
});
```

## CI/CD Integration

### GitHub Actions Pipeline

Our CI/CD pipeline includes:

- **Smoke Tests**: Quick validation for PRs
- **Full Tests**: Comprehensive testing on main branch
- **Performance Tests**: Daily performance monitoring
- **Accessibility Tests**: Automated accessibility compliance
- **Error Handling Tests**: Comprehensive error recovery testing

### Pipeline Triggers

- **Pull Requests**: Smoke tests only
- **Main Branch**: Full test suite
- **Scheduled**: Daily performance and accessibility tests

### Artifacts

- Test results and reports
- Coverage analysis
- Performance metrics
- Screenshots and traces

## Test Scripts

### NPM Scripts

```bash
# Test execution
npm run test:smoke              # Quick smoke tests
npm run test:regression         # Regression tests
npm run test:performance        # Performance tests
npm run test:accessibility      # Accessibility tests
npm run test:error-handling     # Error handling tests
npm run test:phaser:full        # All Phaser tests
npm run test:ci                 # CI/CD tests

# Test utilities
npm run test:ui                 # Interactive UI
npm run test:debug              # Debug mode
npm run test:coverage           # Coverage analysis
npm run test:report             # Generate reports
npm run test:clean              # Clean results
npm run test:install            # Install browsers
```

### Test Runner Script

```bash
# Using the test runner script
node scripts/test-runner.js smoke
node scripts/test-runner.js ci
node scripts/test-runner.js full
```

### Test Reporter

```bash
# Generate reports
node scripts/test-reporter.js html
node scripts/test-reporter.js coverage
node scripts/test-reporter.js all
```

### Test Validator

```bash
# Validate test configuration
node scripts/test-validator.js all
```

## Configuration

### Test Configuration

The test configuration is centralized in `tests/config/test-config.js`:

```javascript
export const testConfig = {
    baseURL: 'http://localhost:3000',
    timeout: {
        default: 10000,
        sceneTransition: 5000,
        buttonClick: 2000,
        dataLoad: 8000
    },
    scenes: {
        mainMenu: 'MainMenuScene',
        goalLibrary: 'GoalLibraryScene',
        bingoGrid: 'BingoGridScene',
        rewards: 'RewardsScene'
    },
    buttons: {
        mainMenu: {
            goalLibrary: { text: 'Goal Library', x: 382, y: 170 },
            playBingo: { text: 'Play Bingo', x: 382, y: 242 },
            rewards: { text: 'Rewards', x: 382, y: 315 }
        }
    },
    performance: {
        sceneLoadTime: 2000,
        buttonClickTime: 100,
        transitionTime: 1000
    }
};
```

### Playwright Configuration

The Playwright configuration is in `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';
import { testConfig } from './tests/config/test-config.js';

export default defineConfig({
    testDir: './tests/phaser',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? testConfig.retries : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: testConfig.baseURL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: testConfig.baseURL,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
    }
});
```

## Troubleshooting

### Common Issues

#### 1. Scene Not Loading
```javascript
// Ensure proper scene waiting
await PhaserTestHelper.waitForScene(page, 'SceneName', 10000);
```

#### 2. Button Not Found
```javascript
// Check button text and scene
const success = await PhaserTestHelper.testButtonClick(
    page, 
    'Exact Button Text', 
    'CorrectSceneName'
);
```

#### 3. Performance Issues
```javascript
// Increase timeout for slow operations
await PhaserTestHelper.testPerformance(
    page, 
    'SceneName',
    operation,
    { timeout: 10000 }
);
```

#### 4. Data Flow Errors
```javascript
// Verify ApplicationStateManager availability
const dataFlow = await PhaserTestHelper.testDataFlow(page, 'SceneName');
if (!dataFlow.success) {
    console.error('Data flow error:', dataFlow.error);
}
```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Or use Playwright directly
npx playwright test --debug
```

### Logging

```javascript
// Enable detailed logging
test('debug test', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Your test code here
});
```

## Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Scene Testing
- Always wait for scenes to be active
- Test both positive and negative scenarios
- Verify scene state after transitions

### 3. Button Testing
- Use exact button text for identification
- Test both click and hover interactions
- Verify accessibility properties

### 4. Performance Testing
- Set realistic performance thresholds
- Test under different conditions
- Monitor memory usage

### 5. Accessibility Testing
- Test keyboard navigation
- Verify ARIA attributes
- Check color contrast and visibility

### 6. Error Handling
- Test error recovery scenarios
- Validate graceful degradation
- Check memory leak prevention

### 7. Data Flow Testing
- Test data persistence across scenes
- Verify state synchronization
- Check event-driven updates

### 8. Maintenance
- Keep tests up to date with code changes
- Regular test review and refactoring
- Monitor test performance and reliability

## Documentation

- [Testing Guide](./phaser-testing-guide.md) - Comprehensive testing guide
- [Maintenance Procedures](./maintenance.md) - Maintenance and troubleshooting
- [Examples](./examples.md) - Common testing patterns and examples

## Contributing

1. Follow the established test patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details

---

*Phaser Scene Testing Framework v1.0.0*
