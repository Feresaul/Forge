import {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    BaseForgeOptions
} from '../forgeTypes';

export type StringForgeOptions = BaseForgeOptions & {
    hasMinLength: boolean;
    hasMaxLength: boolean;
    hasEmail: boolean;
};

type ForgeMethodsConfig<T = unknown> = BaseForgeMethodsConfig<T> & {
    hasMinLength: boolean;
    hasMaxLength: boolean;
    hasEmail: boolean;
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
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: Config['hasMaxLength'];
                  hasEmail: Config['hasEmail'];
              }>;
          }) &
    (Config['isNullable'] extends true
        ? object
        : {
              nullable: () => ForgeMethods<{
                  type: Config['type'] | null;
                  isOptional: Config['isOptional'];
                  isNullable: true;
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: Config['hasMaxLength'];
                  hasEmail: Config['hasEmail'];
              }>;
          }) &
    (Config['hasMinLength'] extends true
        ? object
        : {
              minLength: (
                  minLength: number,
                  errorMessage?: string
              ) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMinLength: true;
                  hasMaxLength: Config['hasMaxLength'];
                  hasEmail: Config['hasEmail'];
              }>;
          }) &
    (Config['hasMaxLength'] extends true
        ? object
        : {
              maxLength: (
                  maxLength: number,
                  errorMessage?: string
              ) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: true;
                  hasEmail: Config['hasEmail'];
              }>;
          }) &
    (Config['hasEmail'] extends true
        ? object
        : {
              email: (errorMessage?: string) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: Config['hasMaxLength'];
                  hasEmail: true;
              }>;
          });

export type StringMethods = ForgeMethods<ForgeMethodsConfig<string>>;
