import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType } from '../types';

export const any = (): BaseForgeType<
    { _: unknown },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { type: any; optional: true; nullable: true; _: true }
> => {
    return baseForgeType({
        isOptional: true,
        isNullable: true,
        queue: []
    });
};
