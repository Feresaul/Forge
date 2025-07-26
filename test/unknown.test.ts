import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('unknown', () => {
    it('should succeed for any value', async () => {
        expect((await f.unknown().forge(123)).success).toBe(true);
        expect((await f.unknown().forge('abc')).success).toBe(true);
        expect((await f.unknown().forge(null)).success).toBe(true);
        expect((await f.unknown().forge(undefined)).success).toBe(true);
        expect((await f.unknown().forge({})).success).toBe(true);
    });

    it('should support check method', async () => {
        const schema = f.unknown().check((v) => typeof v === 'string');
        expect((await schema.forge('hello')).success).toBe(true);
        expect((await schema.forge(123)).success).toBe(false);
    });
});
