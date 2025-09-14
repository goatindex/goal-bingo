const puppeteer = require('puppeteer');

async function debugGameState() {
    console.log('🔍 Debugging actual game state...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true 
    });
    
    const page = await browser.newPage();
    
    // Monitor console for 404 errors
    page.on('console', msg => {
        if (msg.text().includes('404')) {
            console.log('🚨 404 ERROR:', msg.text());
        }
        if (msg.text().includes('isActive')) {
            console.log('🚨 isActive ERROR:', msg.text());
        }
    });
    
    // Monitor network requests
    page.on('requestfailed', request => {
        console.log('🚨 REQUEST FAILED:', request.url(), request.failure().errorText);
    });
    
    await page.goto('http://localhost:3000');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check page content
    const content = await page.content();
    console.log('📄 Page content length:', content.length);
    
    // Check game container
    const gameContainer = await page.$('#game-container');
    if (gameContainer) {
        const rect = await gameContainer.boundingBox();
        console.log('🎮 Game container found:', rect);
        
        // Check if container has children
        const children = await page.evaluate(() => {
            const container = document.getElementById('game-container');
            return {
                hasChildren: container.children.length > 0,
                childrenCount: container.children.length,
                innerHTML: container.innerHTML.substring(0, 200)
            };
        });
        console.log('👶 Game container children:', children);
    } else {
        console.log('❌ Game container not found!');
    }
    
    // Check if Phaser game exists
    const gameExists = await page.evaluate(() => {
        return {
            hasGame: typeof window.game !== 'undefined',
            gameRunning: window.game ? window.game.isRunning : false,
            sceneCount: window.game ? window.game.scene.scenes.length : 0,
            currentScene: window.game ? window.game.scene.getActiveScene()?.scene?.key : 'none'
        };
    });
    console.log('🎯 Phaser game state:', gameExists);
    
    // Take screenshot
    await page.screenshot({ 
        path: 'debug-game-state.png', 
        fullPage: true 
    });
    console.log('📸 Screenshot saved as debug-game-state.png');
    
    await browser.close();
}

debugGameState().catch(console.error);
