import type {
    BaseForgeOptions,
    ForgeData,
    ValidationFunction,
    VerificationResult
} from './forgeTypes';

/**
 * Helper function to verify a value against a validation function.
 * Returns a VerificationResult indicating success or failure.
 * If the validation fails, it includes an error message and method name.
 * @param data - Data and configuration for the validation.
 * @param fn - The validation function.
 * @returns A VerificationResult indicating the outcome of the validation.
 */
export const verify = <T = unknown>(
    data: {
        value: T;
        errorMessage?: string;
        caller?: string;
    },
    fn: () => boolean
): VerificationResult<T> => {
    const isSuccess = fn();
    if (!isSuccess) {
        return {
            success: false,
            code: 'validation_error',
            method: data.caller,
            errorMessage: data.errorMessage
        };
    }
    return { success: true, value: data.value };
};

/**
 * Helper function to verify a value against a type string.
 * @param data - Data and configuration for the verification.
 * @returns A VerificationResult indicating the outcome of the verification.
 */
export const verifyType = <T>(data: {
    value: T;
    typeStr: string;
    errorMessage?: string;
    caller?: string;
}): VerificationResult<T> => {
    if (typeof data.value !== data.typeStr) {
        return {
            success: false,
            code: 'value_error',
            errorMessage: data.errorMessage,
            method: data.caller
        };
    }
    return { success: true, value: data.value };
};

/**
 * Helper function to verify a value against a chain of validation functions.
 * @param data - Data and configuration for the verification.
 * @returns A VerificationResult indicating the outcome of the verification.
 */
export const verifyChain = <T = unknown>(
    data: ForgeData<T>,
    options: BaseForgeOptions
): VerificationResult<T> => {
    let result: VerificationResult<T> = { success: true, value: data.value };
    if (options.optional && data.value === undefined) {
        return result;
    }
    if (options.nullable && data.value === null) {
        return result;
    }
    data.validations.some((fn) => {
        const verificationResult = fn(data.value);
        const isInvalid = !verificationResult.success;
        if (isInvalid) {
            result = verificationResult;
        }
        return isInvalid;
    });
    return result;
};

/**
 * Helper function to create a set of validation functions.
 * @param initialValidations - An array of initial validation functions.
 * @returns An object containing the validation functions and a method to add more.
 *  * The `addToForge` method allows adding new validation functions with an optional error message and caller name.
 */
export const forgeValidations = (
    initialValidations: ValidationFunction[] = []
) => {
    const validations = initialValidations;

    const addToForge = (config: {
        fn: <T = unknown>(value: T) => boolean;
        errorMessage?: string;
        caller?: string;
    }) => {
        validations.push(<T = unknown>(value: T) =>
            verify(
                {
                    value,
                    errorMessage: config.errorMessage,
                    caller: config.caller ?? 'check'
                },
                () => config.fn(value)
            )
        );
    };

    return { validations, addToForge };
};
