import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('any', () => {
    it('should succeed for any value', async () => {
        expect((await f.any().forge(123)).success).toBe(true);
        expect((await f.any().forge('abc')).success).toBe(true);
        expect((await f.any().forge(null)).success).toBe(true);
        expect((await f.any().forge(undefined)).success).toBe(true);
        expect((await f.any().forge({})).success).toBe(true);
    });

    it('should support check method', async () => {
        const schema = f.any().check((v) => typeof v === 'number');
        expect((await schema.forge(42)).success).toBe(true);
        expect((await schema.forge('not a number')).success).toBe(false);
    });
});
