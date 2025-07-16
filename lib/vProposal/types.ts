export type ForgeMethodConfig = {
    errorMessage?: string;
    path?: string[];
    loose?: boolean;
};

export type ForgeMethod = ForgeMethodConfig & {
    fn: (value: unknown) => boolean | Promise<boolean>;
    caller: string;
};

export type UnsuccessfulVerificationResult = {
    success: false;
    caller: string;
    errorMessage?: string;
    path?: string[];
    issues?: UnsuccessfulVerificationResult[];
    arrayIndex?: number;
};

export type VerificationResult<T = unknown> =
    | { success: true; value: T }
    | UnsuccessfulVerificationResult;
