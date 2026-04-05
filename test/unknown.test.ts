import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('unknown', () => {
    it('should succeed for any value', async () => {
        expect((await f.unknown().craft(123)).success).toBe(true);
        expect((await f.unknown().craft('abc')).success).toBe(true);
        expect((await f.unknown().craft(null)).success).toBe(true);
        expect((await f.unknown().craft(undefined)).success).toBe(true);
        expect((await f.unknown().craft({})).success).toBe(true);
    });

    it('should support check method', async () => {
        const schema = f.unknown().refine((v) => typeof v === 'string');
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(123)).success).toBe(false);
    });
});
