import type {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    BaseForgeOptions
} from '../forgeTypes';

export type NumberForgeOptions = BaseForgeOptions & {
    hasMin: boolean;
    hasMax: boolean;
};

type ForgeMethodsConfig<T = unknown> = BaseForgeMethodsConfig<T> & {
    hasMin: boolean;
    hasMax: boolean;
};

type ForgeMethods<Config extends ForgeMethodsConfig> = BaseForgeMethods<
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
                  hasMin: Config['hasMin'];
                  hasMax: Config['hasMax'];
              }>;
          }) &
    (Config['isNullable'] extends true
        ? object
        : {
              nullable: () => ForgeMethods<{
                  type: Config['type'] | null;
                  isOptional: Config['isOptional'];
                  isNullable: true;
                  hasMin: Config['hasMin'];
                  hasMax: Config['hasMax'];
              }>;
          }) &
    (Config['hasMin'] extends true
        ? object
        : {
              min: (
                  min: number,
                  errorMessage?: string
              ) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMin: true;
                  hasMax: Config['hasMax'];
              }>;
          }) &
    (Config['hasMax'] extends true
        ? object
        : {
              max: (
                  max: number,
                  errorMessage?: string
              ) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMin: Config['hasMin'];
                  hasMax: true;
              }>;
          });

export type NumberMethods = ForgeMethods<ForgeMethodsConfig<number>>;
