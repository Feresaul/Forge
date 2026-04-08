import type {
    BaseForgeConfig,
    UnsuccessfulVerificationResult,
    VerificationResult
} from './types';

/**
 * Helper function to verify a value against a chain of validation functions.
 * @param data - Data and configuration for the verification.
 * @param options - Options for the verification process.
 * @returns A Promise that resolves to a VerificationResult indicating the outcome of the verification.
 */
export const verifyChainAsync = async <TType>(
    value: unknown,
    config: BaseForgeConfig
): Promise<VerificationResult<TType>> => {
    let lastMethodName = '';
    const issues: UnsuccessfulVerificationResult[] = [];

    try {
        for (const method of config.queue) {
            lastMethodName = method.caller;
            const forgeResult = await method.fn(value);

            if (typeof forgeResult === 'boolean') {
                if (
                    (config.isOptional && value === undefined) ||
                    (config.isNullable && value === null)
                ) {
                    break;
                }
                if (!forgeResult) {
                    issues.push({
                        success: false,
                        caller: method.caller,
                        errorCode: method.errorCode || 'validation_error',
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
            caller: lastMethodName,
            errorCode: 'unexpected_error',
            errorMessage: error instanceof Error ? error.message : String(error)
        });
    }

    return issues.length === 0
        ? ({
              success: true,
              value: value as TType
          } as VerificationResult<TType>)
        : {
              success: false,
              caller: config.queue.at(0)?.caller ?? '',
              errorCode: 'validation_error',
              issues
          };
};
