#!/usr/bin/env node

/**
 * Clean Development Server Script
 * 
 * This script ensures a clean development environment by:
 * 1. Killing all existing Node processes
 * 2. Clearing Vite cache
 * 3. Starting fresh development server
 * 4. Implementing cache busting for Phaser assets
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting Clean Development Process...');

// Step 1: Kill all Node processes
console.log('1️⃣ Killing existing Node processes...');
try {
    if (process.platform === 'win32') {
        execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    } else {
        execSync('pkill -f node', { stdio: 'ignore' });
    }
    console.log('✅ Node processes terminated');
} catch (error) {
    console.log('ℹ️ No Node processes to kill');
}

// Step 2: Clear Vite cache
console.log('2️⃣ Clearing Vite cache...');
const viteCacheDir = path.join(__dirname, '..', 'node_modules', '.vite');
if (fs.existsSync(viteCacheDir)) {
    try {
        fs.rmSync(viteCacheDir, { recursive: true, force: true });
        console.log('✅ Vite cache cleared');
    } catch (error) {
        console.log('⚠️ Could not clear Vite cache:', error.message);
    }
} else {
    console.log('ℹ️ No Vite cache to clear');
}

// Step 3: Clear browser cache directory
console.log('3️⃣ Clearing browser cache...');
const cacheDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(cacheDir)) {
    try {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log('✅ Build cache cleared');
    } catch (error) {
        console.log('⚠️ Could not clear build cache:', error.message);
    }
}

// Step 4: Generate cache busting timestamp
const timestamp = Date.now();
console.log(`4️⃣ Generated cache bust timestamp: ${timestamp}`);

// Step 5: Update Vite config for cache busting
console.log('5️⃣ Configuring cache busting...');
const viteConfigPath = path.join(__dirname, '..', 'vite.config.js');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Add cache busting configuration
const cacheBustConfig = `
// Cache busting configuration
const timestamp = ${timestamp};
export default {
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        entryFileNames: \`assets/[name].\${timestamp}.[hash].js\`,
        chunkFileNames: \`assets/[name].\${timestamp}.[hash].js\`,
        assetFileNames: \`assets/[name].\${timestamp}.[hash].[ext]\`
      }
    }
  },
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
};`;

// Write updated config
fs.writeFileSync(viteConfigPath, cacheBustConfig);
console.log('✅ Cache busting configured');

// Step 6: Start development server
console.log('6️⃣ Starting development server...');
console.log('🚀 Server will be available at: http://localhost:3000');
console.log('📝 Cache busting enabled - no stale content!');

const devServer = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
});

// Handle server events
devServer.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
});

devServer.on('close', (code) => {
    console.log(`\n🛑 Development server stopped with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devServer.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development server...');
    devServer.kill('SIGTERM');
    process.exit(0);
});
