/**
 * Phaser-Compliant Application Lifecycle E2E Tests
 * 
 * ARCHITECTURE NOTES:
 * - Uses ONLY standard Phaser properties and methods
 * - Tests actual Phaser game object structure (game.scene, game.registry, etc.)
 * - Validates Phaser's built-in systems, not custom architecture
 * - Uses page.evaluate() for game state validation
 * 
 * PHASER STANDARD PROPERTIES:
 * - game.isRunning: Boolean indicating if game is running
 * - game.scene: Scene Manager instance
 * - game.registry: Data Manager for global data storage
 * - game.events: Event Emitter for game events
 * - game.renderer: Renderer instance (WebGL/Canvas)
 * - game.canvas: HTML Canvas element
 * - game.loop: Game loop with FPS tracking
 * - game.config: Game configuration object
 */

import { test, expect } from '@playwright/test';

test.describe('Phaser-Compliant Application Lifecycle', () => {
    test('Game Initialization with Standard Phaser Properties', async ({ page }) => {
        // Navigate to the application
        await page.goto('/');
        
        // Wait for Phaser to initialize
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Validate using ONLY standard Phaser properties
        const gameState = await page.evaluate(() => {
            const game = window.game;
            
            // PHASER STANDARD: Use only documented Phaser properties
            // Get active scenes using correct Phaser API
            const activeScenes = game.scene.getScenes(true);
            const activeScene = activeScenes.length > 0 ? activeScenes[0].scene.key : null;
            
            return {
                isRunning: game.isRunning,
                activeScene: activeScene,
                rendererType: game.renderer.type,
                canvasWidth: game.canvas.width,
                canvasHeight: game.canvas.height,
                configWidth: game.config.width,
                configHeight: game.config.height,
                hasRegistry: !!game.registry,
                hasEvents: !!game.events,
                hasSceneManager: !!game.scene,
                hasRenderer: !!game.renderer,
                hasCanvas: !!game.canvas,
                hasLoop: !!game.loop
            };
        });
        
        // Validate standard Phaser properties
        expect(gameState.isRunning).toBe(true);
        expect(gameState.activeScene).toBe('MainMenuScene');
        expect(gameState.rendererType).toBeGreaterThan(0); // WebGL or Canvas
        expect(gameState.canvasWidth).toBeGreaterThan(0);
        expect(gameState.canvasHeight).toBeGreaterThan(0);
        expect(gameState.configWidth).toBe(1200);
        expect(gameState.configHeight).toBe(800);
        
        // Validate Phaser systems are available
        expect(gameState.hasRegistry).toBe(true);
        expect(gameState.hasEvents).toBe(true);
        expect(gameState.hasSceneManager).toBe(true);
        expect(gameState.hasRenderer).toBe(true);
        expect(gameState.hasCanvas).toBe(true);
        expect(gameState.hasLoop).toBe(true);
    });
    
    test('Scene Manager Functionality', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test Phaser's scene manager
        const sceneData = await page.evaluate(() => {
            const game = window.game;
            const sceneManager = game.scene;
            
            // Get active scenes using correct Phaser API
            const activeScenes = sceneManager.getScenes(true);
            const activeScene = activeScenes.length > 0 ? activeScenes[0].scene.key : null;
            
            return {
                activeScene: activeScene,
                sceneCount: sceneManager.scenes.length,
                sceneKeys: sceneManager.scenes.map(s => s.scene.key),
                isSceneActive: sceneManager.isActive('MainMenuScene'),
                isSceneVisible: sceneManager.isVisible('MainMenuScene'),
                isSceneSleeping: sceneManager.isSleeping('MainMenuScene')
            };
        });
        
        expect(sceneData.activeScene).toBe('MainMenuScene');
        expect(sceneData.sceneCount).toBeGreaterThan(0);
        expect(sceneData.sceneKeys).toContain('MainMenuScene');
        expect(sceneData.isSceneActive).toBe(true);
        expect(sceneData.isSceneVisible).toBe(true);
        expect(sceneData.isSceneSleeping).toBe(false);
    });
    
    test('Registry Data Management', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test Phaser's registry (data manager)
        const registryData = await page.evaluate(() => {
            const game = window.game;
            const registry = game.registry;
            
            // Test basic registry operations
            registry.set('testKey', 'testValue');
            registry.set('testObject', { name: 'Test', value: 123 });
            
            const stringValue = registry.get('testKey');
            const objectValue = registry.get('testObject');
            const allData = registry.list;
            
            return {
                stringValue,
                objectValue,
                allDataKeys: Object.keys(allData),
                hasTestKey: allData.hasOwnProperty('testKey'),
                hasTestObject: allData.hasOwnProperty('testObject')
            };
        });
        
        expect(registryData.stringValue).toBe('testValue');
        expect(registryData.objectValue).toEqual({ name: 'Test', value: 123 });
        expect(registryData.hasTestKey).toBe(true);
        expect(registryData.hasTestObject).toBe(true);
    });
    
    test('Event System Functionality', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test Phaser's event system
        const eventData = await page.evaluate(() => {
            const game = window.game;
            const events = game.events;
            
            let eventFired = false;
            let eventData = null;
            
            // Listen for a custom event
            events.on('testEvent', (data) => {
                eventFired = true;
                eventData = data;
            });
            
            // Emit the event
            events.emit('testEvent', { message: 'Hello from Phaser!' });
            
            return {
                eventFired,
                eventData,
                hasEvents: !!events,
                hasOn: typeof events.on === 'function',
                hasEmit: typeof events.emit === 'function'
            };
        });
        
        expect(eventData.eventFired).toBe(true);
        expect(eventData.eventData.message).toBe('Hello from Phaser!');
        expect(eventData.hasEvents).toBe(true);
        expect(eventData.hasOn).toBe(true);
        expect(eventData.hasEmit).toBe(true);
    });
    
    test('Renderer and Canvas Properties', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test Phaser's renderer and canvas
        const rendererData = await page.evaluate(() => {
            const game = window.game;
            const renderer = game.renderer;
            const canvas = game.canvas;
            
            return {
                rendererType: renderer.type,
                isWebGL: renderer.gl !== null,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                canvasClientWidth: canvas.clientWidth,
                canvasClientHeight: canvas.clientHeight,
                hasCanvas: !!canvas,
                hasRenderer: !!renderer,
                drawCalls: renderer.drawCalls,
                textureManager: !!renderer.textureManager
            };
        });
        
        expect(rendererData.rendererType).toBeGreaterThan(0);
        expect(rendererData.canvasWidth).toBeGreaterThan(0);
        expect(rendererData.canvasHeight).toBeGreaterThan(0);
        expect(rendererData.hasCanvas).toBe(true);
        expect(rendererData.hasRenderer).toBe(true);
        expect(rendererData.textureManager).toBe(true);
    });
    
    test('Game Loop and Performance', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test Phaser's game loop
        const loopData = await page.evaluate(() => {
            const game = window.game;
            const loop = game.loop;
            
            return {
                actualFps: loop.actualFps,
                targetFps: loop.targetFps,
                hasLoop: !!loop,
                isRunning: game.isRunning,
                step: loop.step,
                time: loop.time
            };
        });
        
        expect(loopData.actualFps).toBeGreaterThan(0);
        expect(loopData.targetFps).toBeGreaterThan(0);
        expect(loopData.hasLoop).toBe(true);
        expect(loopData.isRunning).toBe(true);
    });
    
    test('Scene Transitions', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test scene transitions using Phaser's scene manager
        const transitionData = await page.evaluate(() => {
            const game = window.game;
            const sceneManager = game.scene;
            
            // Get initial scene using correct Phaser API
            const initialActiveScenes = sceneManager.getScenes(true);
            const initialScene = initialActiveScenes.length > 0 ? initialActiveScenes[0].scene.key : null;
            
            // Start a new scene (this will transition)
            sceneManager.start('GoalLibraryScene');
            
            // Get new scene after transition
            const newActiveScenes = sceneManager.getScenes(true);
            const newScene = newActiveScenes.length > 0 ? newActiveScenes[0].scene.key : null;
            
            return {
                initialScene,
                newScene,
                sceneChanged: initialScene !== newScene
            };
        });
        
        expect(transitionData.initialScene).toBe('MainMenuScene');
        expect(transitionData.newScene).toBe('GoalLibraryScene');
        expect(transitionData.sceneChanged).toBe(true);
    });
    
    test('Error Handling with Phaser Systems', async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isRunning);
        
        // Test error handling
        const errorData = await page.evaluate(() => {
            const game = window.game;
            let errorCaught = false;
            
            // Override console.error to catch errors
            const originalConsoleError = console.error;
            console.error = (message) => {
                errorCaught = true;
                originalConsoleError(message);
            };
            
            // Try to start a non-existent scene
            try {
                game.scene.start('NonExistentScene');
            } catch (error) {
                errorCaught = true;
            }
            
            // Restore console.error
            console.error = originalConsoleError;
            
            // Get active scene using correct Phaser API
            const activeScenes = game.scene.getScenes(true);
            const activeScene = activeScenes.length > 0 ? activeScenes[0].scene.key : null;
            
            return {
                errorCaught,
                gameStillRunning: game.isRunning,
                activeScene: activeScene,
                systemsIntact: !!game.registry && !!game.events && !!game.scene
            };
        });
        
        expect(errorData.gameStillRunning).toBe(true);
        expect(errorData.systemsIntact).toBe(true);
    });
});
