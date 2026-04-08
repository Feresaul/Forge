import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('any', () => {
    it('should succeed for any value', async () => {
        expect((await f.any().craft(123)).success).toBe(true);
        expect((await f.any().craft('abc')).success).toBe(true);
        expect((await f.any().craft(null)).success).toBe(true);
        expect((await f.any().craft(undefined)).success).toBe(true);
        expect((await f.any().craft({})).success).toBe(true);
    });

    it('should support check method', async () => {
        const schema = f.any().verify((v) => typeof v === 'number');
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft('not a number')).success).toBe(false);
    });
});
