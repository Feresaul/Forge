import { describe, it, expect } from 'vitest';

import f from '../lib';

describe('f.array', () => {
    it('should return true for a valid array', () => {
        expect(f.array(f.string()).forge(['valid', 'array']).success).toBe(
            true
        );
    });

    it('should return false for an invalid array', () => {
        expect(f.array(f.string()).forge('invalid').success).toBe(false);
        expect(f.array(f.string()).forge(undefined).success).toBe(false);
        expect(f.array(f.string()).forge(null).success).toBe(false);
        expect(f.array(f.string()).forge([42]).success).toBe(false);
    });

    it('should validate elements in the array', () => {
        const result = f.array(f.string()).forge(['valid', 42]);
        expect(result.success).toBe(false);
        if (!result.success && result.issues) {
            expect(result.issues[0].arrayIndex).toBe(1);
        }
    });

    it('should handle optional arrays', () => {
        expect(f.array(f.string()).optional().forge(undefined).success).toBe(
            true
        );
        expect(f.array(f.string()).optional().forge(null).success).toBe(false);
        expect(f.array(f.string()).optional().forge(['valid']).success).toBe(
            true
        );
    });

    it('should handle nullable arrays', () => {
        expect(f.array(f.string()).nullable().forge(null).success).toBe(true);
        expect(f.array(f.string()).nullable().forge(undefined).success).toBe(
            false
        );
        expect(f.array(f.string()).nullable().forge(['valid']).success).toBe(
            true
        );
    });

    it('should validate using custom check', () => {
        const hasAtLeastOneElement = (value: unknown[]) => value.length > 0;
        expect(
            f
                .array(f.string())
                .check(hasAtLeastOneElement, 'Must have at least one element')
                .forge(['valid']).success
        ).toBe(true);
        expect(
            f
                .array(f.string())
                .check(hasAtLeastOneElement, 'Must have at least one element')
                .forge([]).success
        ).toBe(false);
    });

    it('should handle optional and nullable arrays', () => {
        const schema = f.array(f.string()).optional().nullable();
        expect(schema.forge(undefined).success).toBe(true);
        expect(schema.forge(null).success).toBe(true);
        expect(schema.forge(['valid']).success).toBe(true);
        expect(schema.forge(42).success).toBe(false);
    });
});
