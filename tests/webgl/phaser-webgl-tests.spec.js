/**
 * Phaser WebGL-Specific Tests
 * 
 * ARCHITECTURE NOTES:
 * - Tests WebGL rendering capabilities specific to Phaser
 * - Uses canvas.toDataURL() for WebGL content capture (limited but functional)
 * - Validates Phaser's WebGL renderer properties and methods
 * - Tests WebGL context and rendering pipeline
 */

import { test, expect } from '@playwright/test';

test.describe('Phaser WebGL Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
    });
    
    test('WebGL Context and Renderer Validation', async ({ page }) => {
        // Test WebGL context and renderer properties
        const webglData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const canvas = game.canvas;
            
            // Get WebGL context
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            return {
                rendererType: renderer.type,
                isWebGL: renderer.gl !== null,
                hasWebGLContext: !!gl,
                webglVersion: gl ? gl.getParameter(gl.VERSION) : null,
                maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null,
                maxViewportDims: gl ? gl.getParameter(gl.MAX_VIEWPORT_DIMS) : null,
                supportedExtensions: gl ? gl.getSupportedExtensions() : null,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            };
        });
        
        // Validate WebGL is being used
        expect(webglData.rendererType).toBeGreaterThan(0);
        expect(webglData.isWebGL).toBe(true);
        expect(webglData.hasWebGLContext).toBe(true);
        expect(webglData.webglVersion).toContain('WebGL');
        expect(webglData.maxTextureSize).toBeGreaterThan(0);
        expect(webglData.canvasWidth).toBeGreaterThan(0);
        expect(webglData.canvasHeight).toBeGreaterThan(0);
    });
    
    test('Canvas Rendering Output', async ({ page }) => {
        // Wait for scene to fully render
        await page.waitForTimeout(2000);
        
        // Capture canvas as image (this works for WebGL content)
        const canvasImage = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Validate canvas has content
        expect(canvasImage).toBeDefined();
        expect(canvasImage).toContain('data:image/png;base64,');
        
        // Check image size (should not be empty)
        const imageData = canvasImage.split(',')[1];
        expect(imageData.length).toBeGreaterThan(1000); // Reasonable size for a rendered scene
    });
    
    test('Scene Rendering Differences', async ({ page }) => {
        // Capture initial scene
        await page.waitForTimeout(1000);
        const initialImage = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Navigate to different scene
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.click();
        await page.waitForTimeout(1000);
        
        // Capture new scene
        const newImage = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Images should be different (different scenes)
        expect(initialImage).not.toBe(newImage);
        
        // Both should have content
        expect(initialImage.length).toBeGreaterThan(1000);
        expect(newImage.length).toBeGreaterThan(1000);
    });
    
    test('WebGL Performance Metrics', async ({ page }) => {
        // Test WebGL performance
        const performanceData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const loop = game.loop;
            
            return {
                fps: loop.actualFps,
                targetFps: loop.targetFps,
                drawCalls: renderer.drawCalls,
                textureMemory: renderer.textureManager.usedTextureSlots,
                maxTextures: renderer.textureManager.maxTextures,
                isWebGL: renderer.gl !== null,
                rendererType: renderer.type
            };
        });
        
        // Validate performance metrics
        expect(performanceData.fps).toBeGreaterThan(30);
        expect(performanceData.targetFps).toBeGreaterThan(0);
        expect(performanceData.drawCalls).toBeGreaterThan(0);
        expect(performanceData.isWebGL).toBe(true);
        expect(performanceData.rendererType).toBeGreaterThan(0);
    });
    
    test('WebGL Error Handling', async ({ page }) => {
        // Test WebGL error handling
        const errorData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const canvas = game.canvas;
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            let errorCaught = false;
            let webglError = false;
            
            // Override console.error to catch errors
            const originalConsoleError = console.error;
            console.error = (message) => {
                errorCaught = true;
                if (message.includes('WebGL') || message.includes('GL')) {
                    webglError = true;
                }
                originalConsoleError(message);
            };
            
            // Try to trigger WebGL errors
            try {
                if (gl) {
                    // This should not cause a crash
                    gl.getParameter(0x9999); // Invalid parameter
                }
            } catch (error) {
                errorCaught = true;
            }
            
            // Restore console.error
            console.error = originalConsoleError;
            
            return {
                errorCaught,
                webglError,
                gameStillRunning: game.isRunning,
                rendererStillValid: !!renderer,
                canvasStillVisible: canvas.width > 0 && canvas.height > 0,
                webglContextStillValid: !!gl
            };
        });
        
        // WebGL should still be functional after error
        expect(errorData.gameStillRunning).toBe(true);
        expect(errorData.rendererStillValid).toBe(true);
        expect(errorData.canvasStillVisible).toBe(true);
        expect(errorData.webglContextStillValid).toBe(true);
    });
    
    test('Cross-Browser WebGL Compatibility', async ({ page, browserName }) => {
        // Test WebGL compatibility across browsers
        const compatibilityData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const canvas = game.canvas;
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            return {
                browserName: navigator.userAgent,
                rendererType: renderer.type,
                isWebGL: renderer.gl !== null,
                webglVersion: gl ? gl.getParameter(gl.VERSION) : null,
                vendor: gl ? gl.getParameter(gl.VENDOR) : null,
                renderer: gl ? gl.getParameter(gl.RENDERER) : null,
                maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null,
                maxVertexAttribs: gl ? gl.getParameter(gl.MAX_VERTEX_ATTRIBS) : null,
                maxVaryingVectors: gl ? gl.getParameter(gl.MAX_VARYING_VECTORS) : null,
                supportedExtensions: gl ? gl.getSupportedExtensions() : null
            };
        });
        
        // Validate WebGL compatibility
        expect(compatibilityData.isWebGL).toBe(true);
        expect(compatibilityData.webglVersion).toContain('WebGL');
        expect(compatibilityData.maxTextureSize).toBeGreaterThan(0);
        expect(compatibilityData.maxVertexAttribs).toBeGreaterThan(0);
        
        console.log(`WebGL compatibility for ${browserName}:`, {
            rendererType: compatibilityData.rendererType,
            webglVersion: compatibilityData.webglVersion,
            maxTextureSize: compatibilityData.maxTextureSize
        });
    });
    
    test('WebGL Texture and Memory Management', async ({ page }) => {
        // Test WebGL texture and memory management
        const textureData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const textureManager = renderer.textureManager;
            
            return {
                usedTextureSlots: textureManager.usedTextureSlots,
                maxTextures: textureManager.maxTextures,
                textureSlotsUsed: textureManager.textureSlotsUsed,
                hasTextureManager: !!textureManager,
                rendererType: renderer.type,
                isWebGL: renderer.gl !== null
            };
        });
        
        // Validate texture management
        expect(textureData.hasTextureManager).toBe(true);
        expect(textureData.maxTextures).toBeGreaterThan(0);
        expect(textureData.isWebGL).toBe(true);
        expect(textureData.rendererType).toBeGreaterThan(0);
    });
    
    test('WebGL Rendering Pipeline', async ({ page }) => {
        // Test WebGL rendering pipeline
        const pipelineData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const pipelineManager = renderer.pipelines;
            
            return {
                hasPipelineManager: !!pipelineManager,
                defaultPipeline: pipelineManager.default,
                pipelineCount: pipelineManager.list.length,
                isWebGL: renderer.gl !== null,
                rendererType: renderer.type
            };
        });
        
        // Validate rendering pipeline
        expect(pipelineData.hasPipelineManager).toBe(true);
        expect(pipelineData.pipelineCount).toBeGreaterThan(0);
        expect(pipelineData.isWebGL).toBe(true);
        expect(pipelineData.rendererType).toBeGreaterThan(0);
    });
});
