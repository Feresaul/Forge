import { baseForgeType, ForgeMethodConfig } from './baseForgeType';

export const number = () => {
    return baseForgeType<
        number,
        {
            min: (min: number) => unknown;
            max: (max: number) => unknown;
            positive: () => unknown;
            negative: () => unknown;
            integer: () => unknown;
        }
    >({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'number',
                caller: 'number'
            }
        ],
        methods: (addToForge) => ({
            min: (min: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value >= min;
                    },
                    caller: 'min',
                    ...config
                }),
            max: (max: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value <= max;
                    },
                    caller: 'max',
                    ...config
                }),
            positive: (config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value > 0;
                    },
                    caller: 'positive',
                    ...config
                }),
            negative: (config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value < 0;
                    },
                    caller: 'negative',
                    ...config
                }),
            integer: (config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return (
                            typeof value === 'number' && Number.isInteger(value)
                        );
                    },
                    caller: 'integer',
                    ...config
                })
        })
    });
};
