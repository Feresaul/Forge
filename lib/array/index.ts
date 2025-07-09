import { forgeValidations, verifyChain } from '../forgeFunctions';

import type {
    BaseForgeMethods,
    BaseForgeOptions,
    UnsuccessfulVerificationResult,
    ValidationFunction,
    VerificationResult
} from '../forgeTypes';
import { ArrayMethods } from './array.types';

/**
 * Creates an array validation chain.
 * @param model - The model to use for validation.
 * @returns A new ArrayMethods instance for the specified model.
 */
export const array = <
    TForge extends BaseForgeMethods<unknown> = BaseForgeMethods<unknown>,
    Methods = ArrayMethods<TForge['_type']>
>(
    model: TForge
) => {
    const forgeType = <T = Array<unknown>>(value: T): VerificationResult<T> => {
        if (!Array.isArray(value)) {
            return {
                success: false,
                code: 'value_error',
                method: 'array'
            };
        }
        return { success: true, value };
    };

    const createMethods = (
        initialValidations: ValidationFunction[],
        forgeOptions: BaseForgeOptions
    ) => {
        const { validations, addToForge } =
            forgeValidations(initialValidations);

        const forge = <T = unknown>(values: T): VerificationResult<T> => {
            if (
                (forgeOptions.optional && values === undefined) ||
                (forgeOptions.nullable && values === null)
            ) {
                return { success: true, value: values };
            }

            const issues: UnsuccessfulVerificationResult[] = [];

            // Verify all elements in the array
            if (Array.isArray(values)) {
                values.forEach((value, idx) => {
                    const res = model.forge(value);
                    if (!res.success) {
                        // Push the issue with the index of the array
                        issues.push({ ...res, arrayIndex: idx });
                    }
                });
            }

            // Verify validations at array level
            const res = verifyChain(
                { value: values, validations },
                forgeOptions
            );

            if (!res.success) {
                issues.push(res);
            }
            if (issues.length > 0) {
                return { success: false, code: 'validation_error', issues };
            }
            return { success: true, value: values };
        };

        const optional = () => {
            return createMethods(validations.slice(), {
                ...forgeOptions,
                optional: true
            });
        };

        const nullable = () => {
            return createMethods(validations.slice(), {
                ...forgeOptions,
                nullable: true
            });
        };

        const check = (
            fn: <T = unknown>(value: T) => boolean,
            errorMessage?: string
        ) => {
            addToForge({ fn, errorMessage });
            return createMethods(validations.slice(), forgeOptions);
        };

        const newMethods: Record<string, unknown> = {
            forge,
            check,
            isOptional: forgeOptions.optional,
            isNullable: forgeOptions.nullable,
            model
        };
        if (!forgeOptions.optional) {
            newMethods.optional = optional;
        }
        if (!forgeOptions.nullable) {
            newMethods.nullable = nullable;
        }

        return newMethods as Methods;
    };

    return createMethods([forgeType], { optional: false, nullable: false });
};
