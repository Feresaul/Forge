import type {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    CheckConfig,
    UpdateForgeConfig
} from '../forgeTypes';

type ForgeMethods<Config extends BaseForgeMethodsConfig> = BaseForgeMethods<
    Config['type']
> & {
    /**
     * Checks if the value passes the custom validation function.
     * @param fn - The custom validation function to apply.
     * @param config - The configuration for the check, including error message and options.
     * @returns A new ForgeMethods instance with the validation applied.
     */
    check: (
        fn: (value: Config['type']) => boolean | Promise<boolean>,
        config?: CheckConfig
    ) => ForgeMethods<Config>;
} & (Config['isOptional'] extends true
        ? object
        : {
              /**
               * Applies an optional flag to the value forged by this method.
               * @returns A new ForgeMethods instance with the optional flag set.
               */
              optional: () => ForgeMethods<
                  UpdateForgeConfig<
                      Config,
                      { type: Config['type'] | undefined; isOptional: true }
                  >
              >;
          }) &
    (Config['isNullable'] extends true
        ? object
        : {
              /**
               * Applies a nullable flag to the value forged by this method.
               * @returns A new ForgeMethods instance with the nullable flag set.
               */
              nullable: () => ForgeMethods<
                  UpdateForgeConfig<
                      Config,
                      { type: Config['type'] | null; isNullable: true }
                  >
              >;
          });

export type BooleanMethods = ForgeMethods<BaseForgeMethodsConfig<boolean>>;
