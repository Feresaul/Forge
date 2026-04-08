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
    TType,
    Methods extends UnknownObject,
    State extends ForgeState<Methods>
>(
    config: BaseForgeTypeConfig<TType, Methods>
): BaseForgeType<TType, Methods, State> => {
    const addToForge = (method: ForgeMethod) => {
        return baseForgeType<TType, Methods, State>({
            ...config,
            queue: [...config.queue, method]
        });
    };

    const optional = () => {
        return baseForgeType<
            TType | undefined,
            Methods,
            {
                optional: true;
                nullable: State['nullable'];
            } & { [K in keyof Methods]: State[K] }
        >({ ...config, isOptional: true });
    };

    const nullable = () => {
        return baseForgeType<
            TType | null,
            Methods,
            {
                optional: State['optional'];
                nullable: true;
            } & { [K in keyof Methods]: State[K] }
        >({ ...config, isNullable: true });
    };

    const verify = (
        fn: (value: TType) => boolean | Promise<boolean>,
        config?: ForgeMethodConfig
    ): BaseForgeType<TType, Methods, State> => {
        return addToForge({
            fn: (value: unknown) => fn(value as TType),
            caller: 'verify',
            ...config
        });
    };

    const craft = async (value: unknown): Promise<VerificationResult<TType>> =>
        verifyChainAsync(value, config);

    const methods = (config.methods?.(addToForge) ?? {}) as Methods;

    return {
        _type: undefined as unknown as TType,
        isOptional: config.isOptional,
        isNullable: config.isNullable,
        optional: optional as BaseForgeType<TType, Methods, State>['optional'],
        nullable: nullable as BaseForgeType<TType, Methods, State>['nullable'],
        verify,
        craft: config.craft
            ? config.craft({
                  isOptional: config.isOptional,
                  isNullable: config.isNullable,
                  queue: config.queue
              })
            : craft,
        ...methods
    } as BaseForgeType<TType, Methods, State>;
};
