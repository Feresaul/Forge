import type { BaseForgeMethods, BaseForgeMethodsConfig } from '../forgeTypes';

type ForgeMethods<Config extends BaseForgeMethodsConfig> = BaseForgeMethods<
    Config['type']
> & {
    check: (
        fn: (value: Config['type']) => boolean,
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

export type BooleanMethods = ForgeMethods<BaseForgeMethodsConfig<boolean>>;
