import { baseForgeType } from './baseForgeType';
import type { BaseForgeType, ForgeMethodConfig } from './types';

export const number = (): BaseForgeType<
    {
        min: (min: number, config?: ForgeMethodConfig) => unknown;
        max: (max: number, config?: ForgeMethodConfig) => unknown;
        positive: (config?: ForgeMethodConfig) => { negative: false };
        negative: (config?: ForgeMethodConfig) => { positive: false };
        integer: (config?: ForgeMethodConfig) => unknown;
    },
    {
        type: number;
        optional: false;
        nullable: false;
        min: false;
        max: false;
        positive: false;
        negative: false;
        integer: false;
    }
> => {
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'number',
                caller: 'number',
                errorCode: 'value_error'
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
