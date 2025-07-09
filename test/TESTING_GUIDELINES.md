# Testing Guidelines

## General Principles

- Ensure 100% test coverage for all modules.
- Use `vitest` for writing and running tests.
- Follow the structure and style of existing test files.

## Writing Tests

### Basic Tests

- Validate the primary functionality of the module.
- Example:
    ```typescript
    it('should return true for a valid input', () => {
        expect(f.module().forge(validInput).success).toBe(true);
    });
    ```

### Edge Cases

- Test invalid inputs and edge cases.
- Example:
    ```typescript
    it('should return false for an invalid input', () => {
        expect(f.module().forge(invalidInput).success).toBe(false);
    });
    ```

### Method-Specific Tests

- Test all available methods (`optional`, `nullable`, `check`, etc.).
- Example:
    ```typescript
    it('should handle optional and nullable inputs', () => {
        const schema = f.module().optional().nullable();
        expect(schema.forge(undefined).success).toBe(true);
        expect(schema.forge(null).success).toBe(true);
        expect(schema.forge(validInput).success).toBe(true);
    });
    ```

## Test File Structure

- Group tests by method or functionality.
- Use descriptive test names.

## Running Tests

- Use the following command to run all tests:
    ```bash
    npm test
    ```

## Adding New Modules

- Create a new test file in the `test` directory.
- Follow the naming convention: `<module>.test.ts`.
- Include tests for all methods and edge cases.

## Example Test Files

- Refer to existing test files for examples:
    - `array.test.ts`
    - `string.test.ts`
    - `number.test.ts`
    - `boolean.test.ts`
    - `blueprint.test.ts`

## Notes

- Always ensure tests are deterministic and do not rely on external factors.
- Use mock data where necessary.
- Keep tests isolated and independent of each other.
