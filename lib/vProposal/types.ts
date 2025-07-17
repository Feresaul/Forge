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

export type UnsuccessfulVerificationResult = {
    success: false;
    caller: string;
    errorCode: ErrorCode;
    errorMessage?: string;
    path?: string[];
    issues?: UnsuccessfulVerificationResult[];
    arrayIndex?: number;
};

export type VerificationResult<T = unknown> =
    | { success: true; value: T }
    | UnsuccessfulVerificationResult;

export type UnknownObject = Record<string, unknown>;

export type ForgeState<Methods extends UnknownObject> = {
    type: unknown;
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

export type BaseForgeTypeConfig<Methods extends UnknownObject> =
    BaseForgeConfig & {
        methods?: (addToForge: (method: ForgeMethod) => unknown) => Methods;
        forge?: (
            config: BaseForgeConfig
        ) => <T = unknown>(value: T) => Promise<VerificationResult<unknown>>;
    };

export type BaseForgeType<
    Methods extends UnknownObject,
    State extends ForgeState<Methods>
> = {
    _type: State['type'];
    isOptional: boolean;
    isNullable: boolean;
    optional: State['optional'] extends true
        ? never
        : () => BaseForgeType<
              Methods,
              {
                  type: State['type'] | undefined;
                  optional: true;
                  nullable: State['nullable'];
              } & { [K in keyof Methods]: State[K] }
          >;

    nullable: State['nullable'] extends true
        ? never
        : () => BaseForgeType<
              Methods,
              {
                  type: State['type'] | null;
                  optional: State['optional'];
                  nullable: true;
              } & { [K in keyof Methods]: State[K] }
          >;
    check: (
        fn: <T = State['type']>(value: T) => boolean | Promise<boolean>,
        config?: ForgeMethodConfig
    ) => BaseForgeType<Methods, State>;
    forge: <T = unknown>(value: T) => Promise<VerificationResult<T>>;
} & {
    [MethodName in keyof Methods]: Methods[MethodName] extends (
        ...args: infer FArgs
    ) => unknown
        ? State[MethodName] extends null
            ? (...args: FArgs) => BaseForgeType<Methods, State>
            : State[MethodName] extends true
              ? never
              : (...args: FArgs) => BaseForgeType<
                    Methods,
                    {
                        type: State['type'];
                        optional: State['optional'];
                        nullable: State['nullable'];
                    } & {
                        [StateItem in keyof Methods]: StateItem extends MethodName
                            ? true
                            : ReturnType<Methods[MethodName]> extends {
                                    [K in StateItem]: false;
                                }
                              ? true
                              : State[StateItem];
                    }
                >
        : never;
};

export type BaseForgeObject = {
    _type: unknown;
    isOptional: boolean;
    isNullable: boolean;
    forge: <T = unknown>(value: T) => Promise<VerificationResult<T>>;
};
