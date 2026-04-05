import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.string', () => {
    it('should return true for a valid string', async () => {
        const schema = f.string();
        const result = await schema.craft('hello');
        expect(result.success).toBe(true);
    });

    it('should return false for an invalid string', async () => {
        const schema = f.string();
        expect((await schema.craft(42)).success).toBe(false);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft(null)).success).toBe(false);
        expect((await schema.craft(true)).success).toBe(false);
        expect((await schema.craft({})).success).toBe(false);
    });

    it('should validate minLength', async () => {
        const schema = f.string().minLength(5);
        expect((await schema.craft('hi')).success).toBe(false);
        expect((await schema.craft('hello')).success).toBe(true);
        expect((await schema.craft('greetings')).success).toBe(true);
    });

    it('should validate maxLength', async () => {
        const schema = f.string().maxLength(5);
        expect((await schema.craft('too long')).success).toBe(false);
        expect((await schema.craft('short')).success).toBe(true);
    });

    it('should validate regExp', async () => {
        const schema = f.string().regExp(/^valid$/);
        expect((await schema.craft('valid')).success).toBe(true);
        expect((await schema.craft('invalid')).success).toBe(false);
    });

    it('should support method chaining', async () => {
        const schema = f
            .string()
            .minLength(3)
            .maxLength(5)
            .regExp(/^[a-z]+$/);
        expect((await schema.craft('abc')).success).toBe(true);
        expect((await schema.craft('ab')).success).toBe(false);
        expect((await schema.craft('abcdef')).success).toBe(false);
        expect((await schema.craft('ABC')).success).toBe(false);
    });

    it('should handle optional strings', async () => {
        const schema = f.string().optional();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(false);
        expect((await schema.craft('valid')).success).toBe(true);
    });

    it('should handle nullable strings', async () => {
        const schema = f.string().nullable();
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft(undefined)).success).toBe(false);
        expect((await schema.craft('valid')).success).toBe(true);
    });

    it('should handle optional and nullable strings', async () => {
        const schema = f.string().optional().nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft('valid')).success).toBe(true);
        expect((await schema.craft(42)).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f
            .string()
            .refine((value) => value === value.toUpperCase(), {
                errorMessage: 'Must be uppercase'
            });
        expect((await schema.craft('VALID')).success).toBe(true);
        expect((await schema.craft('invalid')).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .string()
            .refine((value) => value.length > 2, { errorMessage: 'Too short' })
            .refine((value) => value === value.toUpperCase(), {
                errorMessage: 'Must be uppercase'
            });
        expect((await schema.craft('AB')).success).toBe(false);
        expect((await schema.craft('ABC')).success).toBe(true);
        expect((await schema.craft('abc')).success).toBe(false);
    });

    it('should validate async forge', async () => {
        const schema = f.string();
        const result = await schema.craft('valid');
        expect(result.success).toBe(true);
    });

    it('should validate async check', async () => {
        const schema = f.string().refine(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value === value.toUpperCase();
            },
            { errorMessage: 'String must be uppercase' }
        );
        const result = await schema.craft('VALID');
        expect(result.success).toBe(true);
        const invalidResult = await schema.craft('invalid');
        expect(invalidResult.success).toBe(false);
    });

    it('should support strings with all method combinations', async () => {
        const schema = f
            .string()
            .minLength(2)
            .maxLength(4)
            .regExp(/^[a-z]+$/)
            .optional()
            .nullable();
        expect((await schema.craft(undefined)).success).toBe(true);
        expect((await schema.craft(null)).success).toBe(true);
        expect((await schema.craft('ab')).success).toBe(true);
        expect((await schema.craft('abcd')).success).toBe(true);
        expect((await schema.craft('a')).success).toBe(false);
        expect((await schema.craft('abcde')).success).toBe(false);
        expect((await schema.craft('AB')).success).toBe(false);
    });
});
