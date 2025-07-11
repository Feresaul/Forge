import { isPromise } from 'util/types';
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
    let updatedValue: T = data.value;
    let lastMethodName = '';
    const issues: UnsuccessfulVerificationResult[] = [];

    try {
        data.methods.some((method) => {
            lastMethodName = method.caller;
            const forgeResult = method.fn(updatedValue);

            if (isPromise(forgeResult)) {
                issues.push({
                    success: false,
                    code: 'async_method_error',
                    method: method.caller,
                    errorMessage: method.errorMessage
                });
                return true;
            }

            if (typeof forgeResult === 'boolean') {
                if (
                    (options.optional && updatedValue === undefined) ||
                    (options.nullable && updatedValue === null)
                ) {
                    return true;
                }
                if (!forgeResult) {
                    issues.push({
                        success: false,
                        code: method.code || 'validation_error',
                        method: method.caller,
                        errorMessage: method.errorMessage
                    });
                    return true;
                }
                return false;
            }

            updatedValue = forgeResult as T;
            return false;
        });
    } catch (error) {
        issues.push({
            success: false,
            code: 'unexpected_error',
            method: lastMethodName,
            errorMessage: error instanceof Error ? error.message : String(error)
        });
    }

    return issues.length === 0
        ? { success: true, value: updatedValue }
        : { success: false, code: 'validation_error', method: '', issues };
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
    let updatedValue: T = data.value;
    let lastMethodName = '';
    const issues: UnsuccessfulVerificationResult[] = [];

    try {
        for (const method of data.methods) {
            lastMethodName = method.caller;
            const forgeResult = await method.fn(updatedValue);

            if (typeof forgeResult === 'boolean') {
                if (
                    (options.optional && updatedValue === undefined) ||
                    (options.nullable && updatedValue === null)
                ) {
                    break;
                }
                if (!forgeResult) {
                    issues.push({
                        success: false,
                        code: method.code || 'validation_error',
                        method: method.caller,
                        errorMessage: method.errorMessage
                    });
                }
                break;
            }

            updatedValue = forgeResult as T;
        }
    } catch (error) {
        issues.push({
            success: false,
            code: 'unexpected_error',
            method: lastMethodName,
            errorMessage: error instanceof Error ? error.message : String(error)
        });
    }

    return issues.length === 0
        ? { success: true, value: updatedValue }
        : { success: false, code: 'validation_error', method: '', issues };
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
