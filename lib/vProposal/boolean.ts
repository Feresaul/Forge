import { baseForgeType } from './baseForgeType';

export const boolean = () => {
    return baseForgeType<boolean>({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'boolean',
                caller: 'boolean'
            }
        ]
    });
};
