import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage, parseApiError } from './apiError';

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

    it('does not expose technical messages from non-axios errors', () => {
        expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    });

    it('supports axios-like response objects from API adapters and tests', () => {
        const error = { response: { status: 403, data: { message: 'Bu işlem için yetkiniz yok' } } };

        expect(parseApiError(error, 'fallback')).toMatchObject({
            code: 'FORBIDDEN',
            message: 'Bu işlem için yetkiniz yok',
            status: 403,
        });
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

    it('parses the standard backend error envelope', () => {
        const error = new AxiosError('Request failed');
        error.response = {
            data: {
                code: 'VALIDATION_ERROR',
                message: 'İstek alanlarını kontrol edin',
                fieldErrors: { email: 'Geçerli bir email girin' },
                timestamp: '2026-06-13T16:00:00Z',
                path: '/api/admin/staff',
                requestId: 'request-123',
            },
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config: {} as never,
        };

        expect(parseApiError(error, 'fallback')).toEqual({
            code: 'VALIDATION_ERROR',
            message: 'İstek alanlarını kontrol edin',
            fieldErrors: { email: 'Geçerli bir email girin' },
            status: 400,
            path: '/api/admin/staff',
            requestId: 'request-123',
        });
    });

    it('normalizes network errors without a backend response', () => {
        const error = new AxiosError('Network Error');

        expect(parseApiError(error, 'Bağlantı kurulamadı')).toEqual({
            code: 'NETWORK_ERROR',
            message: 'Bağlantı kurulamadı',
            fieldErrors: {},
            status: undefined,
            path: undefined,
            requestId: undefined,
        });
    });
});
