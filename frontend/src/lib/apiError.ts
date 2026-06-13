import { isAxiosError } from 'axios';

export interface ApiErrorPayload {
    code?: string;
    message?: string;
    fieldErrors?: Record<string, string>;
    path?: string;
    requestId?: string;
}

export interface ParsedApiError {
    code: string;
    message: string;
    fieldErrors: Record<string, string>;
    status?: number;
    path?: string;
    requestId?: string;
}

export function parseApiError(err: unknown, fallback: string): ParsedApiError {
    const response = getErrorResponse(err);
    if (isAxiosError(err) || response) {
        const status = response?.status;
        const data = response?.data;

        if (isApiErrorPayload(data)) {
            return {
                code: data.code ?? fallbackCode(status),
                message: data.message ?? fieldErrorMessage(data.fieldErrors) ?? fallback,
                fieldErrors: data.fieldErrors ?? {},
                status,
                path: data.path,
                requestId: data.requestId,
            };
        }

        if (data && typeof data === 'object') {
            const messages = Object.values(data).filter((value): value is string => typeof value === 'string');
            if (messages.length > 0) {
                return baseError(fallbackCode(status), messages.join(', '), status);
            }
        }

        if (!response) {
            return baseError('NETWORK_ERROR', fallback);
        }

        const errorMessage = isAxiosError(err) ? err.message : undefined;
        return baseError(fallbackCode(status), errorMessage || fallback, status);
    }

    if (err instanceof Error) {
        return baseError('CLIENT_ERROR', fallback);
    }

    return baseError('UNKNOWN_ERROR', fallback);
}

function getErrorResponse(err: unknown): { status?: number; data?: unknown } | undefined {
    if (!err || typeof err !== 'object' || !('response' in err)) return undefined;
    const response = (err as { response?: unknown }).response;
    if (!response || typeof response !== 'object') return undefined;

    const candidate = response as Record<string, unknown>;
    return {
        status: typeof candidate.status === 'number' ? candidate.status : undefined,
        data: candidate.data,
    };
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
    return parseApiError(err, fallback).message;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.code === 'string'
        || typeof candidate.message === 'string'
        || isStringRecord(candidate.fieldErrors)
    );
}

function isStringRecord(value: unknown): value is Record<string, string> {
    return Boolean(
        value
        && typeof value === 'object'
        && Object.values(value).every(item => typeof item === 'string')
    );
}

function fieldErrorMessage(fieldErrors?: Record<string, string>): string | undefined {
    if (!fieldErrors) return undefined;
    const messages = Object.values(fieldErrors);
    return messages.length > 0 ? messages.join(', ') : undefined;
}

function fallbackCode(status?: number): string {
    if (status === 400) return 'VALIDATION_ERROR';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'RESOURCE_NOT_FOUND';
    if (status === 405) return 'METHOD_NOT_ALLOWED';
    if (status === 409) return 'CONFLICT';
    if (status === 413) return 'PAYLOAD_TOO_LARGE';
    if (status === 415) return 'UNSUPPORTED_MEDIA_TYPE';
    if (status === 429) return 'RATE_LIMITED';
    if (status === 502) return 'BAD_GATEWAY';
    if (status && status >= 500) return 'INTERNAL_ERROR';
    return 'API_ERROR';
}

function baseError(code: string, message: string, status?: number): ParsedApiError {
    return {
        code,
        message,
        fieldErrors: {},
        status,
        path: undefined,
        requestId: undefined,
    };
}
