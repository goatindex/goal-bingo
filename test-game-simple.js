/**
 * Simple Game Functionality Test
 * Tests the actual game by loading it in a headless browser
 */

const puppeteer = require('puppeteer');

async function testGameFunctionality() {
    console.log('🚀 Starting Game Functionality Test...');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false, // Set to true for headless testing
            devtools: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to game
        console.log('📱 Navigating to game...');
        await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        // Wait for game to load
        console.log('⏳ Waiting for game to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test 1: Check if game container exists
        console.log('🧪 Test 1: Game Container');
        const gameContainer = await page.$('#game-container');
        if (gameContainer) {
            console.log('✅ Game container found');
        } else {
            console.log('❌ Game container not found');
        }
        
        // Test 2: Check if Phaser game is initialized
        console.log('🧪 Test 2: Phaser Game Initialization');
        const gameExists = await page.evaluate(() => {
            return typeof window.game !== 'undefined' && window.game !== null;
        });
        
        if (gameExists) {
            console.log('✅ Phaser game initialized');
            
            // Get game info
            const gameInfo = await page.evaluate(() => {
                const game = window.game;
                return {
                    isRunning: game.isRunning,
                    sceneCount: game.scene.scenes.length,
                    currentScene: game.scene.isActive('MainMenuScene') ? 'MainMenuScene' : 'Unknown',
                    rendererType: game.renderer.type,
                    isWebGL: game.renderer.gl !== null
                };
            });
            
            console.log('📊 Game Info:', gameInfo);
            
        } else {
            console.log('❌ Phaser game not initialized');
        }
        
        // Test 3: Check for console errors
        console.log('🧪 Test 3: Console Errors');
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (consoleErrors.length > 0) {
            console.log('❌ Console errors found:');
            consoleErrors.forEach(error => console.log(`  - ${error}`));
        } else {
            console.log('✅ No console errors');
        }
        
        // Test 4: Check if buttons are clickable
        console.log('🧪 Test 4: Button Functionality');
        const buttons = await page.$$('button');
        console.log(`📊 Found ${buttons.length} buttons`);
        
        if (buttons.length > 0) {
            // Try to click the first button
            try {
                await buttons[0].click();
                console.log('✅ Button click successful');
            } catch (error) {
                console.log('❌ Button click failed:', error.message);
            }
        }
        
        // Test 5: Check scene transitions
        console.log('🧪 Test 5: Scene Transitions');
        const sceneTransition = await page.evaluate(() => {
            const game = window.game;
            if (game && game.scene) {
                // Try to start a different scene
                try {
                    game.scene.start('GoalLibraryScene');
                    return true;
                } catch (error) {
                    return false;
                }
            }
            return false;
        });
        
        if (sceneTransition) {
            console.log('✅ Scene transition successful');
        } else {
            console.log('❌ Scene transition failed');
        }
        
        // Wait a bit to see the result
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 6: Take screenshot
        console.log('🧪 Test 6: Visual Verification');
        await page.screenshot({ 
            path: 'game-test-screenshot.png',
            fullPage: true 
        });
        console.log('📸 Screenshot saved as game-test-screenshot.png');
        
        console.log('🎉 Game functionality test completed!');
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testGameFunctionality().catch(console.error);
