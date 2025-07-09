import { forgeValidations, verifyChain, verifyType } from '../forgeFunctions';

import type { ValidationFunction, VerificationResult } from '../forgeTypes';
import type { NumberForgeOptions, NumberMethods } from './number.types';

/**
 * Creates a number validation chain.
 * @param errorMessage - The error message to return if validation fails.
 * @returns A new NumberMethods instance with the specified error message.
 */
export const number = (errorMessage?: string) => {
    const forgeType = <T = unknown>(value: T): VerificationResult<T> =>
        verifyType({
            value,
            typeStr: 'number',
            errorMessage,
            caller: 'number'
        });

    const createMethods = (
        initialValidations: ValidationFunction[],
        forgeOptions: NumberForgeOptions
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

        const min = (min: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'number') {
                        return value >= min;
                    }
                    return false;
                },
                errorMessage,
                caller: 'min'
            });
            return createMethods(validations.slice(), {
                ...forgeOptions,
                hasMin: true
            });
        };

        const max = (max: number, errorMessage?: string) => {
            addToForge({
                fn: <T = unknown>(value: T) => {
                    if (typeof value === 'number') {
                        return value <= max;
                    }
                    return false;
                },
                errorMessage,
                caller: 'max'
            });
            return createMethods(validations.slice(), {
                ...forgeOptions,
                hasMax: true
            });
        };

        const newMethods: Record<string, unknown> = {
            forge,
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

    return createMethods([forgeType], {
        optional: false,
        nullable: false,
        hasMin: false,
        hasMax: false
    });
};
