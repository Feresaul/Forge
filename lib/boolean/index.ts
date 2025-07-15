import { verifyChain, verifyChainAsync } from '../forgeFunctions';

import type {
    BaseForgeOptions,
    CheckConfig,
    ForgeMethod,
    VerificationResult
} from '../forgeTypes';
import type { BooleanMethods } from './boolean.types';

/**
 * Creates a boolean validation chain.
 * @param errorMessage - The error message to return if validation fails.
 * @returns A new BooleanMethods instance with the specified error message.
 */
export const boolean = (errorMessage?: string) => {
    const forgeType = <T = unknown>(value: T): boolean =>
        typeof value === 'boolean';

    const createMethods = (
        methods: ForgeMethod[],
        forgeOptions: BaseForgeOptions
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

        return newMethods as BooleanMethods;
    };

    return createMethods(
        [
            {
                fn: forgeType,
                errorCode: 'value_error',
                caller: 'boolean',
                errorMessage
            }
        ],
        { optional: false, nullable: false }
    );
};
