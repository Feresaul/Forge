import type {
    BaseForgeMethods,
    BaseForgeMethodsConfig,
    BaseForgeOptions
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
     * @param errorMessage - The error message to return if validation fails.
     * @returns A new ForgeMethods instance with the validation applied.
     */
    check: (
        fn: (value: Config['type']) => boolean | Promise<boolean>,
        errorMessage?: string
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
                  hasMin: Config['hasMin'];
                  hasMax: Config['hasMax'];
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
                  hasMin: Config['hasMin'];
                  hasMax: Config['hasMax'];
              }>;
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
              /**
               * Applies a maximum value constraint to the value forged by this method.
               * @param max - The maximum value that the forged value must be less than or equal to.
               * @param errorMessage - The error message to return if validation fails.
               * @returns A new ForgeMethods instance with the maximum value constraint applied.
               */
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
