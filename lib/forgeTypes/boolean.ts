import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType, ForgeMethodConfig } from '../types';

export const boolean = (
    config?: ForgeMethodConfig
): BaseForgeType<
    boolean,
    {
        false: (config?: ForgeMethodConfig) => { true: false };
        true: (config?: ForgeMethodConfig) => { false: false };
    },
    {
        optional: false;
        nullable: false;
        false: false;
        true: false;
    }
> => {
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'boolean',
                caller: 'boolean',
                errorCode: 'value_error',
                ...config
            }
        ],
        methods: (addToForge) => ({
            false: (config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => value === false,
                    caller: 'false',
                    ...config
                }),
            true: (config?: ForgeMethodConfig) =>
                addToForge({
                    fn: (value: unknown) => value === true,
                    caller: 'true',
                    ...config
                })
        })
    });
};
