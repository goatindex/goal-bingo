/**
 * WebGL Visual Regression Tests
 * 
 * ARCHITECTURE NOTES:
 * - Tests WebGL canvas rendering and visual output
 * - Uses canvas.toDataURL() for WebGL content capture
 * - Compares visual output against baseline images
 * - Handles WebGL-specific rendering validation
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('WebGL Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
    });
    
    test('Main Menu Visual Rendering', async ({ page }) => {
        // Wait for scene to fully render
        await page.waitForTimeout(2000);
        
        // Capture WebGL canvas as image
        const canvasImage = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Convert base64 to buffer for comparison
        const imageBuffer = Buffer.from(canvasImage.split(',')[1], 'base64');
        
        // Compare with baseline (stored in tests/webgl/baselines/)
        const baselinePath = path.join(__dirname, 'baselines', 'main-menu.png');
        
        if (fs.existsSync(baselinePath)) {
            const baselineBuffer = fs.readFileSync(baselinePath);
            expect(imageBuffer).toEqual(baselineBuffer);
        } else {
            // Create baseline on first run
            fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
            fs.writeFileSync(baselinePath, imageBuffer);
            console.log('Created baseline image:', baselinePath);
        }
    });
    
    test('Scene Transition Visual Changes', async ({ page }) => {
        // Capture initial state
        const initialCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Navigate to Goal Library scene
        const goalLibraryBtn = page.locator('text=📚 Goal Library');
        await goalLibraryBtn.click();
        
        // Wait for scene transition
        await page.waitForFunction(() => 
            window.game.scene.getActiveScene()?.scene?.key === 'GoalLibraryScene'
        );
        
        // Capture new state
        const newCanvas = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            return canvas.toDataURL('image/png');
        });
        
        // Visual change should have occurred
        expect(initialCanvas).not.toBe(newCanvas);
        
        // Save transition image for debugging
        const transitionBuffer = Buffer.from(newCanvas.split(',')[1], 'base64');
        const transitionPath = path.join(__dirname, 'baselines', 'goal-library-scene.png');
        fs.writeFileSync(transitionPath, transitionBuffer);
    });
    
    test('WebGL Context Validation', async ({ page }) => {
        // Test WebGL context and rendering capabilities
        const webglInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            if (!gl) {
                return { hasWebGL: false };
            }
            
            return {
                hasWebGL: true,
                version: gl.getParameter(gl.VERSION),
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
                extensions: gl.getSupportedExtensions()
            };
        });
        
        expect(webglInfo.hasWebGL).toBe(true);
        expect(webglInfo.version).toContain('WebGL');
        expect(webglInfo.maxTextureSize).toBeGreaterThan(0);
        expect(webglInfo.extensions).toBeDefined();
    });
    
    test('Canvas Resolution and Quality', async ({ page }) => {
        // Test canvas resolution and rendering quality
        const canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const game = window.game;
            
            return {
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                clientWidth: canvas.clientWidth,
                clientHeight: canvas.clientHeight,
                devicePixelRatio: window.devicePixelRatio,
                gameWidth: game.config.width,
                gameHeight: game.config.height,
                rendererType: game.renderer.type,
                isWebGL: game.renderer.gl !== null
            };
        });
        
        expect(canvasInfo.canvasWidth).toBeGreaterThan(0);
        expect(canvasInfo.canvasHeight).toBeGreaterThan(0);
        expect(canvasInfo.clientWidth).toBeGreaterThan(0);
        expect(canvasInfo.clientHeight).toBeGreaterThan(0);
        expect(canvasInfo.isWebGL).toBe(true);
        expect(canvasInfo.rendererType).toBeGreaterThan(0);
    });
    
    test('Animation Frame Consistency', async ({ page }) => {
        // Test animation frame consistency
        const frameData = await page.evaluate(() => {
            const game = window.game;
            const frames = [];
            const startTime = Date.now();
            
            // Capture frame data for 1 second
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    frames.push({
                        timestamp: Date.now() - startTime,
                        fps: game.loop.actualFps,
                        drawCalls: game.renderer.drawCalls
                    });
                    
                    if (Date.now() - startTime > 1000) {
                        clearInterval(interval);
                        resolve(frames);
                    }
                }, 100);
            });
        });
        
        expect(frameData.length).toBeGreaterThan(5);
        
        // Check FPS consistency
        const avgFps = frameData.reduce((sum, frame) => sum + frame.fps, 0) / frameData.length;
        expect(avgFps).toBeGreaterThan(30);
        
        // Check draw calls are reasonable
        const avgDrawCalls = frameData.reduce((sum, frame) => sum + frame.drawCalls, 0) / frameData.length;
        expect(avgDrawCalls).toBeLessThan(1000);
    });
    
    test('WebGL Error Handling', async ({ page }) => {
        // Test WebGL error handling
        const errorHandling = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            const errors = [];
            
            // Override console.error to catch WebGL errors
            const originalConsoleError = console.error;
            console.error = (message) => {
                errors.push(message);
                originalConsoleError(message);
            };
            
            // Try to trigger WebGL errors
            try {
                // This should not cause a crash
                gl.getParameter(0x9999); // Invalid parameter
            } catch (error) {
                errors.push('WebGL error caught');
            }
            
            // Restore console.error
            console.error = originalConsoleError;
            
            return {
                errors,
                glStillValid: gl !== null,
                canvasStillVisible: canvas.width > 0 && canvas.height > 0
            };
        });
        
        expect(errorHandling.glStillValid).toBe(true);
        expect(errorHandling.canvasStillVisible).toBe(true);
    });
    
    test('Cross-Browser WebGL Compatibility', async ({ page, browserName }) => {
        // Test WebGL compatibility across browsers
        const compatibility = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            if (!gl) {
                return { compatible: false };
            }
            
            return {
                compatible: true,
                webglVersion: gl.getParameter(gl.VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
                maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
                maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)
            };
        });
        
        expect(compatibility.compatible).toBe(true);
        expect(compatibility.maxTextureSize).toBeGreaterThan(0);
        expect(compatibility.maxVertexAttribs).toBeGreaterThan(0);
        
        console.log(`WebGL compatibility for ${browserName}:`, compatibility);
    });
});
