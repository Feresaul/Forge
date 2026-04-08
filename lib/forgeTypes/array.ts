import { baseForgeType } from '../baseForgeType';
import { verifyChainAsync } from '../forgeFunctions';
import type {
    BaseForgeObject,
    BaseForgeType,
    ForgeMethodConfig,
    UnsuccessfulVerificationResult,
    VerificationResult
} from '../types';

export const array = <T extends BaseForgeObject>(
    forgeType: T,
    config?: ForgeMethodConfig
): BaseForgeType<
    Array<T['_type']>,
    {
        minLength: (min: number, config?: ForgeMethodConfig) => unknown;
        maxLength: (max: number, config?: ForgeMethodConfig) => unknown;
    },
    {
        optional: false;
        nullable: false;
        minLength: false;
        maxLength: false;
    }
> => {
    type TType = Array<T['_type']>;
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => Array.isArray(value),
                caller: 'array',
                errorCode: 'value_error',
                ...config
            }
        ],
        methods: (addToForge) => ({
            minLength: (min: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return Array.isArray(value) && value.length >= min;
                    },
                    caller: 'minLength',
                    ...config
                }),
            maxLength: (max: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return Array.isArray(value) && value.length <= max;
                    },
                    caller: 'maxLength',
                    ...config
                })
        }),
        craft:
            (config) =>
            async (values: unknown): Promise<VerificationResult<TType>> => {
                if (
                    (config.isOptional && values === undefined) ||
                    (config.isNullable && values === null)
                ) {
                    return {
                        success: true,
                        value: values as unknown as TType
                    };
                }

                let issues: UnsuccessfulVerificationResult[] = [];

                // Verify all elements in the array
                if (Array.isArray(values)) {
                    await Promise.all(
                        values.map(async (value, idx) => {
                            const res = await forgeType.craft(value);
                            if (!res.success) {
                                // Push the issue with the index of the array
                                issues.push({ ...res, arrayIndex: idx });
                            }
                        })
                    );
                }

                // Verify validations at array level
                const res = await verifyChainAsync(values, config);

                if (!res.success) {
                    issues = issues.concat(res.issues || []);
                }
                if (issues.length > 0) {
                    return {
                        success: false,
                        caller: 'array',
                        errorCode: 'validation_error',
                        issues
                    };
                }
                return { success: true, value: values as TType };
            }
    });
};
