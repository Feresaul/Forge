import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType } from '../types';

export const unknown = (): BaseForgeType<
    { _: unknown },
    { type: unknown; optional: true; nullable: true; _: true }
> => {
    return baseForgeType({
        isOptional: true,
        isNullable: true,
        queue: []
    });
};
