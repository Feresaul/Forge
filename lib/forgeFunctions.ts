import type {
    BaseForgeOptions,
    ForgeData,
    ForgeMethod,
    UnsuccessfulVerificationResult,
    VerificationResult
} from './forgeTypes';

/**
 * Helper function to verify a value against a chain of validation functions.
 * @param data - Data and configuration for the verification.
 * @returns A VerificationResult indicating the outcome of the verification.
 */
export const verifyChain = <T = unknown>(
    data: ForgeData<T>,
    options: BaseForgeOptions
): VerificationResult<T> => {
    let lastMethodName = '';
    const issues: UnsuccessfulVerificationResult[] = [];

    try {
        data.methods.some((method) => {
            lastMethodName = method.caller;
            const forgeResult = method.fn(data.value);

            if (forgeResult instanceof Promise) {
                issues.push({
                    success: false,
                    errorCode: 'async_method_error',
                    caller: method.caller,
                    errorMessage: method.errorMessage,
                    path: method.path
                });
                return !method.loose;
            }

            if (typeof forgeResult === 'boolean') {
                if (
                    (options.optional && data.value === undefined) ||
                    (options.nullable && data.value === null)
                ) {
                    return true;
                }
                if (!forgeResult) {
                    issues.push({
                        success: false,
                        errorCode: method.errorCode || 'validation_error',
                        caller: method.caller,
                        errorMessage: method.errorMessage,
                        path: method.path
                    });
                    return !method.loose;
                }
                return false;
            }

            return false;
        });
    } catch (error) {
        issues.push({
            success: false,
            errorCode: 'unexpected_error',
            caller: lastMethodName,
            errorMessage: error instanceof Error ? error.message : String(error)
        });
    }

    return issues.length === 0
        ? { success: true, value: data.value }
        : { success: false, errorCode: 'validation_error', caller: '', issues };
};
/**
 * Asynchronous version of the verifyChain function.
 * @param data - Data and configuration for the verification.
 * @param options - Options for the verification process.
 * @returns A Promise that resolves to a VerificationResult indicating the outcome of the verification.
 */
export const verifyChainAsync = async <T = unknown>(
    data: ForgeData<T>,
    options: BaseForgeOptions
): Promise<VerificationResult<T>> => {
    let lastMethodName = '';
    const issues: UnsuccessfulVerificationResult[] = [];

    try {
        for (const method of data.methods) {
            lastMethodName = method.caller;
            const forgeResult = await method.fn(data.value);

            if (typeof forgeResult === 'boolean') {
                if (
                    (options.optional && data.value === undefined) ||
                    (options.nullable && data.value === null)
                ) {
                    break;
                }
                if (!forgeResult) {
                    issues.push({
                        success: false,
                        errorCode: method.errorCode || 'validation_error',
                        caller: method.caller,
                        errorMessage: method.errorMessage,
                        path: method.path
                    });
                    if (method.loose) {
                        continue;
                    } else {
                        break;
                    }
                }
            }
        }
    } catch (error) {
        issues.push({
            success: false,
            errorCode: 'unexpected_error',
            caller: lastMethodName,
            errorMessage: error instanceof Error ? error.message : String(error)
        });
    }

    return issues.length === 0
        ? { success: true, value: data.value }
        : { success: false, errorCode: 'validation_error', caller: '', issues };
};

/**
 * Helper function to create a set of validation and mutation functions.
 * @param initialMethods - An array of initial validation and mutation functions.
 * @returns An object containing the methods and a method to add more.
 * The `addToForge` method allows adding new methods with an optional error message and caller name.
 */
export const forgeMethods = (initialMethods: ForgeMethod[]) => {
    const methods = initialMethods.slice();

    const addToForge = (method: ForgeMethod) => {
        methods.push(method);
    };

    return { methods, addToForge };
};
