type ApiErrorBody = {
    message?: unknown;
    error?: unknown;
};

type ApiError = {
    response?: {
        data?: ApiErrorBody;
    };
};

export const extractSettingsErrorMessage = (
    error: unknown,
    fallbackMessage: string,
): string => {
    if (typeof error === 'object' && error !== null) {
        const response = (error as ApiError).response;
        const body = response?.data;

        if (typeof body?.message === 'string' && body.message.trim()) {
            return body.message.trim();
        }

        if (Array.isArray(body?.message) && body.message.length > 0) {
            const firstMessage = body.message.find(
                (item) => typeof item === 'string' && item.trim(),
            );
            if (typeof firstMessage === 'string') {
                return firstMessage.trim();
            }
        }

        if (typeof body?.error === 'string' && body.error.trim()) {
            return body.error.trim();
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message.trim();
    }

    return fallbackMessage;
};
