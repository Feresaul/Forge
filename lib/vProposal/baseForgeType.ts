import { ForgeMethod, ForgeMethodConfig, VerificationResult } from './types';

type UnknownObject = Record<string, unknown>;

type BaseForgeTypeConfig<Methods extends UnknownObject> = {
    isOptional: boolean;
    isNullable: boolean;
    queue: ForgeMethod[];
    methods?: (addToForge: (method: ForgeMethod) => unknown) => Methods;
};

type BaseForgeType<FType, Methods> = {
    isOptional: boolean;
    isNullable: boolean;
    optional: () => BaseForgeType<FType | undefined, Methods>;
    nullable: () => BaseForgeType<FType | null, Methods>;
    check: (
        fn: <T = FType>(value: T) => boolean | Promise<boolean>,
        config?: { errorMessage?: string; path?: string[]; loose?: boolean }
    ) => BaseForgeType<FType, Methods>;
    forge: <T = unknown>(value: T) => VerificationResult<T>;
} & {
    [K in keyof Methods]: Methods[K] extends (...args: infer FArgs) => unknown
        ? (...args: FArgs) => BaseForgeType<FType, Methods>
        : Methods[K];
};

export const baseForgeType = <
    FType,
    Methods extends UnknownObject = UnknownObject
>(
    config: BaseForgeTypeConfig<Methods>
) => {
    const addToForge = (method: ForgeMethod): BaseForgeType<FType, Methods> => {
        return baseForgeType<FType, Methods>({
            ...config,
            queue: [...config.queue, method]
        });
    };

    const optional = (): BaseForgeType<FType | undefined, Methods> => {
        return baseForgeType<FType | undefined, Methods>({
            ...config,
            isOptional: true
        });
    };

    const nullable = (): BaseForgeType<FType | null, Methods> => {
        return baseForgeType<FType | null, Methods>({
            ...config,
            isNullable: true
        });
    };

    const check = (
        fn: <T = FType>(value: T) => boolean | Promise<boolean>,
        config?: ForgeMethodConfig
    ): BaseForgeType<FType, Methods> => {
        return addToForge({ fn, caller: 'check', ...config });
    };

    const forge = <T = unknown>(value: T): VerificationResult<T> => {
        for (const method of config.queue) {
            const { fn, ...methodConfig } = method;
            const result = fn(value);
            if (result instanceof Promise) {
                return {
                    success: false,
                    ...methodConfig
                };
            }
            if (!result) {
                return {
                    success: false,
                    ...methodConfig
                };
            }
        }
        return { success: true, value };
    };

    return {
        isOptional: config.isOptional,
        isNullable: config.isNullable,
        optional,
        nullable,
        check,
        forge,
        ...config.methods?.(addToForge)
    } as BaseForgeType<FType, Methods>;
};
