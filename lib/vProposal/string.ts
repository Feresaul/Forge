import { baseForgeType } from './baseForgeType';
import type { BaseForgeType, ForgeMethodConfig } from './types';

export const string = (): BaseForgeType<
    {
        regExp: (pattern: RegExp, config?: ForgeMethodConfig) => unknown;
        minLength: (min: number, config?: ForgeMethodConfig) => unknown;
        maxLength: (max: number, config?: ForgeMethodConfig) => unknown;
    },
    {
        type: string;
        optional: false;
        nullable: false;
        minLength: false;
        maxLength: false;
        regExp: null;
    }
> =>
    baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'string',
                caller: 'string',
                errorCode: 'value_error'
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
