import { forgeValidations, verifyChain, verifyType } from '../forgeFunctions';

import type { ValidationFunction, VerificationResult } from '../forgeTypes';
import type { StringForgeOptions, StringMethods } from './string.types';

export const string = (errorMessage?: string) => {
    const forgeType = (value: unknown) =>
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

        const forge = (value: unknown): VerificationResult => {
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
            fn: (value: unknown) => boolean,
            errorMessage?: string
        ) => {
            addToForge({ fn, errorMessage });
            return createMethods(validations.slice(), forgeOptions);
        };

        const minLength = (minLength: number, errorMessage?: string) => {
            addToForge({
                fn: (value: string) => value.length >= minLength,
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
                fn: (value: string) => value.length <= maxLength,
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
                fn: (value: string) => regex.test(value),
                errorMessage,
                caller: 'regExp'
            });
            return createMethods(validations.slice(), forgeOptions);
        };

        const email = (errorMessage?: string) => {
            addToForge({
                fn: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                errorMessage,
                caller: 'email'
            });
            return createMethods(validations.slice(), {
                ...forgeOptions,
                hasEmail: true
            });
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
        if (!forgeOptions.hasEmail) {
            newMethods.email = email;
        }

        return newMethods as StringMethods;
    };

    return createMethods([forgeType], {
        optional: false,
        nullable: false,
        hasMinLength: false,
        hasMaxLength: false,
        hasEmail: false
    });
};
