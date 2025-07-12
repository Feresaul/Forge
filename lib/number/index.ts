import { forgeMethods, verifyChain, verifyChainAsync } from '../forgeFunctions';

import type {
    ForgeCheckConfig,
    ForgeMethod,
    VerificationResult
} from '../forgeTypes';
import type { NumberForgeOptions, NumberMethods } from './number.types';

/**
 * Creates a number validation chain.
 * @param errorMessage - The error message to return if validation fails.
 * @returns A new NumberMethods instance with the specified error message.
 */
export const number = (errorMessage?: string) => {
    const forgeType = <T = unknown>(value: T): boolean =>
        typeof value === 'number';

    const createMethods = (
        initialMethods: ForgeMethod[],
        forgeOptions: NumberForgeOptions
    ) => {
        const { methods, addToForge } = forgeMethods(initialMethods);

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
            config?: ForgeCheckConfig
        ) => {
            addToForge({ fn, caller: 'check', ...config });
            return createMethods(methods, forgeOptions);
        };

        const min = (min: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'number') {
                        return value >= min;
                    }
                    return false;
                },
                caller: 'min',
                errorMessage
            });
            return createMethods(methods, { ...forgeOptions, hasMin: true });
        };

        const max = (max: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'number') {
                        return value <= max;
                    }
                    return false;
                },
                caller: 'max',
                errorMessage
            });
            return createMethods(methods, { ...forgeOptions, hasMax: true });
        };

        const newMethods: Record<string, unknown> = {
            forge,
            forgeAsync,
            check,
            isOptional: forgeOptions.optional,
            isNullable: forgeOptions.nullable
        };
        if (!forgeOptions.optional) {
            newMethods.optional = optional;
        }
        if (!forgeOptions.nullable) {
            newMethods.nullable = nullable;
        }
        if (!forgeOptions.hasMin) {
            newMethods.min = min;
        }
        if (!forgeOptions.hasMax) {
            newMethods.max = max;
        }

        return newMethods as NumberMethods;
    };

    return createMethods(
        [
            {
                fn: forgeType,
                code: 'value_error',
                caller: 'number',
                errorMessage
            }
        ],
        {
            optional: false,
            nullable: false,
            hasMin: false,
            hasMax: false
        }
    );
};
