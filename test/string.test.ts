import { describe, it, expect } from 'vitest';

import f from '../lib';

describe('f.string', () => {
    it('should return true for a valid string', () => {
        expect(f.string().forge('valid').success).toBe(true);
    });

    it('should return false for an invalid string', () => {
        expect(f.string().forge(42).success).toBe(false);
        expect(f.string().forge(undefined).success).toBe(false);
        expect(f.string().forge(null).success).toBe(false);
        expect(f.string().forge(true).success).toBe(false);
    });

    it('should validate minLength', () => {
        expect(f.string().minLength(6).forge('short').success).toBe(false);
        expect(f.string().minLength(5).forge('hello').success).toBe(true);
        expect(f.string().minLength(5).forge('greetings').success).toBe(true);
    });

    it('should validate maxLength', () => {
        expect(f.string().maxLength(5).forge('too long').success).toBe(false);
        expect(f.string().maxLength(5).forge('short').success).toBe(true);
    });

    it('should validate regExp', () => {
        expect(
            f
                .string()
                .regExp(/^valid$/)
                .forge('valid').success
        ).toBe(true);
        expect(
            f
                .string()
                .regExp(/^valid$/)
                .forge('invalid').success
        ).toBe(false);
    });

    it('should handle optional strings', () => {
        expect(f.string().optional().forge(undefined).success).toBe(true);
        expect(f.string().optional().forge(null).success).toBe(false);
        expect(f.string().optional().forge('valid').success).toBe(true);
    });

    it('should handle nullable strings', () => {
        expect(f.string().nullable().forge(null).success).toBe(true);
        expect(f.string().nullable().forge(undefined).success).toBe(false);
        expect(f.string().nullable().forge('valid').success).toBe(true);
    });

    it('should handle optional and nullable strings', () => {
        const schema = f.string().optional().nullable();
        expect(schema.forge(undefined).success).toBe(true);
        expect(schema.forge(null).success).toBe(true);
        expect(schema.forge('valid').success).toBe(true);
        expect(schema.forge(42).success).toBe(false);
    });

    it('should validate using custom check', () => {
        const isUpperCase = (value: string) => value === value.toUpperCase();
        expect(
            f.string().check(isUpperCase, 'Must be uppercase').forge('VALID')
                .success
        ).toBe(true);
        expect(
            f.string().check(isUpperCase, 'Must be uppercase').forge('invalid')
                .success
        ).toBe(false);
    });
});
