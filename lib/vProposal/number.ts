import { baseForgeType } from './baseForgeType';
import { type ForgeMethodConfig } from './types';

export const number = () => {
    return baseForgeType<
        number,
        {
            min: (min: number, config?: ForgeMethodConfig) => unknown;
            max: (max: number, config?: ForgeMethodConfig) => unknown;
            positive: (config?: ForgeMethodConfig) => unknown;
            negative: (config?: ForgeMethodConfig) => unknown;
            integer: (config?: ForgeMethodConfig) => unknown;
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
