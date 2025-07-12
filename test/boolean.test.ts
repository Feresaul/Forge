import { describe, it, expect } from 'vitest';

import f from '../lib';

describe('f.boolean', () => {
    it('should return true for a valid boolean', () => {
        expect(f.boolean().forge(true).success).toBe(true);
        expect(f.boolean().forge(false).success).toBe(true);
    });

    it('should return false for an invalid boolean', () => {
        expect(f.boolean().forge('invalid').success).toBe(false);
        expect(f.boolean().forge(undefined).success).toBe(false);
        expect(f.boolean().forge(null).success).toBe(false);
        expect(f.boolean().forge(42).success).toBe(false);
    });

    it('should handle optional booleans', () => {
        expect(f.boolean().optional().forge(undefined).success).toBe(true);
        expect(f.boolean().optional().forge(null).success).toBe(false);
        expect(f.boolean().optional().forge(true).success).toBe(true);
    });

    it('should handle nullable booleans', () => {
        expect(f.boolean().nullable().forge(null).success).toBe(true);
        expect(f.boolean().nullable().forge(undefined).success).toBe(false);
        expect(f.boolean().nullable().forge(false).success).toBe(true);
    });

    it('should handle optional and nullable booleans', () => {
        const schema = f.boolean().optional().nullable();
        expect(schema.forge(undefined).success).toBe(true);
        expect(schema.forge(null).success).toBe(true);
        expect(schema.forge(true).success).toBe(true);
        expect(schema.forge(42).success).toBe(false);
    });

    it('should validate using custom check', () => {
        const isTrue = (value: boolean) => value === true;
        expect(
            f
                .boolean()
                .check(isTrue, { errorMessage: 'Must be true' })
                .forge(true).success
        ).toBe(true);
        expect(
            f
                .boolean()
                .check(isTrue, { errorMessage: 'Must be true' })
                .forge(false).success
        ).toBe(false);
    });

    it('should validate async forge', async () => {
        const result = await f.boolean().forgeAsync(true);
        expect(result.success).toBe(true);
    });

    it('should validate async check with forgeAsync', async () => {
        const schema = f.boolean().check(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 400));
                return value === true;
            },
            { errorMessage: 'Value must be true' }
        );

        const result = await schema.forgeAsync(true);
        expect(result.success).toBe(true);

        const invalidResult = await schema.forgeAsync(false);
        expect(invalidResult.success).toBe(false);
    });
});
