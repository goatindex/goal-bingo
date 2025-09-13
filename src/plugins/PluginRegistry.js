/**
 * PluginRegistry - Centralized plugin registration and management system
 * 
 * This class provides a centralized way to register, manage, and access
 * all plugins in the Goal Bingo project. It handles plugin dependencies,
 * initialization order, and provides a unified API for plugin access.
 * 
 * @since 1.0.0
 */
export class PluginRegistry {
    
    /**
     * Creates an instance of PluginRegistry
     */
    constructor() {
        // Registered plugins
        this.registeredPlugins = new Map();
        
        // Plugin instances
        this.pluginInstances = new Map();
        
        // Plugin dependencies graph
        this.dependencyGraph = new Map();
        
        // Initialization order
        this.initializationOrder = [];
        
        // Registry state
        this.isInitialized = false;
        
        console.log('[PluginRegistry] Plugin registry created');
    }
    
    /**
     * Register a plugin with the registry
     * 
     * @param {string} key - Unique key for the plugin
     * @param {Class} pluginClass - Plugin class constructor
     * @param {Object} config - Plugin configuration
     * @param {Array<string>} dependencies - Array of plugin dependencies
     * @returns {boolean} True if registration was successful
     */
    register(key, pluginClass, config = {}, dependencies = []) {
        console.log(`[PluginRegistry] Registering plugin: ${key}`);
        
        // Validate inputs
        if (!key || typeof key !== 'string') {
            console.error('[PluginRegistry] Invalid plugin key:', key);
            return false;
        }
        
        if (!pluginClass || typeof pluginClass !== 'function') {
            console.error('[PluginRegistry] Invalid plugin class:', pluginClass);
            return false;
        }
        
        // Check if plugin is already registered
        if (this.registeredPlugins.has(key)) {
            console.warn(`[PluginRegistry] Plugin ${key} is already registered`);
            return false;
        }
        
        // Register plugin
        this.registeredPlugins.set(key, {
            key,
            pluginClass,
            config,
            dependencies: dependencies || [],
            isInstalled: false
        });
        
        // Add to dependency graph
        this.dependencyGraph.set(key, dependencies || []);
        
        console.log(`[PluginRegistry] Plugin ${key} registered successfully`);
        return true;
    }
    
    /**
     * Unregister a plugin from the registry
     * 
     * @param {string} key - Plugin key to unregister
     * @returns {boolean} True if unregistration was successful
     */
    unregister(key) {
        console.log(`[PluginRegistry] Unregistering plugin: ${key}`);
        
        if (!this.registeredPlugins.has(key)) {
            console.warn(`[PluginRegistry] Plugin ${key} is not registered`);
            return false;
        }
        
        // Remove from registry
        this.registeredPlugins.delete(key);
        this.dependencyGraph.delete(key);
        
        // Remove from initialization order
        const index = this.initializationOrder.indexOf(key);
        if (index > -1) {
            this.initializationOrder.splice(index, 1);
        }
        
        console.log(`[PluginRegistry] Plugin ${key} unregistered successfully`);
        return true;
    }
    
    /**
     * Get registered plugin information
     * 
     * @param {string} key - Plugin key
     * @returns {Object|null} Plugin information or null if not found
     */
    getPluginInfo(key) {
        return this.registeredPlugins.get(key) || null;
    }
    
    /**
     * Get all registered plugins
     * 
     * @returns {Array<Object>} Array of plugin information objects
     */
    getAllPlugins() {
        return Array.from(this.registeredPlugins.values());
    }
    
    /**
     * Check if a plugin is registered
     * 
     * @param {string} key - Plugin key
     * @returns {boolean} True if plugin is registered
     */
    isRegistered(key) {
        return this.registeredPlugins.has(key);
    }
    
    /**
     * Calculate initialization order based on dependencies
     * Uses topological sorting to ensure dependencies are initialized first
     * 
     * @returns {Array<string>} Array of plugin keys in initialization order
     */
    calculateInitializationOrder() {
        console.log('[PluginRegistry] Calculating initialization order...');
        
        const visited = new Set();
        const visiting = new Set();
        const order = [];
        
        const visit = (key) => {
            if (visiting.has(key)) {
                throw new Error(`Circular dependency detected involving plugin: ${key}`);
            }
            
            if (visited.has(key)) {
                return;
            }
            
            visiting.add(key);
            
            const dependencies = this.dependencyGraph.get(key) || [];
            for (const dependency of dependencies) {
                if (!this.registeredPlugins.has(dependency)) {
                    throw new Error(`Plugin ${key} depends on unregistered plugin: ${dependency}`);
                }
                visit(dependency);
            }
            
            visiting.delete(key);
            visited.add(key);
            order.push(key);
        };
        
        // Visit all registered plugins
        for (const key of this.registeredPlugins.keys()) {
            if (!visited.has(key)) {
                visit(key);
            }
        }
        
        this.initializationOrder = order;
        console.log('[PluginRegistry] Initialization order calculated:', this.initializationOrder);
        return this.initializationOrder;
    }
    
    /**
     * Get Phaser plugin configuration for game config
     * 
     * @returns {Object} Phaser plugins configuration object
     */
    getPhaserPluginConfig() {
        console.log('[PluginRegistry] Generating Phaser plugin configuration...');
        
        const globalPlugins = [];
        
        for (const pluginInfo of this.registeredPlugins.values()) {
            const { key, pluginClass, config } = pluginInfo;
            
            globalPlugins.push({
                key: key,
                plugin: pluginClass,
                start: true,
                data: config
            });
        }
        
        const phaserConfig = {
            global: globalPlugins
        };
        
        console.log('[PluginRegistry] Phaser plugin configuration generated:', phaserConfig);
        return phaserConfig;
    }
    
    /**
     * Initialize all registered plugins
     * This should be called after the Phaser game is created
     * 
     * @param {Phaser.Game} game - Phaser game instance
     * @returns {Promise<boolean>} True if all plugins initialized successfully
     */
    async initializePlugins(game) {
        console.log('[PluginRegistry] Initializing all plugins...');
        
        if (!game || !game.plugins) {
            console.error('[PluginRegistry] Invalid game instance or plugins not available');
            return false;
        }
        
        try {
            // Calculate initialization order
            this.calculateInitializationOrder();
            
            // Initialize plugins in dependency order
            for (const key of this.initializationOrder) {
                const pluginInfo = this.registeredPlugins.get(key);
                if (!pluginInfo) {
                    console.warn(`[PluginRegistry] Plugin info not found for key: ${key}`);
                    continue;
                }
                
                console.log(`[PluginRegistry] Initializing plugin: ${key}`);
                
                // Get plugin instance from Phaser
                const pluginInstance = game.plugins.get(key);
                if (!pluginInstance) {
                    console.error(`[PluginRegistry] Plugin instance not found for key: ${key}`);
                    continue;
                }
                
                // Store plugin instance
                this.pluginInstances.set(key, pluginInstance);
                
                // Mark as installed
                pluginInfo.isInstalled = true;
                
                console.log(`[PluginRegistry] Plugin ${key} initialized successfully`);
            }
            
            this.isInitialized = true;
            console.log('[PluginRegistry] All plugins initialized successfully');
            return true;
            
        } catch (error) {
            console.error('[PluginRegistry] Error initializing plugins:', error);
            return false;
        }
    }
    
    /**
     * Get plugin instance by key
     * 
     * @param {string} key - Plugin key
     * @returns {Object|null} Plugin instance or null if not found
     */
    getPlugin(key) {
        return this.pluginInstances.get(key) || null;
    }
    
    /**
     * Get all plugin instances
     * 
     * @returns {Map<string, Object>} Map of plugin instances
     */
    getAllPluginInstances() {
        return new Map(this.pluginInstances);
    }
    
    /**
     * Check if all plugins are ready
     * 
     * @returns {boolean} True if all plugins are ready
     */
    areAllPluginsReady() {
        for (const [key, instance] of this.pluginInstances) {
            if (instance && typeof instance.isReady === 'function' && !instance.isReady()) {
                console.log(`[PluginRegistry] Plugin ${key} is not ready`);
                return false;
            }
        }
        return true;
    }
    
    /**
     * Get plugin status for all plugins
     * 
     * @returns {Object} Status information for all plugins
     */
    getAllPluginStatus() {
        const status = {};
        
        for (const [key, instance] of this.pluginInstances) {
            if (instance && typeof instance.getStatus === 'function') {
                status[key] = instance.getStatus();
            } else {
                status[key] = {
                    name: key,
                    isReady: false,
                    error: 'No status method available'
                };
            }
        }
        
        return status;
    }
    
    /**
     * Cleanup all plugins
     * This should be called when the game is destroyed
     */
    cleanup() {
        console.log('[PluginRegistry] Cleaning up all plugins...');
        
        // Clear plugin instances
        this.pluginInstances.clear();
        
        // Reset initialization state
        this.isInitialized = false;
        this.initializationOrder = [];
        
        console.log('[PluginRegistry] Plugin cleanup completed');
    }
    
    /**
     * Get registry statistics
     * 
     * @returns {Object} Registry statistics
     */
    getStats() {
        return {
            totalRegistered: this.registeredPlugins.size,
            totalInstances: this.pluginInstances.size,
            isInitialized: this.isInitialized,
            initializationOrder: [...this.initializationOrder]
        };
    }
}

// Create singleton instance
export const pluginRegistry = new PluginRegistry();

export default PluginRegistry;
