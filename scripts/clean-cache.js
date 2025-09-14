#!/usr/bin/env node

/**
 * Cache Cleaning Script
 * 
 * Clears all caches to ensure fresh builds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning all caches...');

// Clear Vite cache
const viteCacheDir = path.join(__dirname, '..', 'node_modules', '.vite');
if (fs.existsSync(viteCacheDir)) {
    try {
        fs.rmSync(viteCacheDir, { recursive: true, force: true });
        console.log('✅ Vite cache cleared');
    } catch (error) {
        console.log('⚠️ Could not clear Vite cache:', error.message);
    }
}

// Clear dist directory
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
    try {
        fs.rmSync(distDir, { recursive: true, force: true });
        console.log('✅ Build cache cleared');
    } catch (error) {
        console.log('⚠️ Could not clear build cache:', error.message);
    }
}

// Clear node_modules cache
try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ NPM cache cleared');
} catch (error) {
    console.log('⚠️ Could not clear NPM cache:', error.message);
}

console.log('🎉 Cache cleaning complete!');
