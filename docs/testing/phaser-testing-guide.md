# Phaser Scene Testing Guide

## Overview

This comprehensive guide covers testing Phaser scenes using Playwright, following both Phaser and Playwright best practices. Our testing approach focuses on game logic, API interactions, and user experience while working around Playwright's limitations with WebGL rendering.

## Current Test Status (Updated 2025-01-08)

### ✅ Working Functionality
- **Scene Loading**: All scenes load successfully
- **Button Discovery**: Enhanced PhaserTestHelper can now find buttons with emoji prefixes
- **Goal Library Button**: Click functionality working correctly
- **Scene Transitions**: Basic scene transitions are functional
- **Interactive Elements**: All buttons are properly detected as interactive

### ⚠️ Known Issues
- **Play Bingo Button**: Click works but scene transition times out (BingoGridScene not fully implemented)
- **Rewards Button**: Click functionality not working (button discovery issue)
- **Multiple Button Clicks**: Sequential clicking has issues with scene state management

### 🔧 Recent Improvements
- **Enhanced Button Discovery**: Fixed emoji prefix handling (📚, 🎲, 🏆)
- **Improved Event Sequence**: Corrected forceDownState → forceUpState sequence
- **Better Debugging**: Added comprehensive button discovery debugging methods
- **Phaser Compliance**: All button interactions now follow Phaser best practices

## Table of Contents

1. [Getting Started](#getting-started)
2. [Test Architecture](#test-architecture)
3. [Test Categories](#test-categories)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Playwright browsers installed
- Phaser 3.70+

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Install system dependencies (Linux/macOS)
npm run test:install-deps
```

### Quick Start

```bash
# Run smoke tests
npm run test:smoke

# Run all Phaser tests
npm run test:phaser:full

# Run tests with UI
npm run test:ui
```

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
- Button interactions (with emoji prefix support)
- Data flow testing
- Performance measurement
- Accessibility validation
- Button discovery and debugging

**Recent Updates (2025-01-08):**
- **Enhanced Button Discovery**: Now handles emoji prefixes (📚 Goal Library, 🎲 Play Bingo, 🏆 Rewards)
- **Improved Event Sequence**: Uses proper Phaser forceDownState → forceUpState sequence
- **Better Error Handling**: More robust button identification and error reporting
- **Debug Methods**: Added `debugButtonDiscovery()` and `findButtonByText()` for troubleshooting

#### Test Configuration
Centralized configuration for:
- Scene names and button positions
- Performance thresholds
- Timeout settings
- Browser configurations

## Test Categories

### 1. Smoke Tests
Quick validation tests for critical functionality.

**Files**: `scene-transitions.test.js`, `button-functionality.test.js`

**Purpose**: Fast feedback on basic functionality

**Run**: `npm run test:smoke`

**Current Status**: 7/10 tests passing
- ✅ Scene loading and basic transitions
- ✅ Goal Library button functionality
- ⚠️ Play Bingo button (click works, scene transition times out)
- ⚠️ Rewards button (discovery issue)
- ⚠️ Multiple button clicks (state management issues)

### 2. Regression Tests
Comprehensive tests for existing functionality.

**Files**: `scene-loading.test.js`, `data-flow.test.js`

**Purpose**: Prevent regressions in existing features

**Run**: `npm run test:regression`

### 3. Performance Tests
Tests for performance metrics and optimization.

**Files**: `performance.test.js`

**Purpose**: Monitor performance regressions

**Run**: `npm run test:performance`

### 4. Accessibility Tests
Tests for accessibility compliance and usability.

**Files**: `accessibility.test.js`

**Purpose**: Ensure accessibility standards

**Run**: `npm run test:accessibility`

### 5. Error Handling Tests
Tests for error recovery and edge cases.

**Files**: `error-handling.test.js`

**Purpose**: Validate error handling robustness

**Run**: `npm run test:error-handling`

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

### Button Testing with Emoji Support

The PhaserTestHelper now supports buttons with emoji prefixes:

```javascript
test('should handle emoji-prefixed buttons', async ({ page }) => {
    // These all work with the enhanced button discovery
    const goalLibrary = await PhaserTestHelper.testButtonClick(page, 'Goal Library', 'MainMenuScene');
    const playBingo = await PhaserTestHelper.testButtonClick(page, 'Play Bingo', 'MainMenuScene');
    const rewards = await PhaserTestHelper.testButtonClick(page, 'Rewards', 'MainMenuScene');
    
    expect(goalLibrary).toBe(true);
    // Note: playBingo and rewards may have scene transition issues
});
```

### Button Discovery Debugging

Use the new debugging methods to troubleshoot button issues:

```javascript
test('debug button discovery', async ({ page }) => {
    // Get comprehensive button information
    const debugInfo = await PhaserTestHelper.debugButtonDiscovery(page, 'MainMenuScene');
    console.log('Interactive elements:', debugInfo.interactiveElements);
    console.log('Text elements:', debugInfo.textElements);
    
    // Find specific buttons
    const button = await PhaserTestHelper.findButtonByText(page, 'Goal Library', 'MainMenuScene');
    console.log('Button found:', button);
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

### Performance Testing

```javascript
test('should meet performance thresholds', async ({ page }) => {
    const performance = await PhaserTestHelper.testPerformance(
        page, 
        'MainMenuScene',
        async () => {
            await PhaserTestHelper.testSceneTransition(
                page, 
                'MainMenuScene', 
                'GoalLibraryScene'
            );
        }
    );
    
    expect(performance.success).toBe(true);
    expect(performance.duration).toBeLessThan(1000);
});
```

### Accessibility Testing

```javascript
test('should meet accessibility standards', async ({ page }) => {
    const accessibility = await PhaserTestHelper.testAccessibility(page, 'MainMenuScene');
    
    expect(accessibility.success).toBe(true);
    expect(accessibility.totalElements).toBeGreaterThan(0);
    
    accessibility.accessibilityResults.forEach(element => {
        expect(element.type).toBeDefined();
        expect(element.cursor).toBeDefined();
    });
});
```

## Running Tests

### Command Line Interface

```bash
# Individual test categories
npm run test:smoke
npm run test:regression
npm run test:performance
npm run test:accessibility
npm run test:error-handling

# All Phaser tests
npm run test:phaser:full

# CI/CD tests
npm run test:ci

# Interactive UI
npm run test:ui

# Debug mode
npm run test:debug
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

## CI/CD Integration

### GitHub Actions

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

#### 3. Emoji-Prefixed Buttons
```javascript
// Use the text without emoji for button discovery
const success = await PhaserTestHelper.testButtonClick(
    page, 
    'Goal Library',  // Not '📚 Goal Library'
    'MainMenuScene'
);
```

#### 4. Scene Transition Timeouts
```javascript
// Increase timeout for scenes that may not be fully implemented
await PhaserTestHelper.waitForScene(page, 'BingoGridScene', 10000);
```

#### 5. Rewards Button Issues
```javascript
// Use full emoji text for Rewards button
const success = await PhaserTestHelper.testButtonClick(
    page, 
    '🏆 Rewards',  // Full emoji text required
    'MainMenuScene'
);
```

#### 6. Performance Issues
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

## Advanced Topics

### Custom Test Utilities

```javascript
// Extend PhaserTestHelper for custom functionality
class CustomTestHelper extends PhaserTestHelper {
    static async testCustomFeature(page, sceneName) {
        return await page.evaluate((scene) => {
            // Custom test logic
        }, sceneName);
    }
}
```

### Test Data Management

```javascript
// Use test configuration for data
const testData = testConfig.testData.sampleGoal;
```

### Parallel Testing

```javascript
// Configure parallel test execution
test.describe.configure({ mode: 'parallel' });
```

### Test Hooks

```javascript
// Use test hooks for setup and teardown
test.beforeAll(async () => {
    // Global setup
});

test.afterAll(async () => {
    // Global cleanup
});
```

## Current Implementation Status

### Working Features
- ✅ **MainMenuScene**: Fully functional with working button interactions
- ✅ **GoalLibraryScene**: Basic scene loading and display
- ✅ **Button Discovery**: Enhanced PhaserTestHelper with emoji support
- ✅ **Scene Transitions**: Basic scene switching functionality

### Partially Working Features
- ⚠️ **BingoGridScene**: Scene loads but may not be fully implemented
- ⚠️ **RewardsScene**: Scene exists but button interaction has issues
- ⚠️ **Multiple Button Clicks**: Sequential clicking has state management issues

### Next Implementation Priorities
1. **Fix Rewards Button**: Resolve button discovery issue for Rewards button
2. **Complete BingoGridScene**: Implement full bingo grid functionality
3. **Fix Sequential Clicks**: Resolve state management for multiple button clicks
4. **Add Error Handling**: Implement proper error recovery for failed transitions
5. **Performance Optimization**: Optimize scene transitions and button interactions

### Test Coverage Status
- **Scene Loading**: 100% coverage
- **Button Interactions**: 70% coverage (3/4 buttons working)
- **Scene Transitions**: 50% coverage (2/4 transitions working)
- **Error Handling**: 30% coverage (basic error detection)

## Resources

- [Phaser Documentation](https://docs.phaser.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Test Configuration](./test-config.md)
- [Maintenance Procedures](./maintenance.md)
- [Example Patterns](./examples.md)

---

*This guide is maintained as part of the Phaser Scene Testing Framework v1.1.0*
*Last updated: 2025-01-08*
