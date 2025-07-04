export type ForgeIssueCode = 'type_error' | 'validation_error' | 'value_error';

export type VerificationResult = {
    success: boolean;
    code?: ForgeIssueCode;
    path?: string[];
    errorMessage?: string;
    issues?: VerificationResult[];
    method?: string;
    arrayIndex?: number;
};

export type ValidationFunction = (value: unknown) => VerificationResult;

export type ForgeData = {
    value: unknown;
    validations: ValidationFunction[];
};

export type BaseForgeOptions = {
    optional: boolean;
    nullable: boolean;
};

export type BaseForgeMethodsConfig<T = unknown> = {
    type: T;
    isOptional: boolean;
    isNullable: boolean;
};

export type BaseForgeMethods<_Type = unknown> = {
    _type: _Type;
    isOptional: boolean;
    isNullable: boolean;
    forge: (value: unknown) => VerificationResult;
};

export type BaseForgeObject = Record<
    string,
    { forge: (value: unknown) => VerificationResult }
>;
