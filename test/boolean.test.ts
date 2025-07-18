import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.boolean', () => {
    it('should return true for a valid boolean', async () => {
        const schema = f.boolean();
        expect((await schema.forge(true)).success).toBe(true);
        expect((await schema.forge(false)).success).toBe(true);
    });

    it('should return false for an invalid boolean', async () => {
        const schema = f.boolean();
        expect((await schema.forge('invalid')).success).toBe(false);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(42)).success).toBe(false);
        expect((await schema.forge({})).success).toBe(false);
    });

    it('should handle optional booleans', async () => {
        const schema = f.boolean().optional();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(true)).success).toBe(true);
    });

    it('should handle nullable booleans', async () => {
        const schema = f.boolean().nullable();
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(false)).success).toBe(true);
    });

    it('should handle optional and nullable booleans', async () => {
        const schema = f.boolean().optional().nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(true)).success).toBe(true);
        expect((await schema.forge(42)).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f
            .boolean()
            .check((value) => value === true, { errorMessage: 'Must be true' });
        expect((await schema.forge(true)).success).toBe(true);
        expect((await schema.forge(false)).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .boolean()
            .check((value) => value === true, { errorMessage: 'Must be true' })
            .check((value) => typeof value === 'boolean', {
                errorMessage: 'Must be boolean'
            });
        expect((await schema.forge(true)).success).toBe(true);
        expect((await schema.forge(false)).success).toBe(false);
    });

    it('should validate async check', async () => {
        const schema = f.boolean().check(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return value === true;
            },
            { errorMessage: 'Value must be true' }
        );
        const result = await schema.forge(true);
        expect(result.success).toBe(true);
        const invalidResult = await schema.forge(false);
        expect(invalidResult.success).toBe(false);
    });

    it('should support booleans with all method combinations', async () => {
        const schema = f.boolean().optional().nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(true)).success).toBe(true);
        expect((await schema.forge(false)).success).toBe(true);
        expect((await schema.forge(1)).success).toBe(false);
    });
});
