export type ForgeIssueCode = 'type_error' | 'validation_error' | 'value_error';

export type UnsuccessfulVerificationResult = {
    success: false;
    code?: ForgeIssueCode;
    /**
     * The path to the value that failed verification.
     */
    path?: string[];
    errorMessage?: string;
    /**
     * An array of issues that occurred during the verification process.
     * Each issue can provide additional context about the failure.
     */
    issues?: UnsuccessfulVerificationResult[];
    method?: string;
    /**
     * If the value is part of an array, this indicates the index of the array element that failed verification.
     */
    arrayIndex?: number;
};

export type VerificationResult<T = unknown> =
    | {
          success: true;
          value: T;
      }
    | UnsuccessfulVerificationResult;

export type ValidationFunction = <T = unknown>(
    value: T
) => VerificationResult<T>;

export type ForgeData<T = unknown> = {
    value: T;
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
    /**
     * Indicates if the value forged by this method is optional.
     */
    isOptional: boolean;
    /**
     * Indicates if the value forged by this method can be null.
     */
    isNullable: boolean;
    /**
     * Forge a value based on the type and options defined in the chained methods.
     * @return A VerificationResult containing the forged value or an error if validation fails.
     */
    forge: <T = unknown>(value: T) => VerificationResult<T>;
};

export type BaseForgeObject = Record<
    string,
    { forge: BaseForgeMethods['forge'] }
>;
