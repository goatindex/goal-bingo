/**
 * Test Configuration for Phaser Scene Testing
 * 
 * This file contains configuration settings for automated testing of Phaser scenes
 * using Playwright. It follows both Phaser and Playwright best practices.
 * 
 * @author AI Assistant
 * @version 1.0.0
 * @since 2024
 */

export const testConfig = {
    // Base URL for testing
    baseURL: 'http://localhost:3000',
    
    // Timeout settings
    timeout: {
        default: 10000,
        sceneTransition: 5000,
        buttonClick: 2000,
        dataLoad: 8000
    },
    
    // Retry settings
    retries: 2,
    
    // Scene configuration
    scenes: {
        mainMenu: 'MainMenuScene',
        goalLibrary: 'GoalLibraryScene',
        bingoGrid: 'BingoGridScene',
        rewards: 'RewardsScene',
        test: 'TestScene',
        boot: 'BootScene',
        preload: 'PreloadScene'
    },
    
    // Button positions and text (for testing)
    buttons: {
        mainMenu: {
            goalLibrary: { text: 'Goal Library', x: 382, y: 170 },
            playBingo: { text: 'Play Bingo', x: 382, y: 242 },
            rewards: { text: 'Rewards', x: 382, y: 315 }
        },
        goalLibrary: {
            back: { text: 'Back', x: 50, y: 50 },
            addGoal: { text: 'Add Goal', x: 600, y: 50 }
        },
        bingoGrid: {
            back: { text: 'Back', x: 50, y: 50 },
            newGame: { text: 'New Game', x: 600, y: 50 }
        },
        rewards: {
            back: { text: 'Back', x: 50, y: 50 }
        }
    },
    
    // Test data
    testData: {
        sampleGoal: {
            title: 'Test Goal',
            description: 'This is a test goal for automated testing',
            category: 'Health',
            difficulty: 'Medium',
            points: 10
        },
        sampleCategory: {
            name: 'Test Category',
            color: '#FF5733',
            description: 'Test category for automated testing'
        }
    },
    
    // Performance thresholds
    performance: {
        sceneLoadTime: 2000, // Maximum scene load time in ms
        buttonClickTime: 100, // Maximum button click response time in ms
        transitionTime: 1000 // Maximum scene transition time in ms
    },
    
    // Accessibility requirements
    accessibility: {
        minInteractiveElements: 1,
        requireLabels: true,
        requireHints: false,
        requireKeyboardNavigation: true
    },
    
    // Test categories
    categories: {
        smoke: ['scene-transitions', 'button-functionality'],
        regression: ['scene-loading', 'data-flow'],
        performance: ['scene-performance', 'transition-performance'],
        accessibility: ['button-accessibility', 'keyboard-navigation']
    },
    
    // Browser settings
    browser: {
        headless: false, // Set to true for CI/CD
        slowMo: 100, // Slow down operations for debugging
        viewport: { width: 1200, height: 800 }
    },
    
    // Reporting settings
    reporting: {
        outputDir: 'test-results',
        screenshots: true,
        videos: false,
        traces: true
    }
};

export default testConfig;
