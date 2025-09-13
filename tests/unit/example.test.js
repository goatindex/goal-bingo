/**
 * Example Unit Test for Vitest
 * 
 * ARCHITECTURE NOTES:
 * - This is a unit test that should run with Vitest
 * - Tests individual functions and modules in isolation
 * - Does not require browser environment or Phaser game instance
 */

import { describe, it, expect } from 'vitest';

describe('Example Unit Test', () => {
    it('should pass basic math test', () => {
        expect(2 + 2).toBe(4);
    });
    
    it('should handle string operations', () => {
        const str = 'Hello World';
        expect(str.toLowerCase()).toBe('hello world');
        expect(str.length).toBe(11);
    });
    
    it('should handle array operations', () => {
        const arr = [1, 2, 3, 4, 5];
        expect(arr.length).toBe(5);
        expect(arr.includes(3)).toBe(true);
        expect(arr.filter(x => x > 3)).toEqual([4, 5]);
    });
});
