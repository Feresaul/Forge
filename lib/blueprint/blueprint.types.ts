import type { BaseForgeMethods, BaseForgeMethodsConfig } from '../forgeTypes';

type BlueprintValues<T> = {
    [K in keyof T]: T[K] extends { model: infer M }
        ? BlueprintValues<M>
        : T[K] extends { _type: infer FType }
          ? FType
          : unknown;
};

type ForgeMethods<Config extends BaseForgeMethodsConfig> = BaseForgeMethods<
    BlueprintValues<Config['type']>
> & {
    model: Config['type'];
    check: (
        fn: (value: BlueprintValues<Config['type']>) => boolean,
        errorMessage?: string
    ) => ForgeMethods<Config>;
} & (Config['isOptional'] extends true
        ? object
        : {
              optional: () => ForgeMethods<{
                  type: Config['type'] | undefined;
                  isOptional: true;
                  isNullable: Config['isNullable'];
              }>;
          }) &
    (Config['isNullable'] extends true
        ? object
        : {
              nullable: () => ForgeMethods<{
                  type: Config['type'] | null;
                  isOptional: Config['isOptional'];
                  isNullable: true;
              }>;
          });

export type BlueprintMethods<ForgeType> = ForgeMethods<
    BaseForgeMethodsConfig<ForgeType>
>;
