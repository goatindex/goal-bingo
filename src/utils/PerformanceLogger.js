/**
 * Performance Monitoring System for Goal Bingo
 * Tracks FPS, memory usage, and render performance
 */

export class PerformanceLogger {
    constructor(game, logger) {
        this.game = game;
        this.logger = logger;
        this.metrics = {
            frameRate: [],
            memoryUsage: [],
            renderTime: [],
            updateTime: []
        };
        
        this.isMonitoring = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.sampleRate = 10; // Check every 10th frame to reduce overhead
        this.slowFrameCount = 0;
        this.maxWarnings = 5; // Limit warnings per second
        this.performanceThresholds = {
            lowFPS: 30,
            highMemoryUsage: 0.8,
            slowRender: 20 // More reasonable threshold (20ms instead of 16.67ms)
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the performance logger
     * ARCHITECTURE NOTE: PerformanceLogger can be initialized at READY because it only needs game.events
     * This follows the Lazy Initialization Pattern from our timing architecture
     * Performance monitoring is a core system with minimal dependencies
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.logger) {
            this.logger.info('Performance monitoring setup complete', {
                memoryAvailable: !!performance.memory,
                thresholds: this.performanceThresholds
            }, 'PerformanceLogger');
        }
        
        // ARCHITECTURE NOTE: Performance monitoring requires game.events to be available
        // This is safe at READY timing as game.events is available
        this.setupPerformanceMonitoring();
        
        // Start monitoring automatically after initialization
        this.startMonitoring();
        
        this.isInitialized = true;
        
        return Promise.resolve();
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Performance monitoring already started', null, 'PerformanceLogger');
            return;
        }
        
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        this.logger.info('Performance monitoring started', {
            thresholds: this.performanceThresholds
        }, 'PerformanceLogger');
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.logger.info('Performance monitoring stopped', {
            totalFrames: this.frameCount
        }, 'PerformanceLogger');
    }

    /**
     * Set up performance monitoring hooks
     */
    setupPerformanceMonitoring() {
        // Check if game events are available
        // With READY event, this should always be available when called
        if (!this.game || !this.game.events) {
            this.logger.error('Game events not available during setup - this should not happen with READY timing', null, 'PerformanceLogger');
            return;
        }

        // Monitor frame rate and render time using Phaser's POST_RENDER event
        // Use POST_RENDER for more accurate timing measurements
        this.game.events.on(Phaser.Core.Events.POST_RENDER, () => {
            if (!this.isMonitoring) return;
            
            this.frameCount++;
            
            // Only check every 10th frame to reduce overhead
            if (this.frameCount % this.sampleRate === 0) {
                // Use Phaser's built-in FPS monitoring for accuracy
                const fps = this.game.renderer.getFps();
                const delta = fps > 0 ? 1000 / fps : 0; // Calculate delta from FPS
                
                this.metrics.frameRate.push({ 
                    timestamp: performance.now(), 
                    fps: Math.round(fps * 100) / 100,
                    deltaTime: Math.round(delta * 100) / 100
                });
                
                // Check for low FPS
                if (fps < this.performanceThresholds.lowFPS) {
                    this.logger.warn(`Low FPS detected: ${fps.toFixed(2)}`, { 
                        fps: fps, 
                        deltaTime: delta,
                        frameCount: this.frameCount 
                    }, 'PerformanceLogger');
                }
                
                // Check for slow render with rate limiting
                if (delta > this.performanceThresholds.slowRender) {
                    this.slowFrameCount++;
                    
                    // Limit warnings to prevent console spam
                    if (this.slowFrameCount <= this.maxWarnings) {
                        this.logger.warn(`Slow render detected: ${delta.toFixed(2)}ms (FPS: ${fps.toFixed(1)})`, { 
                            deltaTime: delta, 
                            fps: fps,
                            frameCount: this.frameCount 
                        }, 'PerformanceLogger');
                    }
                } else {
                    this.slowFrameCount = 0; // Reset counter on good frames
                }
                
                // Keep only recent frame rate data (last 5 seconds)
                const currentTime = performance.now();
                const fiveSecondsAgo = currentTime - 5000;
                this.metrics.frameRate = this.metrics.frameRate.filter(entry => entry.timestamp > fiveSecondsAgo);
            }
        });

        // Monitor memory usage (if available)
        if (performance.memory) {
            this.memoryCheckInterval = setInterval(() => {
                if (!this.isMonitoring) return;
                
                const memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: performance.now()
                };
                
                this.metrics.memoryUsage.push(memory);
                
                // Check for high memory usage
                const memoryUsageRatio = memory.used / memory.limit;
                if (memoryUsageRatio > this.performanceThresholds.highMemoryUsage) {
                    this.logger.warn('High memory usage detected', {
                        used: this.formatBytes(memory.used),
                        total: this.formatBytes(memory.total),
                        limit: this.formatBytes(memory.limit),
                        usageRatio: Math.round(memoryUsageRatio * 100) / 100
                    }, 'PerformanceLogger');
                }
                
                // Keep only recent memory data (last 30 seconds)
                const thirtySecondsAgo = performance.now() - 30000;
                this.metrics.memoryUsage = this.metrics.memoryUsage.filter(entry => entry.timestamp > thirtySecondsAgo);
                
            }, 5000); // Check every 5 seconds
        } else {
            this.logger.info('Memory monitoring not available in this browser', null, 'PerformanceLogger');
        }

        // Monitor scene performance using scene manager events
        // Note: Scene events should be monitored from within scenes, not globally
        // For now, we'll skip scene-specific monitoring until we implement proper scene-level logging

        this.logger.info('Performance monitoring setup complete', {
            memoryAvailable: !!performance.memory,
            thresholds: this.performanceThresholds
        }, 'PerformanceLogger');
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        const currentTime = performance.now();
        
        // Calculate average FPS over last 5 seconds
        const recentFrames = this.metrics.frameRate.filter(entry => 
            entry.timestamp > currentTime - 5000
        );
        const avgFPS = recentFrames.length > 0 
            ? recentFrames.reduce((sum, entry) => sum + entry.fps, 0) / recentFrames.length 
            : 0;

        // Get current FPS using Phaser's built-in method
        const currentFPS = this.game && this.game.renderer ? this.game.renderer.getFps() : 0;

        // Get current memory usage
        const currentMemory = performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            usageRatio: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
        } : null;

        return {
            isMonitoring: this.isMonitoring,
            frameCount: this.frameCount,
            currentFPS: Math.round(currentFPS * 100) / 100,
            averageFPS: Math.round(avgFPS * 100) / 100,
            currentMemory,
            thresholds: this.performanceThresholds,
            recentFrameRate: recentFrames.slice(-10), // Last 10 frames
            recentMemoryUsage: this.metrics.memoryUsage.slice(-5), // Last 5 memory checks
            slowFrameCount: this.slowFrameCount,
            sampleRate: this.sampleRate
        };
    }

    /**
     * Get performance summary for debugging
     */
    getPerformanceSummary() {
        const metrics = this.getMetrics();
        const summary = {
            status: this.isMonitoring ? 'Active' : 'Inactive',
            totalFrames: this.frameCount,
            currentFPS: metrics.currentFPS,
            averageFPS: metrics.averageFPS,
            memoryStatus: metrics.currentMemory ? 
                `${this.formatBytes(metrics.currentMemory.used)} / ${this.formatBytes(metrics.currentMemory.limit)}` : 
                'Not available',
            slowFrameCount: metrics.slowFrameCount,
            sampleRate: metrics.sampleRate,
            warnings: this.getPerformanceWarnings(metrics)
        };
        
        return summary;
    }

    /**
     * Get performance warnings based on current metrics
     */
    getPerformanceWarnings(metrics) {
        const warnings = [];
        
        // Use currentFPS for more accurate warnings
        const fpsToCheck = metrics.currentFPS > 0 ? metrics.currentFPS : metrics.averageFPS;
        
        if (fpsToCheck < this.performanceThresholds.lowFPS) {
            warnings.push(`Low FPS: ${fpsToCheck.toFixed(1)}`);
        }
        
        if (metrics.currentMemory && metrics.currentMemory.usageRatio > this.performanceThresholds.highMemoryUsage) {
            warnings.push(`High memory usage: ${Math.round(metrics.currentMemory.usageRatio * 100)}%`);
        }
        
        if (metrics.slowFrameCount > 0) {
            warnings.push(`Slow frames detected: ${metrics.slowFrameCount}`);
        }
        
        return warnings;
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Update performance thresholds
     */
    updateThresholds(newThresholds) {
        this.performanceThresholds = { ...this.performanceThresholds, ...newThresholds };
        this.logger.info('Performance thresholds updated', this.performanceThresholds, 'PerformanceLogger');
    }

    /**
     * Clear all performance metrics
     */
    clearMetrics() {
        this.metrics = {
            frameRate: [],
            memoryUsage: [],
            renderTime: [],
            updateTime: []
        };
        this.frameCount = 0;
        this.slowFrameCount = 0; // Reset slow frame counter
        this.logger.info('Performance metrics cleared', null, 'PerformanceLogger');
    }

    /**
     * Reset slow frame counter (useful for testing)
     */
    resetSlowFrameCounter() {
        this.slowFrameCount = 0;
        this.logger.info('Slow frame counter reset', null, 'PerformanceLogger');
    }

    /**
     * Shutdown performance monitoring
     */
    shutdown() {
        this.stopMonitoring();
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
        }
        this.clearMetrics();
        this.logger.info('Performance monitoring shutdown', null, 'PerformanceLogger');
    }

    /**
     * ARCHITECTURE NOTE: PerformanceLogger Cleanup Method
     * This follows the System Cleanup Pattern for proper resource management
     * Ensures all performance monitoring is stopped and resources cleaned up
     */
    async destroy() {
        console.log('PerformanceLogger: Starting cleanup...');
        
        try {
            // CLEANUP: Stop performance monitoring
            this.stopMonitoring();
            
            // CLEANUP: Clear metrics data
            this.metrics = {
                frameRate: [],
                memoryUsage: [],
                renderTime: [],
                updateTime: []
            };
            
            // CLEANUP: Reset state flags
            this.isMonitoring = false;
            this.isInitialized = false;
            this.slowFrameCount = 0;
            
            // CLEANUP: Remove event listeners
            if (this.game && this.game.events) {
                this.game.events.off(Phaser.Core.Events.POST_RENDER, this.onPostRender, this);
            }
            
            // LOGGING: Track cleanup completion
            console.log('PerformanceLogger: Cleanup completed successfully - destroy() method called');
            
        } catch (error) {
            console.error('PerformanceLogger: Error during cleanup:', error);
            throw error;
        }
    }
}
