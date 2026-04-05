import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.boolean', () => {
    it('should return true for a valid boolean', async () => {
        const schema = f.boolean();
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft(false)).success).toBe(true);
    });

    it('should return false for an invalid boolean', async () => {
        const schema = f.boolean();
        expect((await schema.craft('invalid')).success).toBe(false);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft(null)).success).toBe(false);
        expect((await schema.craft(42)).success).toBe(false);
        expect((await schema.craft({})).success).toBe(false);
    });

    it('should handle optional booleans', async () => {
        const schema = f.boolean().optional();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(false);
        expect((await schema.craft(true)).success).toBe(true);
    });

    it('should handle nullable booleans', async () => {
        const schema = f.boolean().nullable();
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft(false)).success).toBe(true);
    });

    it('should handle optional and nullable booleans', async () => {
        const schema = f.boolean().optional().nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f
            .boolean()
            .refine((value) => value === true, {
                errorMessage: 'Must be true'
            });
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft(false)).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .boolean()
            .refine((value) => value === true, { errorMessage: 'Must be true' })
            .refine((value) => typeof value === 'boolean', {
                errorMessage: 'Must be boolean'
            });
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft(false)).success).toBe(false);
    });

    it('should validate async check', async () => {
        const schema = f.boolean().refine(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value === true;
            },
            { errorMessage: 'Value must be true' }
        );
        const result = await schema.craft(true);
        expect(result.success).toBe(true);
        const invalidResult = await schema.craft(false);
        expect(invalidResult.success).toBe(false);
    });

    it('should support booleans with all method combinations', async () => {
        const schema = f.boolean().optional().nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft(false)).success).toBe(true);
        expect((await schema.craft(1)).success).toBe(false);
    });
});
