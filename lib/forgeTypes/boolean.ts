import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType } from '../types';

export const boolean = (): BaseForgeType<
    { _: unknown },
    { type: boolean; optional: false; nullable: false; _: true }
> => {
    return baseForgeType({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'boolean',
                caller: 'boolean',
                errorCode: 'value_error'
            }
        ]
    });
};
