import { forgeValidations, verifyChain, verifyType } from '../forgeFunctions';

import type {
    BaseForgeOptions,
    ValidationFunction,
    VerificationResult
} from '../forgeTypes';
import type { BooleanMethods } from './boolean.types';

export const boolean = (errorMessage?: string) => {
    const forgeType = (value: unknown) =>
        verifyType({
            value,
            typeStr: 'boolean',
            errorMessage,
            caller: 'boolean'
        });

    const createMethods = (
        initialValidations: ValidationFunction[],
        forgeOptions: BaseForgeOptions
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

        return newMethods as BooleanMethods;
    };

    return createMethods([forgeType], { optional: false, nullable: false });
};
