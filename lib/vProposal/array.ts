import { baseForgeType } from './baseForgeType';
import { verifyChainAsync } from './forgeFunctions';
import type {
    BaseForgeObject,
    BaseForgeType,
    ForgeMethodConfig,
    UnsuccessfulVerificationResult
} from './types';

export const array = <T extends BaseForgeObject>(
    model: T
): BaseForgeType<
    {
        minLength: (min: number, config?: ForgeMethodConfig) => unknown;
        maxLength: (max: number, config?: ForgeMethodConfig) => unknown;
    },
    {
        type: Array<T['_type']>;
        optional: false;
        nullable: false;
        minLength: false;
        maxLength: false;
    }
> => {
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => Array.isArray(value),
                caller: 'array',
                errorCode: 'value_error'
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
        forge:
            (config) =>
            async <T = unknown>(values: T) => {
                if (
                    (config.isOptional && values === undefined) ||
                    (config.isNullable && values === null)
                ) {
                    return { success: true, value: values };
                }

                let issues: UnsuccessfulVerificationResult[] = [];

                // Verify all elements in the array
                if (Array.isArray(values)) {
                    await Promise.all(
                        values.map(async (value, idx) => {
                            const res = await model.forge(value);
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
                        caller: '',
                        errorCode: 'validation_error',
                        issues
                    };
                }
                return { success: true, value: values };
            }
    });
};
