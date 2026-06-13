import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorMessage } from './apiError';

describe('getApiErrorMessage', () => {
    it('returns axios response data message when available', () => {
        const error = new AxiosError('Request failed');
        error.response = {
            data: { message: 'Geçersiz email veya şifre' },
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config: {} as never,
        };

        expect(getApiErrorMessage(error, 'fallback')).toBe('Geçersiz email veya şifre');
    });

    it('joins object string values when there is no explicit message', () => {
        const error = new AxiosError('Request failed');
        error.response = {
            data: { field: 'Title is required', other: 'Description is required' },
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config: {} as never,
        };

        expect(getApiErrorMessage(error, 'fallback')).toContain('Title is required');
        expect(getApiErrorMessage(error, 'fallback')).toContain('Description is required');
    });

    it('falls back to Error.message for non-axios errors', () => {
        expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
    });

    it('returns fallback when error is a string or unknown', () => {
        expect(getApiErrorMessage('string error', 'fallback')).toBe('fallback');
        expect(getApiErrorMessage(undefined, 'fallback')).toBe('fallback');
        expect(getApiErrorMessage(42, 'fallback')).toBe('fallback');
    });

    it('falls back to axios error message when response data is null', () => {
        const error = new AxiosError('Network error');
        error.response = {
            data: null,
            status: 500,
            statusText: 'Server Error',
            headers: {},
            config: {} as never,
        };

        expect(getApiErrorMessage(error, 'Sunucu hatası')).toBe('Network error');
    });

    it('falls back to axios error message when data is empty', () => {
        const error = new AxiosError('Request failed');
        error.response = {
            data: {},
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config: {} as never,
        };

        expect(getApiErrorMessage(error, 'fallback')).toBe('Request failed');
    });
});
