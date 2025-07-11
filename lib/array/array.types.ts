import type {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    BaseForgeOptions,
    ForgeCheckConfig
} from '../forgeTypes';

type ForgeOptions = { hasMinLength: boolean; hasMaxLength: boolean };

export type ArrayForgeOptions = BaseForgeOptions & ForgeOptions;

type ForgeMethodsConfig<T = unknown> = BaseForgeMethodsConfig<T> & ForgeOptions;

type ForgeMethods<Config extends ForgeMethodsConfig> = BaseForgeMethods<
    Config['type']
> & {
    /**
     * Checks if the value passes the specified validation function.
     * @param fn - The validation function to apply.
     * @param config - The configuration for the check, including error message and options.
     * @returns A new ForgeMethods instance with the validation applied.
     */
    check: (
        fn: (value: Config['type']) => boolean | Promise<boolean>,
        config?: ForgeCheckConfig
    ) => ForgeMethods<Config>;
} & (Config['isOptional'] extends true
        ? object
        : {
              /**
               * Applies an optional flag to the value forged by this method.
               * @returns A new ForgeMethods instance with the optional flag set.
               */
              optional: () => ForgeMethods<{
                  type: Config['type'] | undefined;
                  isOptional: true;
                  isNullable: Config['isNullable'];
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: Config['hasMaxLength'];
              }>;
          }) &
    (Config['isNullable'] extends true
        ? object
        : {
              /**
               * Applies a nullable flag to the value forged by this method.
               * @returns A new ForgeMethods instance with the nullable flag set.
               */
              nullable: () => ForgeMethods<{
                  type: Config['type'] | null;
                  isOptional: Config['isOptional'];
                  isNullable: true;
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: Config['hasMaxLength'];
              }>;
          }) &
    (Config['hasMinLength'] extends true
        ? object
        : {
              /**
               * Checks if the value has a minimum length.
               * @param minLength - The minimum length to enforce.
               * @param errorMessage - The error message to return if validation fails.
               * @returns A new ForgeMethods instance with the validation applied.
               */
              minLength: (
                  minLength: number,
                  errorMessage?: string
              ) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMinLength: true;
                  hasMaxLength: Config['hasMaxLength'];
              }>;
          }) &
    (Config['hasMaxLength'] extends true
        ? object
        : {
              /**
               * Checks if the value has a maximum length.
               * @param maxLength - The maximum length to enforce.
               * @param errorMessage - The error message to return if validation fails.
               * @returns A new ForgeMethods instance with the validation applied.
               */
              maxLength: (
                  maxLength: number,
                  errorMessage?: string
              ) => ForgeMethods<{
                  type: Config['type'];
                  isOptional: Config['isOptional'];
                  isNullable: Config['isNullable'];
                  hasMinLength: Config['hasMinLength'];
                  hasMaxLength: true;
              }>;
          });

export type ArrayMethods<ForgeType> = ForgeMethods<
    ForgeMethodsConfig<ForgeType[]>
>;
