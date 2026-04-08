import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.or', () => {
    it('should return true when value matches the first type', async () => {
        const schema = f.or([f.string(), f.number()]);
        const result = await schema.craft('hello');
        expect(result.success).toBe(true);
    });

    it('should return true when value matches the second type', async () => {
        const schema = f.or([f.string(), f.number()]);
        const result = await schema.craft(42);
        expect(result.success).toBe(true);
    });

    it('should return false when value matches none of the types', async () => {
        const schema = f.or([f.string(), f.number()]);
        expect((await schema.craft(true)).success).toBe(false);
        expect((await schema.craft({})).success).toBe(false);
        expect((await schema.craft([])).success).toBe(false);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft(null)).success).toBe(false);
    });

    it('should work with a single type', async () => {
        const schema = f.or([f.boolean()]);
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft(false)).success).toBe(true);
        expect((await schema.craft('hello')).success).toBe(false);
    });

    it('should work with multiple types', async () => {
        const schema = f.or([f.string(), f.number(), f.boolean()]);
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft(true)).success).toBe(true);
        expect((await schema.craft({})).success).toBe(false);
    });

    it('should handle optional', async () => {
        const schema = f.or([f.string(), f.number()]).optional();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(false);
    });

    it('should handle nullable', async () => {
        const schema = f.or([f.string(), f.number()]).nullable();
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft(undefined)).success).toBe(false);
    });

    it('should handle optional and nullable', async () => {
        const schema = f.or([f.string(), f.number()]).optional().nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft(true)).success).toBe(false);
    });

    it('should validate with inner type constraints', async () => {
        const schema = f.or([f.string().minLength(3), f.number().gte(10)]);
        expect((await schema.craft('abc')).success).toBe(true);
        expect((await schema.craft('ab')).success).toBe(false);
        expect((await schema.craft(10)).success).toBe(true);
        expect((await schema.craft(5)).success).toBe(false);
    });

    it('should validate using custom verify', async () => {
        const schema = f
            .or([f.string(), f.number()])
            .verify((value) => value !== 'forbidden', {
                errorMessage: 'Value is forbidden'
            });
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft({})).success).toBe(false);
    });

    it('should validate async verify', async () => {
        const schema = f.or([f.string(), f.number()]).verify(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value !== 'blocked';
            },
            { errorMessage: 'Value is blocked' }
        );
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft({})).success).toBe(false);
    });

    it('should return issues when validation fails', async () => {
        const schema = f.or([f.string(), f.number()]);
        const result = await schema.craft(true);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.caller).toBe('or');
            expect(result.errorCode).toBe('validation_error');
            expect(result.issues).toBeDefined();
            expect(result.issues!.length).toBeGreaterThan(0);
        }
    });

    it('should support all method combinations', async () => {
        const schema = f
            .or([f.string().minLength(2), f.number().gte(0)])
            .optional()
            .nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft('ab')).success).toBe(true);
        expect((await schema.craft(5)).success).toBe(true);
        expect((await schema.craft('a')).success).toBe(false);
        expect((await schema.craft(true)).success).toBe(false);
    });
});
