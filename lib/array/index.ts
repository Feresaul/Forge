import { forgeMethods, verifyChain, verifyChainAsync } from '../forgeFunctions';

import type {
    BaseForgeMethods,
    CheckConfig,
    ForgeMethod,
    UnsuccessfulVerificationResult,
    VerificationResult
} from '../forgeTypes';
import { ArrayForgeOptions, ArrayMethods } from './array.types';

/**
 * Creates an array validation chain.
 * @param model - The model to use for validation.
 * @param errorMessage - Optional error message for the array validation.
 * @returns A new ArrayMethods instance for the specified model.
 */
export const array = <
    TForge extends BaseForgeMethods<unknown> = BaseForgeMethods<unknown>,
    Methods = ArrayMethods<TForge['_type']>
>(
    model: TForge,
    errorMessage?: string
) => {
    const forgeType = <T = Array<unknown>>(value: T): boolean => {
        if (!Array.isArray(value)) {
            return false;
        }
        return true;
    };

    const createMethods = (
        initialMethods: ForgeMethod[],
        forgeOptions: ArrayForgeOptions
    ) => {
        const { methods, addToForge } = forgeMethods(initialMethods);

        const forge = <T = unknown>(values: T): VerificationResult<T> => {
            if (
                (forgeOptions.optional && values === undefined) ||
                (forgeOptions.nullable && values === null)
            ) {
                return { success: true, value: values };
            }

            let issues: UnsuccessfulVerificationResult[] = [];

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
            const res = verifyChain({ value: values, methods }, forgeOptions);

            if (!res.success) {
                issues = issues.concat(res.issues || []);
            }
            if (issues.length > 0) {
                return {
                    success: false,
                    errorCode: 'validation_error',
                    caller: '',
                    issues
                };
            }
            return { success: true, value: values };
        };

        const forgeAsync = async <T = unknown>(
            values: T
        ): Promise<VerificationResult<T>> => {
            if (
                (forgeOptions.optional && values === undefined) ||
                (forgeOptions.nullable && values === null)
            ) {
                return { success: true, value: values };
            }

            let issues: UnsuccessfulVerificationResult[] = [];

            // Verify all elements in the array
            if (Array.isArray(values)) {
                await Promise.all(
                    values.map(async (value, idx) => {
                        const res = await model.forgeAsync(value);
                        if (!res.success) {
                            // Push the issue with the index of the array
                            issues.push({ ...res, arrayIndex: idx });
                        }
                    })
                );
            }

            // Verify validations at array level
            const res = await verifyChainAsync(
                { value: values, methods },
                forgeOptions
            );

            if (!res.success) {
                issues = issues.concat(res.issues || []);
            }
            if (issues.length > 0) {
                return {
                    success: false,
                    errorCode: 'validation_error',
                    caller: '',
                    issues
                };
            }
            return { success: true, value: values };
        };

        const optional = () => {
            return createMethods(methods, { ...forgeOptions, optional: true });
        };

        const nullable = () => {
            return createMethods(methods, { ...forgeOptions, nullable: true });
        };

        const check = (
            fn: <T = unknown>(value: T) => boolean,
            config?: CheckConfig
        ) => {
            addToForge({ fn, caller: 'check', ...config });
            return createMethods(methods, forgeOptions);
        };

        const minLength = (minLength: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (Array.isArray(value)) {
                        return value.length >= minLength;
                    }
                    return false;
                },
                caller: 'minLength',
                errorMessage
            });
            return createMethods(methods, {
                ...forgeOptions,
                hasMinLength: true
            });
        };

        const maxLength = (maxLength: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (Array.isArray(value)) {
                        return value.length <= maxLength;
                    }
                    return false;
                },
                caller: 'maxLength',
                errorMessage
            });
            return createMethods(methods, {
                ...forgeOptions,
                hasMaxLength: true
            });
        };

        const newMethods: Record<string, unknown> = {
            forge,
            forgeAsync,
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
        if (!forgeOptions.hasMinLength) {
            newMethods.minLength = minLength;
        }
        if (!forgeOptions.hasMaxLength) {
            newMethods.maxLength = maxLength;
        }

        return newMethods as Methods;
    };

    return createMethods(
        [
            {
                fn: forgeType,
                errorCode: 'value_error',
                caller: 'array',
                errorMessage
            }
        ],
        {
            optional: false,
            nullable: false,
            hasMinLength: false,
            hasMaxLength: false
        }
    );
};
