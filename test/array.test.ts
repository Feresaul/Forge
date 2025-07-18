import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.array', () => {
    it('should return true for a valid array', async () => {
        const schema = f.array(f.string());
        const result = await schema.forge(['valid', 'array']);
        expect(result.success).toBe(true);
    });

    it('should return false for an invalid array', async () => {
        const schema = f.array(f.string());
        expect((await schema.forge('invalid')).success).toBe(false);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge([42])).success).toBe(false);
        expect((await schema.forge({})).success).toBe(false);
    });

    it('should validate elements in the array', async () => {
        const schema = f.array(f.string());
        const result = await schema.forge(['valid', 42]);
        expect(result.success).toBe(false);
        if (!result.success && result.issues) {
            expect(result.issues[0].arrayIndex).toBe(1);
        }
    });

    it('should validate minLength and maxLength', async () => {
        const schema = f.array(f.string()).minLength(2).maxLength(3);
        expect((await schema.forge(['a'])).success).toBe(false);
        expect((await schema.forge(['a', 'b'])).success).toBe(true);
        expect((await schema.forge(['a', 'b', 'c'])).success).toBe(true);
        expect((await schema.forge(['a', 'b', 'c', 'd'])).success).toBe(false);
    });

    it('should support method chaining', async () => {
        const schema = f
            .array(f.string().minLength(2))
            .minLength(2)
            .maxLength(3);
        expect((await schema.forge(['ab', 'cd'])).success).toBe(true);
        expect((await schema.forge(['a', 'cd'])).success).toBe(false);
        expect((await schema.forge(['ab'])).success).toBe(false);
        expect((await schema.forge(['ab', 'cd', 'ef', 'gh'])).success).toBe(
            false
        );
    });

    it('should handle optional arrays', async () => {
        const schema = f.array(f.string()).optional();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(['valid'])).success).toBe(true);
    });

    it('should handle nullable arrays', async () => {
        const schema = f.array(f.string()).nullable();
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(['valid'])).success).toBe(true);
    });

    it('should handle optional and nullable arrays', async () => {
        const schema = f.array(f.string()).optional().nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(['valid'])).success).toBe(true);
        expect((await schema.forge(42)).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f.array(f.string()).check((value) => value.length > 0, {
            errorMessage: 'Must have at least one element'
        });
        expect((await schema.forge(['valid'])).success).toBe(true);
        expect((await schema.forge([])).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .array(f.string())
            .check((value) => value.length > 1, { errorMessage: 'Too short' })
            .check((value) => value.every((v) => typeof v === 'string'), {
                errorMessage: 'All must be strings'
            });
        expect((await schema.forge(['a'])).success).toBe(false);
        expect((await schema.forge(['a', 'b'])).success).toBe(true);
        expect((await schema.forge(['a', 1])).success).toBe(false);
    });

    it('should validate async check', async () => {
        const schema = f.array(f.string()).check(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value.length > 0;
            },
            { errorMessage: 'Array must not be empty' }
        );
        const result = await schema.forge(['valid']);
        expect(result.success).toBe(true);
        const emptyResult = await schema.forge([]);
        expect(emptyResult.success).toBe(false);
    });

    it('should support arrays with all method combinations', async () => {
        const schema = f
            .array(f.string().minLength(2))
            .minLength(2)
            .maxLength(3)
            .optional()
            .nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(['ab', 'cd'])).success).toBe(true);
        expect((await schema.forge(['a', 'cd'])).success).toBe(false);
        expect((await schema.forge(['ab'])).success).toBe(false);
        expect((await schema.forge(['ab', 'cd', 'ef', 'gh'])).success).toBe(
            false
        );
    });
});
