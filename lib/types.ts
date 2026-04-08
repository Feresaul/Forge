export type ErrorCode =
    | 'value_error'
    | 'validation_error'
    | 'async_method_error'
    | 'unexpected_error';

export type ForgeMethodConfig = {
    errorMessage?: string;
    path?: string[];
    loose?: boolean;
};

export type ForgeMethod = ForgeMethodConfig & {
    fn: (value: unknown) => boolean | Promise<boolean>;
    caller: string;
    errorCode?: ErrorCode;
};

export type SuccessfulVerificationResult<TType> = {
    success: true;
    value: TType;
};

export type UnsuccessfulVerificationResult = {
    success: false;
    caller: string;
    errorCode: ErrorCode;
    errorMessage?: string;
    path?: string[];
    issues?: UnsuccessfulVerificationResult[];
    arrayIndex?: number;
};

export type VerificationResult<TType> =
    | SuccessfulVerificationResult<TType>
    | UnsuccessfulVerificationResult;

export type UnknownObject = Record<string, unknown>;

export type ForgeState<Methods extends UnknownObject> = {
    optional: boolean;
    nullable: boolean;
} & {
    [K in keyof Methods]: boolean | null;
};

export type BaseForgeConfig = {
    isOptional: boolean;
    isNullable: boolean;
    queue: ForgeMethod[];
};

export type BaseForgeTypeConfig<
    TType,
    Methods extends UnknownObject
> = BaseForgeConfig & {
    methods?: (addToForge: (method: ForgeMethod) => unknown) => Methods;
    craft?: (
        config: BaseForgeConfig
    ) => (value: unknown) => Promise<VerificationResult<TType>>;
};

export type BaseForgeType<
    TType,
    Methods extends UnknownObject,
    State extends ForgeState<Methods>
> = {
    /**
     * The current type of the schema. It is updated when a method that changes the type is called (e.g. optional, nullable, etc.).
     * It is used to infer the type of the value when crafting and refining.
     */
    _type: TType;
    /**
     * Indicates if the schema is optional. It is updated when the optional method is called. It is used to infer the type of the value when crafting and refining.
     */
    isOptional: boolean;
    /**
     * Indicates if the schema is nullable. It is updated when the nullable method is called. It is used to infer the type of the value when crafting and refining.
     */
    isNullable: boolean;
    /**
     * Makes the schema optional. It can only be called once, and it cannot be called if the schema is already optional. It updates the type of the schema to include undefined.
     */
    optional: State['optional'] extends true
        ? never
        : () => BaseForgeType<
              TType | undefined,
              Methods,
              {
                  optional: true;
                  nullable: State['nullable'];
              } & { [K in keyof Methods]: State[K] }
          >;
    /**
     * Makes the schema nullable. It can only be called once, and it cannot be called if the schema is already nullable. It updates the type of the schema to include null.
     */
    nullable: State['nullable'] extends true
        ? never
        : () => BaseForgeType<
              TType | null,
              Methods,
              {
                  optional: State['optional'];
                  nullable: true;
              } & { [K in keyof Methods]: State[K] }
          >;
    /**
     * Adds a custom validation function to the schema. The function receives the value of the schema as an argument and should return a boolean or a promise that resolves to a boolean.
     * - If the function returns false, the validation fails and the error message specified in the config is used in the verification result.
     * - If the function returns true, the validation passes and the crafting process continues.
     * The verify method can be used to add any kind of validation logic that is not covered by the built-in methods.
     * @param fn - The validation function. It receives the value of the schema as an argument and should return a boolean or a promise that resolves to a boolean.
     * @param config - The configuration object for the validation function. It can be used to specify an error message, a path, and an error code for the validation function.
     * @returns A new schema with the validation function added.
     */
    verify: (
        fn: (value: TType) => boolean | Promise<boolean>,
        config?: ForgeMethodConfig
    ) => BaseForgeType<TType, Methods, State>;
    /**
     * Crafts a value by validating it against the schema. It returns a promise that resolves to a verification result, which can be either successful or unsuccessful.
     * The type of the value is inferred from the current state of the schema.
     * @param value - The value to be crafted. It can be of any type, but it will be validated against the schema and the type of the value will be inferred from the schema.
     * @returns A promise that resolves to a verification result, which can be either successful or unsuccessful.
     * The type of the value in the successful result is inferred from the current state of the schema.
     */
    craft: (value: unknown) => Promise<VerificationResult<TType>>;
} & {
    [MethodName in keyof Methods]: Methods[MethodName] extends (
        ...args: infer FArgs
    ) => unknown
        ? // If state is null function can be used multiple times
          State[MethodName] extends null
            ? (...args: FArgs) => BaseForgeType<TType, Methods, State>
            : // If state is not null, function can only be used once
              State[MethodName] extends true
              ? never
              : (...args: FArgs) => BaseForgeType<
                    TType,
                    Methods,
                    {
                        optional: State['optional'];
                        nullable: State['nullable'];
                    } & {
                        // Update state to true for the method that was called
                        // - If it has dependencies, they are set to true as well
                        [StateItem in keyof Methods]: StateItem extends MethodName
                            ? true
                            : ReturnType<Methods[MethodName]> extends {
                                    [K in StateItem]: false;
                                }
                              ? true
                              : State[StateItem];
                    }
                >
        : Methods[MethodName];
};

export type BaseForgeObject<TType = unknown> = {
    _type: TType;
    isOptional: boolean;
    isNullable: boolean;
    craft: (value: unknown) => Promise<VerificationResult<TType>>;
};
