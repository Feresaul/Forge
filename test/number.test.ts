import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.number', () => {
    it('should return true for a valid number', async () => {
        const schema = f.number();
        const result = await schema.forge(42);
        expect(result.success).toBe(true);
    });

    it('should return false for an invalid number', async () => {
        const schema = f.number();
        expect((await schema.forge('invalid')).success).toBe(false);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(true)).success).toBe(false);
        expect((await schema.forge({})).success).toBe(false);
    });

    it('should validate lt, lte, gt, gte, positive, negative, integer', async () => {
        expect((await f.number().lt(10).forge(9)).success).toBe(true);
        expect((await f.number().lt(10).forge(10)).success).toBe(false);
        expect((await f.number().lte(10).forge(10)).success).toBe(true);
        expect((await f.number().lte(10).forge(11)).success).toBe(false);
        expect((await f.number().gt(5).forge(6)).success).toBe(true);
        expect((await f.number().gt(5).forge(5)).success).toBe(false);
        expect((await f.number().gte(5).forge(5)).success).toBe(true);
        expect((await f.number().gte(5).forge(4)).success).toBe(false);
        expect((await f.number().positive().forge(1)).success).toBe(true);
        expect((await f.number().positive().forge(-1)).success).toBe(false);
        expect((await f.number().negative().forge(-1)).success).toBe(true);
        expect((await f.number().negative().forge(1)).success).toBe(false);
        expect((await f.number().integer().forge(2)).success).toBe(true);
        expect((await f.number().integer().forge(2.5)).success).toBe(false);
    });

    it('should support method chaining', async () => {
        const schema = f.number().gt(0).lt(10).integer();
        expect((await schema.forge(5)).success).toBe(true);
        expect((await schema.forge(0)).success).toBe(false);
        expect((await schema.forge(10)).success).toBe(false);
        expect((await schema.forge(5.5)).success).toBe(false);
    });

    it('should handle optional numbers', async () => {
        const schema = f.number().optional();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(42)).success).toBe(true);
    });

    it('should handle nullable numbers', async () => {
        const schema = f.number().nullable();
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(42)).success).toBe(true);
    });

    it('should handle optional and nullable numbers', async () => {
        const schema = f.number().optional().nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(42)).success).toBe(true);
        expect((await schema.forge('invalid')).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f
            .number()
            .check((value) => value > 0, { errorMessage: 'Must be positive' });
        expect((await schema.forge(42)).success).toBe(true);
        expect((await schema.forge(-1)).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .number()
            .check((value) => value > 0, { errorMessage: 'Must be positive' })
            .check((value) => value % 2 === 0, {
                errorMessage: 'Must be even'
            });
        expect((await schema.forge(2)).success).toBe(true);
        expect((await schema.forge(3)).success).toBe(false);
        expect((await schema.forge(-2)).success).toBe(false);
    });

    it('should validate async check', async () => {
        const schema = f.number().check(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value > 0;
            },
            { errorMessage: 'Number must be positive' }
        );
        const result = await schema.forge(42);
        expect(result.success).toBe(true);
        const invalidResult = await schema.forge(-1);
        expect(invalidResult.success).toBe(false);
    });

    it('should support numbers with all method combinations', async () => {
        const schema = f.number().gt(0).lt(100).integer().optional().nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(42)).success).toBe(true);
        expect((await schema.forge(101)).success).toBe(false);
        expect((await schema.forge(42.5)).success).toBe(false);
    });
});
