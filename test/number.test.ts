import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.number', () => {
    it('should return true for a valid number', async () => {
        const schema = f.number();
        const result = await schema.craft(42);
        expect(result.success).toBe(true);
    });

    it('should return false for an invalid number', async () => {
        const schema = f.number();
        expect((await schema.craft('invalid')).success).toBe(false);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft(null)).success).toBe(false);
        expect((await schema.craft(true)).success).toBe(false);
        expect((await schema.craft({})).success).toBe(false);
    });

    it('should validate lt, lte, gt, gte, positive, negative, integer', async () => {
        expect((await f.number().lt(10).craft(9)).success).toBe(true);
        expect((await f.number().lt(10).craft(10)).success).toBe(false);
        expect((await f.number().lte(10).craft(10)).success).toBe(true);
        expect((await f.number().lte(10).craft(11)).success).toBe(false);
        expect((await f.number().gt(5).craft(6)).success).toBe(true);
        expect((await f.number().gt(5).craft(5)).success).toBe(false);
        expect((await f.number().gte(5).craft(5)).success).toBe(true);
        expect((await f.number().gte(5).craft(4)).success).toBe(false);
        expect((await f.number().positive().craft(1)).success).toBe(true);
        expect((await f.number().positive().craft(-1)).success).toBe(false);
        expect((await f.number().negative().craft(-1)).success).toBe(true);
        expect((await f.number().negative().craft(1)).success).toBe(false);
        expect((await f.number().integer().craft(2)).success).toBe(true);
        expect((await f.number().integer().craft(2.5)).success).toBe(false);
    });

    it('should support method chaining', async () => {
        const schema = f.number().gt(0).lt(10).integer();
        expect((await schema.craft(5)).success).toBe(true);
        expect((await schema.craft(0)).success).toBe(false);
        expect((await schema.craft(10)).success).toBe(false);
        expect((await schema.craft(5.5)).success).toBe(false);
    });

    it('should handle optional numbers', async () => {
        const schema = f.number().optional();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(false);
        expect((await schema.craft(42)).success).toBe(true);
    });

    it('should handle nullable numbers', async () => {
        const schema = f.number().nullable();
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft(42)).success).toBe(true);
    });

    it('should handle optional and nullable numbers', async () => {
        const schema = f.number().optional().nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft('invalid')).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f
            .number()
            .verify((value) => value > 0, { errorMessage: 'Must be positive' });
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft(-1)).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .number()
            .verify((value) => value > 0, { errorMessage: 'Must be positive' })
            .verify((value) => value % 2 === 0, {
                errorMessage: 'Must be even'
            });
        expect((await schema.craft(2)).success).toBe(true);
        expect((await schema.craft(3)).success).toBe(false);
        expect((await schema.craft(-2)).success).toBe(false);
    });

    it('should validate async check', async () => {
        const schema = f.number().verify(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value > 0;
            },
            { errorMessage: 'Number must be positive' }
        );
        const result = await schema.craft(42);
        expect(result.success).toBe(true);
        const invalidResult = await schema.craft(-1);
        expect(invalidResult.success).toBe(false);
    });

    it('should support numbers with all method combinations', async () => {
        const schema = f.number().gt(0).lt(100).integer().optional().nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(true);
        expect((await schema.craft(101)).success).toBe(false);
        expect((await schema.craft(42.5)).success).toBe(false);
    });
});
