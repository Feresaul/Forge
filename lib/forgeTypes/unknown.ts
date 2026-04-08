import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType } from '../types';

export const unknown = (): BaseForgeType<
    { _: undefined },
    { type: unknown; optional: true; nullable: true; _: null }
> => {
    return baseForgeType({
        isOptional: true,
        isNullable: true,
        queue: []
    });
};
