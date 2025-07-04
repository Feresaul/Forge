import { forgeValidations, verifyChain } from '../forgeFunctions';

import type {
    BaseForgeMethods,
    BaseForgeOptions,
    ValidationFunction,
    VerificationResult
} from '../forgeTypes';
import { ArrayMethods } from './array.types';

export const array = <
    TForge extends BaseForgeMethods<unknown> = BaseForgeMethods<unknown>,
    Methods = ArrayMethods<TForge['_type']>
>(
    model: TForge
) => {
    const forgeType = (value: unknown): VerificationResult => {
        if (!Array.isArray(value)) {
            return {
                success: false,
                code: 'value_error',
                method: 'array'
            };
        }
        return { success: true };
    };

    const createMethods = (
        initialValidations: ValidationFunction[],
        forgeOptions: BaseForgeOptions
    ) => {
        const { validations, addToForge } =
            forgeValidations(initialValidations);

        const forge = (values: unknown): VerificationResult => {
            if (
                (forgeOptions.optional && values === undefined) ||
                (forgeOptions.nullable && values === null)
            ) {
                return { success: true };
            }

            const issues: VerificationResult[] = [];

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
            return { success: true };
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
            fn: (value: unknown) => boolean,
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
