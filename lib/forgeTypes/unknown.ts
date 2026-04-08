import { baseForgeType } from '../baseForgeType';
import type { BaseForgeType } from '../types';

export const unknown = (): BaseForgeType<
    unknown,
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
