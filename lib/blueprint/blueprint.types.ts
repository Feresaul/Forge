import type {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    CheckConfig,
    ReplaceForgeConfig
} from '../forgeTypes';

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
    /**
     * Checks if the value passes the custom validation function.
     * @param fn - The custom validation function to apply.
     * @param config - The configuration for the check, including error message and options.
     * @returns A new ForgeMethods instance with the validation applied.
     */
    check: (
        fn: (
            value: BlueprintValues<Config['type']>
        ) => boolean | Promise<boolean>,
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
          });

export type BlueprintMethods<ForgeType> = ForgeMethods<
    BaseForgeMethodsConfig<ForgeType>
>;
