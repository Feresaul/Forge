import type {
    BaseForgeOptions,
    ForgeData,
    ValidationFunction,
    VerificationResult
} from './forgeTypes';

export const verify = <T = unknown>(
    data: {
        value: T;
        errorMessage?: string;
        caller?: string;
    },
    fn: () => boolean
): VerificationResult => {
    const verificationResult: VerificationResult = { success: fn() };
    if (!verificationResult.success) {
        verificationResult.code = 'validation_error';
        verificationResult.method = data.caller;
        verificationResult.errorMessage = data.errorMessage;
    }
    return verificationResult;
};

export const verifyType = (data: {
    value: unknown;
    typeStr: string;
    errorMessage?: string;
    caller?: string;
}): VerificationResult => {
    if (typeof data.value !== data.typeStr) {
        return {
            success: false,
            code: 'value_error',
            errorMessage: data.errorMessage,
            method: data.caller
        };
    }
    return { success: true };
};

export const verifyChain = (
    { value, validations }: ForgeData,
    { nullable, optional }: BaseForgeOptions
) => {
    let result: VerificationResult = { success: true };
    if (optional && value === undefined) {
        return result;
    }
    if (nullable && value === null) {
        return result;
    }
    validations.some((fn) => {
        const verificationResult = fn(value);
        const isInvalid = !verificationResult.success;
        if (isInvalid) {
            result = verificationResult;
        }
        return isInvalid;
    });
    return result;
};

export const forgeValidations = (
    initialValidations: ValidationFunction[] = []
) => {
    const validations = initialValidations;

    const addToForge = (config: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fn: (value: any) => boolean;
        errorMessage?: string;
        caller?: string;
    }) => {
        validations.push((value: unknown) =>
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
