// Direct system status debugging script
// Run this in the browser console to check system status

function debugSystemStatus() {
    console.log('=== SYSTEM INITIALIZATION DEBUG ===');
    
    // Check global objects
    console.log('Global Objects:');
    console.log('- window.game:', !!window.game);
    console.log('- window.stateManager:', !!window.stateManager);
    console.log('- window.storageManager:', !!window.storageManager);
    console.log('- window.logger:', !!window.logger);
    console.log('- window.performanceLogger:', !!window.performanceLogger);
    console.log('- window.userActionLogger:', !!window.userActionLogger);
    console.log('- window.debugTools:', !!window.debugTools);
    console.log('- window.sceneStateLogger:', !!window.sceneStateLogger);
    
    // Check game object properties
    if (window.game) {
        console.log('\nGame Object Properties:');
        console.log('- game.scene:', !!window.game.scene);
        console.log('- game.events:', !!window.game.events);
        console.log('- game.isRunning:', window.game.isRunning);
        console.log('- game.isPaused:', window.game.isPaused);
        
        // Check if scenes are loaded
        if (window.game.scene) {
            console.log('- scenes count:', window.game.scene.scenes.length);
            console.log('- scene keys:', window.game.scene.scenes.map(s => s.scene.key));
        }
    }
    
    // Check if our logging system is working
    if (window.debugTools) {
        console.log('\nDebug Tools Status:');
        console.log('- debugTools.initialized:', window.debugTools.initialized);
        console.log('- debugTools.logLevel:', window.debugTools.logLevel);
    }
    
    console.log('\n=== END DEBUG ===');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    debugSystemStatus();
}