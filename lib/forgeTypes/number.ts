import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType, ForgeMethodConfig } from '../types';

export const number = (): BaseForgeType<
    {
        lt: (max: number, config?: ForgeMethodConfig) => { lte: false };
        lte: (min: number, config?: ForgeMethodConfig) => { lt: false };
        gt: (min: number, config?: ForgeMethodConfig) => { gte: false };
        gte: (max: number, config?: ForgeMethodConfig) => { gt: false };
        positive: (config?: ForgeMethodConfig) => { negative: false };
        negative: (config?: ForgeMethodConfig) => { positive: false };
        integer: (config?: ForgeMethodConfig) => unknown;
    },
    {
        type: number;
        optional: false;
        nullable: false;
        lt: false;
        lte: false;
        gt: false;
        gte: false;
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
            lt: (val: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value < val;
                    },
                    caller: 'lt',
                    ...config
                }),
            lte: (min: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value <= min;
                    },
                    caller: 'lte',
                    ...config
                }),
            gt: (val: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value > val;
                    },
                    caller: 'gt',
                    ...config
                }),
            gte: (max: number, config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => {
                        return typeof value === 'number' && value >= max;
                    },
                    caller: 'gte',
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
