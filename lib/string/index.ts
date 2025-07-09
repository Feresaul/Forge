import { forgeValidations, verifyChain, verifyType } from '../forgeFunctions';

import type { ValidationFunction, VerificationResult } from '../forgeTypes';
import type { StringForgeOptions, StringMethods } from './string.types';

/**
 * Creates a string validation chain.
 * @param errorMessage - The error message to return if validation fails.
 * @returns A new StringMethods instance with the specified error message.
 */
export const string = (errorMessage?: string) => {
    const forgeType = <T = unknown>(value: T): VerificationResult<T> =>
        verifyType({
            value,
            typeStr: 'string',
            errorMessage,
            caller: 'string'
        });

    const createMethods = (
        initialValidations: ValidationFunction[],
        forgeOptions: StringForgeOptions
    ) => {
        const { validations, addToForge } =
            forgeValidations(initialValidations);

        const forge = <T = unknown>(value: T): VerificationResult<T> => {
            return verifyChain({ value, validations }, forgeOptions);
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

        const minLength = (minLength: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'string') {
                        return value.length >= minLength;
                    }
                    return false;
                },
                errorMessage,
                caller: 'minLength'
            });
            return createMethods(validations.slice(), {
                ...forgeOptions,
                hasMinLength: true
            });
        };

        const maxLength = (maxLength: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'string') {
                        return value.length <= maxLength;
                    }
                    return false;
                },
                errorMessage,
                caller: 'maxLength'
            });
            return createMethods(validations.slice(), {
                ...forgeOptions,
                hasMaxLength: true
            });
        };

        const regExp = (regex: RegExp, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'string') {
                        return regex.test(value);
                    }
                    return false;
                },
                errorMessage,
                caller: 'regExp'
            });
            return createMethods(validations.slice(), forgeOptions);
        };

        const newMethods: Record<string, unknown> = {
            forge,
            check,
            regExp,
            isOptional: forgeOptions.optional,
            isNullable: forgeOptions.nullable
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

        return newMethods as StringMethods;
    };

    return createMethods([forgeType], {
        optional: false,
        nullable: false,
        hasMinLength: false,
        hasMaxLength: false
    });
};
