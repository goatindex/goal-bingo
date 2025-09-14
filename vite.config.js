import { defineConfig } from 'vite';

// Cache busting configuration
const timestamp = Date.now();

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        entryFileNames: `assets/[name].${timestamp}.[hash].js`,
        chunkFileNames: `assets/[name].${timestamp}.[hash].js`,
        assetFileNames: `assets/[name].${timestamp}.[hash].[ext]`
      }
    },
    // Clear output directory before build
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true,
    // Disable caching for development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Force reload on file changes
    hmr: {
      overlay: true
    }
  },
  optimizeDeps: {
    include: ['phaser'],
    // Force re-optimization
    force: true
  },
  // Clear cache on start
  clearScreen: false,
  logLevel: 'info'
});

