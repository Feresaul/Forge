import { verifyChain, verifyChainAsync } from '../forgeFunctions';

import type {
    CheckConfig,
    ForgeMethod,
    VerificationResult
} from '../forgeTypes';
import type { StringForgeOptions, StringMethods } from './string.types';

/**
 * Creates a string validation chain.
 * @param errorMessage - The error message to return if validation fails.
 * @returns A new StringMethods instance with the specified error message.
 */
export const string = (errorMessage?: string) => {
    const forgeType = <T = unknown>(value: T): boolean =>
        typeof value === 'string';

    const createMethods = (
        methods: ForgeMethod[],
        forgeOptions: StringForgeOptions
    ) => {
        const forge = <T = unknown>(value: T): VerificationResult<T> => {
            return verifyChain({ value, methods }, forgeOptions);
        };

        const forgeAsync = <T = unknown>(
            value: T
        ): Promise<VerificationResult<T>> => {
            return verifyChainAsync({ value, methods }, forgeOptions);
        };

        const optional = () => {
            return createMethods(methods, { ...forgeOptions, optional: true });
        };

        const nullable = () => {
            return createMethods(methods, { ...forgeOptions, nullable: true });
        };

        const check = (
            fn: <T = unknown>(value: T) => boolean | Promise<boolean>,
            config?: CheckConfig
        ) => {
            return createMethods(
                [...methods, { fn, caller: 'check', ...config }],
                forgeOptions
            );
        };

        const minLength = (minLength: number, errorMessage?: string) => {
            return createMethods(
                [
                    ...methods,
                    {
                        fn: <T = unknown>(value: T) => {
                            if (typeof value === 'string') {
                                return value.length >= minLength;
                            }
                            return false;
                        },
                        caller: 'minLength',
                        errorMessage
                    }
                ],
                {
                    ...forgeOptions,
                    hasMinLength: true
                }
            );
        };

        const maxLength = (maxLength: number, errorMessage?: string) => {
            return createMethods(
                [
                    ...methods,
                    {
                        fn: <T = unknown>(value: T) => {
                            if (typeof value === 'string') {
                                return value.length <= maxLength;
                            }
                            return false;
                        },
                        caller: 'maxLength',
                        errorMessage
                    }
                ],
                {
                    ...forgeOptions,
                    hasMaxLength: true
                }
            );
        };

        const regExp = (regex: RegExp, errorMessage?: string) => {
            return createMethods(
                [
                    ...methods,
                    {
                        fn: <T = unknown>(value: T) => {
                            if (typeof value === 'string') {
                                return regex.test(value);
                            }
                            return false;
                        },
                        caller: 'regExp',
                        errorMessage
                    }
                ],
                forgeOptions
            );
        };

        const newMethods: Record<string, unknown> = {
            forge,
            forgeAsync,
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

    return createMethods(
        [
            {
                fn: forgeType,
                errorCode: 'value_error',
                caller: 'string',
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
