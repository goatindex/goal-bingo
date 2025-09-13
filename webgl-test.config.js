/**
 * WebGL Test Configuration
 * 
 * ARCHITECTURE NOTES:
 * - Configuration for WebGL test runner
 * - Defines test parameters, browser settings, and output options
 * - Separate from Playwright and Vitest configurations
 */

module.exports = {
    // Browser configuration
    browser: {
        headless: process.env.CI ? true : false, // Show browser in development
        args: [
            '--enable-webgl',
            '--enable-gpu',
            '--enable-gpu-rasterization',
            '--enable-zero-copy',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    },
    
    // Test environment
    environment: {
        baseURL: 'http://localhost:3008',
        viewport: { width: 1200, height: 800 },
        timeout: 30000 // 30 seconds per test
    },
    
    // Visual regression testing
    visual: {
        threshold: 0.2, // Image comparison threshold
        baselineDir: './tests/webgl/baselines',
        outputDir: './test-results/webgl'
    },
    
    // Performance thresholds
    performance: {
        minFPS: 30,
        maxDrawCalls: 1000,
        maxTextureMemory: 100
    },
    
    // Test categories
    categories: {
        context: true,      // WebGL context validation
        rendering: true,    // Canvas rendering output
        performance: true,  // Performance metrics
        errorHandling: true, // Error handling
        textures: true,     // Texture management
        pipeline: true      // Rendering pipeline
    }
};
