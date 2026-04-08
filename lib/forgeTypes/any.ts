/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType } from '../types';

export const any = (): BaseForgeType<
    any,
    { _: undefined },
    {
        optional: true;
        nullable: true;
        _: null;
    }
> => {
    return baseForgeType({
        isOptional: true,
        isNullable: true,
        queue: []
    });
};
