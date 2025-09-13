/**
 * Vitest Configuration for Cleanup System Tests
 * ARCHITECTURE NOTE: This configures Vitest for testing the cleanup system
 * Ensures proper test environment and module resolution
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // ARCHITECTURE NOTE: Test environment setup
        // This provides a browser-like environment for testing
        environment: 'jsdom',
        
        // ARCHITECTURE NOTE: Setup files
        // This runs setup files before tests
        setupFiles: ['tests/setup.js'],
        
        // ARCHITECTURE NOTE: Test file patterns
        // This defines which files are considered test files
        include: [
            'tests/**/*.test.js',
            'tests/**/*.spec.js'
        ],
        
        // ARCHITECTURE NOTE: Coverage configuration
        // This configures test coverage reporting
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            reportsDirectory: 'coverage',
            include: ['src/**/*.js'],
            exclude: [
                'src/**/*.test.js',
                'src/**/*.spec.js',
                'tests/**/*.js'
            ]
        },
        
        // ARCHITECTURE NOTE: Test timeout
        // This sets the default timeout for tests
        testTimeout: 10000,
        
        // ARCHITECTURE NOTE: Global configuration
        // This makes test globals available
        globals: true
    },
    
    // ARCHITECTURE NOTE: Module resolution
    // This ensures proper module resolution for ES6 imports
    resolve: {
        alias: {
            '@': '/src'
        }
    }
});
