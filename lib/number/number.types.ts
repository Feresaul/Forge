import type {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    BaseForgeOptions,
    CheckConfig,
    ReplaceForgeConfig
} from '../forgeTypes';

type ForgeOptions = { hasMin: boolean; hasMax: boolean };

export type NumberForgeOptions = BaseForgeOptions & ForgeOptions;

type ForgeMethodsConfig<T = unknown> = BaseForgeMethodsConfig<T> & ForgeOptions;

type ForgeMethods<Config extends ForgeMethodsConfig> = BaseForgeMethods<
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
                  ReplaceForgeConfig<
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
                  ReplaceForgeConfig<
                      Config,
                      { type: Config['type'] | null; isNullable: true }
                  >
              >;
          }) &
    (Config['hasMin'] extends true
        ? object
        : {
              /**
               * Applies a minimum value constraint to the value forged by this method.
               * @param min - The minimum value that the forged value must be greater than or equal to.
               * @param errorMessage - The error message to return if validation fails.
               * @returns A new ForgeMethods instance with the minimum value constraint applied.
               */
              min: (
                  min: number,
                  errorMessage?: string
              ) => ForgeMethods<ReplaceForgeConfig<Config, { hasMin: true }>>;
          }) &
    (Config['hasMax'] extends true
        ? object
        : {
              /**
               * Applies a maximum value constraint to the value forged by this method.
               * @param max - The maximum value that the forged value must be less than or equal to.
               * @param errorMessage - The error message to return if validation fails.
               * @returns A new ForgeMethods instance with the maximum value constraint applied.
               */
              max: (
                  max: number,
                  errorMessage?: string
              ) => ForgeMethods<ReplaceForgeConfig<Config, { hasMax: true }>>;
          });

export type NumberMethods = ForgeMethods<ForgeMethodsConfig<number>>;
