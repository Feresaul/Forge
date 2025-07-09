import { forgeValidations, verifyChain } from '../forgeFunctions';

import type {
    BaseForgeObject,
    BaseForgeOptions,
    UnsuccessfulVerificationResult,
    ValidationFunction,
    VerificationResult
} from '../forgeTypes';
import type { BlueprintMethods } from './blueprint.types';

/**
 * Creates a blueprint(object) validation chain.
 * @param model - The model to use for validation.
 * @returns A new BlueprintMethods instance for the specified model.
 */
export const blueprint = <TBlueprint extends BaseForgeObject>(
    model: TBlueprint
) => {
    const forgeType = <T = unknown>(value: T): VerificationResult<T> => {
        if (typeof value !== 'object' || Array.isArray(value) || !value) {
            return {
                success: false,
                code: 'value_error',
                method: 'blueprint'
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

        const forge = <T = unknown>(value: T): VerificationResult<T> => {
            if (
                (forgeOptions.optional && value === undefined) ||
                (forgeOptions.nullable && value === null)
            ) {
                return { success: true, value };
            }

            let issues: UnsuccessfulVerificationResult[] = [];

            // Verify all properties in the model
            Object.entries(model).forEach(([key, forgeElement]) => {
                const res = forgeElement.forge(
                    value ? (value as Record<string, unknown>)[key] : undefined
                );
                if (res.success) {
                    return;
                }
                if (res.issues) {
                    // If issues are present, adjust the path to include nested keys
                    const adjustedIssues = res.issues.map((issue) => ({
                        ...issue,
                        path: [key, ...(issue.path || [])]
                    }));
                    issues = issues.concat(adjustedIssues);
                } else {
                    // Push the issue with the key of the object
                    issues.push({ ...res, path: [key] });
                }
            });

            // Verify validations at blueprint level
            const res = verifyChain({ value, validations }, forgeOptions);

            if (!res.success) {
                issues.push(res);
            }
            if (issues.length > 0) {
                return { success: false, code: 'validation_error', issues };
            }
            return { success: true, value };
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

        return newMethods as BlueprintMethods<TBlueprint>;
    };

    return createMethods([forgeType], { optional: false, nullable: false });
};
