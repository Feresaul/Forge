import { describe, it, expect } from 'vitest';

import f from '../lib';

describe('f.blueprint', () => {
    it('should return true for a valid blueprint', () => {
        const blueprint = f.blueprint({
            name: f.string(),
            age: f.number()
        });
        expect(blueprint.forge({ name: 'John', age: 30 }).success).toBe(true);
    });

    it('should return false for an invalid blueprint', () => {
        const blueprint = f.blueprint({
            name: f.string(),
            age: f.number()
        });
        expect(blueprint.forge({ name: 'John', age: 'invalid' }).success).toBe(
            false
        );
        expect(blueprint.forge({ name: 42, age: 30 }).success).toBe(false);
        expect(blueprint.forge(undefined).success).toBe(false);
        expect(blueprint.forge(null).success).toBe(false);
    });

    it('should validate nested blueprints', () => {
        const blueprint = f.blueprint({
            user: f.blueprint({
                name: f.string(),
                age: f.number()
            })
        });
        const result = blueprint.forge({
            user: { name: 'John', age: 'invalid' }
        });
        expect(result.success).toBe(false);
        if (!result.success && result.issues) {
            expect(result.issues[0].path).toEqual(['user', 'age']);
        }
    });

    it('should handle optional blueprints', () => {
        const blueprint = f
            .blueprint({
                name: f.string(),
                age: f.number()
            })
            .optional();
        expect(blueprint.forge(undefined).success).toBe(true);
        expect(blueprint.forge(null).success).toBe(false);
        expect(blueprint.forge({ name: 'John', age: 30 }).success).toBe(true);
    });

    it('should handle nullable blueprints', () => {
        const blueprint = f
            .blueprint({
                name: f.string(),
                age: f.number()
            })
            .nullable();
        expect(blueprint.forge(null).success).toBe(true);
        expect(blueprint.forge(undefined).success).toBe(false);
        expect(blueprint.forge({ name: 'John', age: 30 }).success).toBe(true);
    });

    it('should validate using custom check', () => {
        const blueprint = f
            .blueprint({
                name: f.string(),
                age: f.number()
            })
            .check((value) => value.age > 18, {
                errorMessage: 'Age must be greater than 18'
            });
        expect(blueprint.forge({ name: 'John', age: 30 }).success).toBe(true);
        expect(blueprint.forge({ name: 'John', age: 15 }).success).toBe(false);
    });

    it('should handle optional and nullable blueprints', () => {
        const schema = f
            .blueprint({
                name: f.string(),
                age: f.number()
            })
            .optional()
            .nullable();
        expect(schema.forge(undefined).success).toBe(true);
        expect(schema.forge(null).success).toBe(true);
        expect(schema.forge({ name: 'John', age: 30 }).success).toBe(true);
        expect(schema.forge(42).success).toBe(false);
    });

    it('should validate async forge', async () => {
        const blueprint = f.blueprint({
            name: f.string(),
            age: f.number()
        });
        const result = await blueprint.forgeAsync({ name: 'John', age: 30 });
        expect(result.success).toBe(true);
    });

    it('should validate async check with forgeAsync', async () => {
        const schema = f
            .blueprint({
                name: f.string(),
                age: f.number()
            })
            .check(
                async (value) => {
                    await new Promise((resolve) => setTimeout(resolve, 400));
                    return value.age > 18;
                },
                { errorMessage: 'Age must be greater than 18' }
            );

        const result = await schema.forgeAsync({ name: 'John', age: 30 });
        expect(result.success).toBe(true);

        const invalidResult = await schema.forgeAsync({
            name: 'John',
            age: 15
        });
        expect(invalidResult.success).toBe(false);
    });
});
