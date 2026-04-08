import { baseForgeType } from '../baseForgeType';
import { verifyChainAsync } from '../forgeFunctions';
import type {
    BaseForgeObject,
    BaseForgeType,
    UnsuccessfulVerificationResult,
    VerificationResult
} from '../types';

export const or = <T extends BaseForgeObject[]>(
    forgeTypes: T
): BaseForgeType<
    T[number]['_type'],
    { _: undefined },
    {
        optional: false;
        nullable: false;
        _: null;
    }
> => {
    type TType = T[number]['_type'];
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [],
        craft:
            (config) =>
            async (value: unknown): Promise<VerificationResult<TType>> => {
                if (
                    (config.isOptional && value === undefined) ||
                    (config.isNullable && value === null)
                ) {
                    return { success: true, value: value as TType };
                }

                let hasAtLeastOneValid = false;
                let issues: UnsuccessfulVerificationResult[] = [];

                // Verify all properties in the model
                await Promise.all(
                    forgeTypes.map(async (forgeElement) => {
                        const res = await forgeElement.craft(value);

                        if (res.success) {
                            hasAtLeastOneValid = true;
                            return;
                        }
                        if (res.issues) {
                            issues = issues.concat(res.issues);
                            return;
                        }
                    })
                );

                // Verify validations at or level
                const res = await verifyChainAsync(value, config);

                if (!res.success) {
                    issues = issues.concat(res.issues || []);
                }
                if (issues.length > 0 && !hasAtLeastOneValid) {
                    return {
                        success: false,
                        caller: 'or',
                        errorCode: 'validation_error',
                        issues
                    };
                }
                return { success: true, value: value as TType };
            }
    });
};
