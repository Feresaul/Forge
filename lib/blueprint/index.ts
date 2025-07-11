import { forgeMethods, verifyChain, verifyChainAsync } from '../forgeFunctions';

import type {
    BaseForgeObject,
    BaseForgeOptions,
    ForgeMethod,
    UnsuccessfulVerificationResult,
    VerificationResult
} from '../forgeTypes';
import type { BlueprintMethods } from './blueprint.types';

/**
 * Creates a blueprint(object) validation chain.
 * @param model - The model to use for validation.
 * @param errorMessage - Optional error message for the blueprint validation.
 * @returns A new BlueprintMethods instance for the specified model.
 */
export const blueprint = <TBlueprint extends BaseForgeObject>(
    model: TBlueprint,
    errorMessage?: string
) => {
    const forgeType = <T = unknown>(value: T): boolean => {
        if (typeof value !== 'object' || Array.isArray(value) || !value) {
            return false;
        }
        return true;
    };

    const createMethods = (
        initialMethods: ForgeMethod[],
        forgeOptions: BaseForgeOptions
    ) => {
        const { methods, addToForge } = forgeMethods(initialMethods);

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
                    let levelIssues: UnsuccessfulVerificationResult[] = [];

                    res.issues.forEach((issue) => {
                        if (issue.issues) {
                            levelIssues = levelIssues.concat(
                                issue.issues?.map((subIssue) => ({
                                    success: false,
                                    code: subIssue.code,
                                    method: subIssue.method,
                                    errorMessage: subIssue.errorMessage,
                                    path: [key]
                                })) ?? []
                            );
                            return;
                        }
                        levelIssues.push({
                            ...issue,
                            path: [key].concat(issue.path || [])
                        });
                    });

                    issues = issues.concat(levelIssues);
                    return;
                }
            });

            // Verify validations at blueprint level
            const res = verifyChain({ value, methods }, forgeOptions);

            if (!res.success) {
                issues = issues.concat(res.issues || []);
            }
            if (issues.length > 0) {
                return {
                    success: false,
                    code: 'validation_error',
                    method: '',
                    issues
                };
            }
            return { success: true, value };
        };

        const forgeAsync = async <T = unknown>(
            value: T
        ): Promise<VerificationResult<T>> => {
            if (
                (forgeOptions.optional && value === undefined) ||
                (forgeOptions.nullable && value === null)
            ) {
                return { success: true, value };
            }

            let issues: UnsuccessfulVerificationResult[] = [];

            // Verify all properties in the model
            await Promise.all(
                Object.entries(model).map(async ([key, forgeElement]) => {
                    const res = await forgeElement.forgeAsync(
                        value
                            ? (value as Record<string, unknown>)[key]
                            : undefined
                    );
                    if (res.success) {
                        return;
                    }
                    if (res.issues) {
                        let levelIssues: UnsuccessfulVerificationResult[] = [];

                        res.issues.forEach((issue) => {
                            if (issue.issues) {
                                levelIssues = levelIssues.concat(
                                    issue.issues?.map((subIssue) => ({
                                        success: false,
                                        code: subIssue.code,
                                        method: subIssue.method,
                                        errorMessage: subIssue.errorMessage,
                                        path: [key]
                                    })) ?? []
                                );
                                return;
                            }
                            levelIssues.push({
                                ...issue,
                                path: [key].concat(issue.path || [])
                            });
                        });

                        issues = issues.concat(levelIssues);
                        return;
                    }
                })
            );

            // Verify validations at blueprint level
            const res = await verifyChainAsync(
                { value, methods },
                forgeOptions
            );

            if (!res.success) {
                issues = issues.concat(res.issues || []);
            }
            if (issues.length > 0) {
                return {
                    success: false,
                    code: 'validation_error',
                    method: 'blueprint',
                    issues
                };
            }
            return { success: true, value };
        };

        const optional = () => {
            return createMethods(methods, { ...forgeOptions, optional: true });
        };

        const nullable = () => {
            return createMethods(methods, { ...forgeOptions, nullable: true });
        };

        const check = (
            fn: <T = unknown>(value: T) => boolean | Promise<boolean>,
            errorMessage?: string
        ) => {
            addToForge({ fn, caller: 'check', errorMessage });
            return createMethods(methods, forgeOptions);
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

        return newMethods as BlueprintMethods<TBlueprint>;
    };

    return createMethods(
        [
            {
                fn: forgeType,
                code: 'value_error',
                caller: 'blueprint',
                errorMessage
            }
        ],
        { optional: false, nullable: false }
    );
};
