import { describe, it, expect } from 'vitest';

import f from '../lib';

describe('f.number', () => {
    it('should return true for a valid number', () => {
        expect(f.number().forge(42).success).toBe(true);
    });

    it('should return false for an invalid number', () => {
        expect(f.number().forge('invalid').success).toBe(false);
        expect(f.number().forge(undefined).success).toBe(false);
        expect(f.number().forge(null).success).toBe(false);
        expect(f.number().forge(true).success).toBe(false);
    });

    it('should handle optional numbers', () => {
        expect(f.number().optional().forge(undefined).success).toBe(true);
        expect(f.number().optional().forge(null).success).toBe(false);
        expect(f.number().optional().forge(42).success).toBe(true);
    });

    it('should handle nullable numbers', () => {
        expect(f.number().nullable().forge(null).success).toBe(true);
        expect(f.number().nullable().forge(undefined).success).toBe(false);
        expect(f.number().nullable().forge(42).success).toBe(true);
    });

    it('should handle optional and nullable numbers', () => {
        const schema = f.number().optional().nullable();
        expect(schema.forge(undefined).success).toBe(true);
        expect(schema.forge(null).success).toBe(true);
        expect(schema.forge(42).success).toBe(true);
        expect(schema.forge('invalid').success).toBe(false);
    });

    it('should validate using custom check', () => {
        const isPositive = (value: number) => value > 0;
        expect(
            f.number().check(isPositive, 'Must be positive').forge(42).success
        ).toBe(true);
        expect(
            f.number().check(isPositive, 'Must be positive').forge(-1).success
        ).toBe(false);
    });
});
