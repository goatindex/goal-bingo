/**
 * Test Setup Configuration for Vitest with jsdom
 * ARCHITECTURE NOTE: This provides test environment setup for cleanup system tests
 * Ensures consistent test environment and proper mocking
 * 
 * Uses Vitest globals with jsdom environment
 */
import { vi } from 'vitest';

// ARCHITECTURE NOTE: Mock Phaser for testing
// This prevents actual Phaser initialization during tests
global.Phaser = {
    Core: {
        Events: {
            BOOT: 'boot',
            READY: 'ready',
            SYSTEM_READY: 'systemready',
            POST_RENDER: 'postrender',
            POST_STEP: 'poststep'
        }
    },
    Scenes: {
        Events: {
            START: 'start',
            CREATE: 'create',
            PAUSE: 'pause',
            RESUME: 'resume',
            STOP: 'stop',
            DESTROY: 'destroy'
        }
    },
    Input: {
        Events: {
            POINTER_DOWN: 'pointerdown',
            POINTER_UP: 'pointerup',
            KEY_DOWN: 'keydown',
            KEY_UP: 'keyup'
        }
    },
    Scale: {
        FIT: 'fit',
        CENTER_BOTH: 'centerboth'
    },
    AUTO: 'auto'
};

// ARCHITECTURE NOTE: Mock window object for testing
// This provides browser-like environment for tests
global.window = {
    logger: null,
    game: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
};

// ARCHITECTURE NOTE: Mock document object for testing
// This provides DOM-like environment for tests
global.document = {
    readyState: 'loading',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
};

// ARCHITECTURE NOTE: Mock console for testing
// This prevents console output during tests
global.console = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
};

// ARCHITECTURE NOTE: Mock setTimeout and clearTimeout for testing
// This allows testing of timeout-based functionality
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

global.setTimeout = vi.fn((callback, delay) => {
    return originalSetTimeout(callback, delay);
});

global.clearTimeout = vi.fn((id) => {
    return originalClearTimeout(id);
});

// ARCHITECTURE NOTE: Mock setInterval and clearInterval for testing
// This allows testing of interval-based functionality
global.setInterval = vi.fn((callback, delay) => {
    return originalSetInterval(callback, delay);
});

global.clearInterval = vi.fn((id) => {
    return originalClearInterval(id);
});

// ARCHITECTURE NOTE: Mock localStorage for testing
// This provides storage functionality for tests
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

global.localStorage = localStorageMock;

// ARCHITECTURE NOTE: Mock sessionStorage for testing
// This provides session storage functionality for tests
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

global.sessionStorage = sessionStorageMock;
