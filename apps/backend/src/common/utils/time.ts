import { HttpException, HttpStatus } from '@nestjs/common';

export const ONE_MINUTE_MS = 60 * 1000;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export function validateCooldown(
    lastActionTime: Date | null | undefined,
    cooldownMs: number,
    errorMessage?: string,
): void {
    if (!lastActionTime) {
        return;
    }

    const now = new Date().getTime();
    const last = new Date(lastActionTime).getTime();
    const diff = now - last;

    if (diff < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - diff) / ONE_MINUTE_MS);

        const msg = errorMessage
            ? `${errorMessage}. Try in ${remainingMinutes} min.`
            : `Too many requests. Try in ${remainingMinutes} min.`;

        throw new HttpException(msg, HttpStatus.TOO_MANY_REQUESTS);
    }
}

export function dateToTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
}
