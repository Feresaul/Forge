import { verifyChainAsync } from './forgeFunctions';
import type {
    BaseForgeType,
    BaseForgeTypeConfig,
    ForgeMethod,
    ForgeMethodConfig,
    ForgeState,
    UnknownObject,
    VerificationResult
} from './types';

export const baseForgeType = <
    Methods extends UnknownObject,
    State extends ForgeState<Methods>
>(
    config: BaseForgeTypeConfig<Methods>
) => {
    const addToForge = (method: ForgeMethod) => {
        return baseForgeType<Methods, State>({
            ...config,
            queue: [...config.queue, method]
        });
    };

    const optional = () => {
        return baseForgeType<
            Methods,
            {
                type: State['type'] | undefined;
                optional: true;
                nullable: State['nullable'];
            } & { [K in keyof Methods]: State[K] }
        >({ ...config, isOptional: true });
    };

    const nullable = () => {
        return baseForgeType<
            Methods,
            {
                type: State['type'] | null;
                optional: State['optional'];
                nullable: true;
            } & { [K in keyof Methods]: State[K] }
        >({ ...config, isNullable: true });
    };

    const refine = (
        fn: (value: State['type']) => boolean | Promise<boolean>,
        config?: ForgeMethodConfig
    ): BaseForgeType<Methods, State> => {
        return addToForge({
            fn: (value: unknown) => fn(value as State['type']),
            caller: 'refine',
            ...config
        });
    };

    const craft = async <T = unknown>(
        value: T
    ): Promise<VerificationResult<T>> => verifyChainAsync(value, config);

    return {
        isOptional: config.isOptional,
        isNullable: config.isNullable,
        optional,
        nullable,
        refine,
        craft: config.craft
            ? config.craft({
                  isOptional: config.isOptional,
                  isNullable: config.isNullable,
                  queue: config.queue
              })
            : craft,
        ...config.methods?.(addToForge)
    } as BaseForgeType<Methods, State>;
};
