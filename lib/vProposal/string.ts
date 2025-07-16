import { baseForgeType, ForgeMethodConfig } from './baseForgeType';

export const string = () =>
    baseForgeType<
        string,
        {
            regExp: (pattern: RegExp) => unknown;
            minLength: (min: number) => unknown;
            maxLength: (max: number) => unknown;
        }
    >({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'string',
                caller: 'string'
            }
        ],
        methods: (addToForge) => ({
            regExp: (regExp: RegExp, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'string' && regExp.test(value);
                    },
                    caller: 'regExp',
                    ...config
                }),
            minLength: (min: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'string' && value.length >= min;
                    },
                    caller: 'minLength',
                    ...config
                }),
            maxLength: (max: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'string' && value.length <= max;
                    },
                    caller: 'maxLength',
                    ...config
                })
        })
    });
