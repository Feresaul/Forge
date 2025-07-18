import { describe, it, expect } from 'vitest';
import f from '../lib';

describe('f.object', () => {
    it('should return true for a valid object', async () => {
        const schema = f.object({ name: f.string(), age: f.number() });
        const result = await schema.forge({ name: 'John', age: 30 });
        expect(result.success).toBe(true);
    });

    it('should return true for an empty object if model is empty', async () => {
        const schema = f.object({});
        const result = await schema.forge({});
        expect(result.success).toBe(true);
    });

    it('should return false for an invalid object', async () => {
        const schema = f.object({ name: f.string(), age: f.number() });
        expect(
            (await schema.forge({ name: 'John', age: 'invalid' })).success
        ).toBe(false);
        expect((await schema.forge({ name: 42, age: 30 })).success).toBe(false);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge(123)).success).toBe(false);
        expect((await schema.forge([])).success).toBe(false);
    });

    it('should validate nested objects', async () => {
        const schema = f.object({
            user: f.object({ name: f.string(), age: f.number() })
        });
        const result = await schema.forge({
            user: { name: 'John', age: 'invalid' }
        });
        expect(result.success).toBe(false);
        if (!result.success && result.issues) {
            expect(result.issues[0].path).toEqual(['user', 'age']);
        }
    });

    it('should validate deeply nested objects', async () => {
        const schema = f.object({
            user: f.object({
                profile: f.object({
                    name: f.string(),
                    address: f.object({ city: f.string(), zip: f.number() })
                })
            })
        });
        const result = await schema.forge({
            user: {
                profile: {
                    name: 'Jane',
                    address: { city: 'NY', zip: 'not-a-number' }
                }
            }
        });
        expect(result.success).toBe(false);
        if (!result.success && result.issues) {
            expect(result.issues[0].path).toEqual([
                'user',
                'profile',
                'address',
                'zip'
            ]);
        }
    });

    it('should handle optional objects', async () => {
        const schema = f
            .object({ name: f.string(), age: f.number() })
            .optional();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(false);
        expect((await schema.forge({ name: 'John', age: 30 })).success).toBe(
            true
        );
    });

    it('should handle nullable objects', async () => {
        const schema = f
            .object({ name: f.string(), age: f.number() })
            .nullable();
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge(undefined)).success).toBe(false);
        expect((await schema.forge({ name: 'John', age: 30 })).success).toBe(
            true
        );
    });

    it('should validate using custom check', async () => {
        const schema = f
            .object({ name: f.string(), age: f.number() })
            .check((value) => value.age > 18, {
                errorMessage: 'Age must be greater than 18'
            });
        expect((await schema.forge({ name: 'John', age: 30 })).success).toBe(
            true
        );
        expect((await schema.forge({ name: 'John', age: 15 })).success).toBe(
            false
        );
    });

    it('should support multiple checks in chain', async () => {
        const schema = f
            .object({ name: f.string(), age: f.number() })
            .check((value) => value.age > 18, {
                errorMessage: 'Age must be greater than 18'
            })
            .check((value) => value.name.length > 2, {
                errorMessage: 'Name too short'
            });
        expect((await schema.forge({ name: 'Jo', age: 30 })).success).toBe(
            false
        );
        expect((await schema.forge({ name: 'John', age: 30 })).success).toBe(
            true
        );
    });

    it('should handle optional and nullable objects', async () => {
        const schema = f
            .object({ name: f.string(), age: f.number() })
            .optional()
            .nullable();
        expect((await schema.forge(undefined)).success).toBe(true);
        expect((await schema.forge(null)).success).toBe(true);
        expect((await schema.forge({ name: 'John', age: 30 })).success).toBe(
            true
        );
        expect((await schema.forge(42)).success).toBe(false);
    });

    it('should validate async check', async () => {
        const schema = f.object({ name: f.string(), age: f.number() }).check(
            async (value) => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                return value.age > 18;
            },
            { errorMessage: 'Age must be greater than 18' }
        );
        const result = await schema.forge({ name: 'John', age: 30 });
        expect(result.success).toBe(true);
        const invalidResult = await schema.forge({ name: 'John', age: 15 });
        expect(invalidResult.success).toBe(false);
    });

    it('should support objects with various types', async () => {
        const schema = f.object({
            name: f.string(),
            age: f.number().optional(),
            isActive: f.boolean().nullable(),
            tags: f.array(f.string()).optional()
        });
        expect(
            (await schema.forge({ name: 'John', isActive: null })).success
        ).toBe(true);
        expect(
            (
                await schema.forge({
                    name: 'John',
                    age: 25,
                    isActive: true,
                    tags: ['a', 'b']
                })
            ).success
        ).toBe(true);
        expect(
            (await schema.forge({ name: 'John', age: 'bad', isActive: true }))
                .success
        ).toBe(false);
    });
});
