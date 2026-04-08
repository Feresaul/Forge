import { baseForgeType } from '../baseForgeType';
import { verifyChainAsync } from '../forgeFunctions';
import type {
    BaseForgeObject,
    BaseForgeType,
    ForgeMethodConfig,
    UnknownObject,
    UnsuccessfulVerificationResult,
    VerificationResult
} from '../types';

export const blueprint = <FShape extends Record<string, BaseForgeObject>>(
    shape: FShape,
    config?: ForgeMethodConfig
): BaseForgeType<
    { [K in keyof FShape]: FShape[K]['_type'] },
    { shape: FShape },
    {
        optional: false;
        nullable: false;
        shape: null;
    }
> => {
    type TType = { [K in keyof FShape]: FShape[K]['_type'] };
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => {
                    if (
                        typeof value === 'object' &&
                        !Array.isArray(value) &&
                        Boolean(value)
                    ) {
                        return true;
                    }
                    return false;
                },
                caller: 'blueprint',
                errorCode: 'value_error',
                ...config
            }
        ],
        methods: () => ({ shape }),
        craft:
            (config) =>
            async (value: unknown): Promise<VerificationResult<TType>> => {
                if (
                    (config.isOptional && value === undefined) ||
                    (config.isNullable && value === null)
                ) {
                    return {
                        success: true,
                        value: value as unknown as TType
                    };
                }

                let issues: UnsuccessfulVerificationResult[] = [];

                // Verify all properties in the shape
                await Promise.all(
                    Object.entries(shape).map(async ([key, forgeElement]) => {
                        const res = await forgeElement.craft(
                            value ? (value as UnknownObject)[key] : undefined
                        );
                        if (res.success) {
                            return;
                        }
                        if (res.issues) {
                            let levelIssues: UnsuccessfulVerificationResult[] =
                                [];

                            res.issues.forEach((issue) => {
                                if (issue.issues) {
                                    levelIssues = levelIssues.concat(
                                        issue.issues?.map((subIssue) => ({
                                            success: false,
                                            caller: subIssue.caller,
                                            errorCode: subIssue.errorCode,
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
                const res = await verifyChainAsync(value, config);

                if (!res.success) {
                    issues = issues.concat(res.issues || []);
                }
                if (issues.length > 0) {
                    return {
                        success: false,
                        caller: 'blueprint',
                        errorCode: 'validation_error',
                        issues
                    };
                }
                return { success: true, value: value as TType };
            }
    });
};
