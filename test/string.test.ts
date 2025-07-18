import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.string', () => {
    it('should return true for a valid string', async () => {
        const schema = f.string();
        const result = await schema.forge('hello');
        expect(result.success).toBe(true);
    });

    it('should return false for an invalid string', async () => {
        const schema = f.string();
        expect((await schema.forge(42)).success).toBe(false);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(true)).success).toBe(false);
        expect((await schema.forge({})).success).toBe(false);
    });

    it('should validate minLength', async () => {
        const schema = f.string().minLength(5);
        expect((await schema.forge('hi')).success).toBe(false);
        expect((await schema.forge('hello')).success).toBe(true);
        expect((await schema.forge('greetings')).success).toBe(true);
    });

    it('should validate maxLength', async () => {
        const schema = f.string().maxLength(5);
        expect((await schema.forge('too long')).success).toBe(false);
        expect((await schema.forge('short')).success).toBe(true);
    });

    it('should validate regExp', async () => {
        const schema = f.string().regExp(/^valid$/);
        expect((await schema.forge('valid')).success).toBe(true);
        expect((await schema.forge('invalid')).success).toBe(false);
    });

    it('should support method chaining', async () => {
        const schema = f
            .string()
            .minLength(3)
            .maxLength(5)
            .regExp(/^[a-z]+$/);
        expect((await schema.forge('abc')).success).toBe(true);
        expect((await schema.forge('ab')).success).toBe(false);
        expect((await schema.forge('abcdef')).success).toBe(false);
        expect((await schema.forge('ABC')).success).toBe(false);
    });

    it('should handle optional strings', async () => {
        const schema = f.string().optional();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge('valid')).success).toBe(true);
    });

    it('should handle nullable strings', async () => {
        const schema = f.string().nullable();
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge('valid')).success).toBe(true);
    });

    it('should handle optional and nullable strings', async () => {
        const schema = f.string().optional().nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge('valid')).success).toBe(true);
        expect((await schema.forge(42)).success).toBe(false);
    });

    it('should validate using custom check', async () => {
        const schema = f
            .string()
            .check((value) => value === value.toUpperCase(), {
                errorMessage: 'Must be uppercase'
            });
        expect((await schema.forge('VALID')).success).toBe(true);
        expect((await schema.forge('invalid')).success).toBe(false);
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .string()
            .check((value) => value.length > 2, { errorMessage: 'Too short' })
            .check((value) => value === value.toUpperCase(), {
                errorMessage: 'Must be uppercase'
            });
        expect((await schema.forge('AB')).success).toBe(false);
        expect((await schema.forge('ABC')).success).toBe(true);
        expect((await schema.forge('abc')).success).toBe(false);
    });

    it('should validate async forge', async () => {
        const schema = f.string();
        const result = await schema.forge('valid');
        expect(result.success).toBe(true);
    });

    it('should validate async check', async () => {
        const schema = f.string().check(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 100));
                return value === value.toUpperCase();
            },
            { errorMessage: 'String must be uppercase' }
        );
        const result = await schema.forge('VALID');
        expect(result.success).toBe(true);
        const invalidResult = await schema.forge('invalid');
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
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge('ab')).success).toBe(true);
        expect((await schema.forge('abcd')).success).toBe(true);
        expect((await schema.forge('a')).success).toBe(false);
        expect((await schema.forge('abcde')).success).toBe(false);
        expect((await schema.forge('AB')).success).toBe(false);
    });
});
