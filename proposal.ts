type ForgeMethod = {
    fn: (value: unknown) => boolean | Promise<boolean>;
    caller?: string;
};

type VerificationResult<T = unknown> =
    | { success: true; value: T }
    | { success: false; errorMessage: string };

function baseForgeType<FType, Methods extends string = string>(config: {
    isOptional: boolean;
    isNullable: boolean;
    queue: ForgeMethod[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methods: Record<Methods, (...args: any[]) => ForgeMethod>;
}) {
    const addToForge = (method: ForgeMethod) => {
        return baseForgeType<FType, Methods>({
            ...config,
            queue: [...config.queue, method]
        });
    };

    const optional = () => {
        return baseForgeType<FType | undefined, Methods>({
            ...config,
            isOptional: true
        });
    };

    const nullable = () => {
        return baseForgeType<FType | null, Methods>({
            ...config,
            isNullable: true
        });
    };

    const check = (
        fn: <T = FType>(value: T) => boolean | Promise<boolean>,
        config?: { errorMessage?: string; path?: string[]; loose?: boolean }
    ) => {
        return addToForge({ fn, caller: 'check', ...config });
    };

    const forge = <T = unknown>(value: T): VerificationResult<T> => {
        for (const method of config.queue) {
            const result = method.fn(value);
            if (result instanceof Promise) {
                return {
                    success: false,
                    errorMessage: 'Async validation not supported'
                };
            }
            if (!result) {
                return {
                    success: false,
                    errorMessage: `Validation failed in ${method.caller}`
                };
            }
        }
        return { success: true, value };
    };

    return {
        _addToForge: addToForge,
        isOptional: config.isOptional,
        isNullable: config.isNullable,
        optional,
        nullable,
        check,
        forge,
        ...config.methods
    };
}

const boolean = () => {
    return baseForgeType<boolean>({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'boolean',
                caller: 'boolean'
            }
        ],
        methods: {}
    });
};

const string = () =>
    baseForgeType<string, 'regExp'>({
        isOptional: false,
        isNullable: false,
        queue: [
            {
                fn: (value: unknown) => typeof value === 'string',
                caller: 'string'
            }
        ],
        methods: {
            regExp: function (regExp: RegExp) {
                return this._addToForge({
                    fn: <T = unknown>(value: T): boolean | Promise<boolean> => {
                        return typeof value === 'string' && regExp.test(value);
                    },
                    caller: 'regExp'
                });
            }
        }
    });

boolean().forge(true); // ?
string()
    .nullable()
    .optional()
    .check((value) => {})
    .nullable()
    .optional()
    .check((value) => {})
    .regExp(/abc/); // ?
