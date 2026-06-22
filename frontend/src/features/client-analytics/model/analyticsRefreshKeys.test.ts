import { describe, expect, it } from 'vitest';
import { clientAnalyticsRefreshKeys } from './analyticsRefreshKeys';

describe('clientAnalyticsRefreshKeys', () => {
    it('returns scoped analytics query keys without duplicates', () => {
        const keys = clientAnalyticsRefreshKeys('company-1');
        const serialized = keys.map(key => JSON.stringify(key));

        expect(new Set(serialized).size).toBe(keys.length);
        expect(keys).toContainEqual(['active-services', 'company-1']);
        expect(keys).toContainEqual(['client-ig-status', 'company-1']);
        expect(keys).toContainEqual(['google-analytics']);
        expect(keys).toContainEqual(['client-sc']);
        expect(keys).toContainEqual(['google-ads', 'overview', 'company-1', undefined, undefined]);
        expect(keys).toContainEqual(['meta-ads', 'overview', 'company-1', undefined, undefined]);
        expect(keys).toContainEqual(['content-plans', 'list']);
        expect(keys).toContainEqual(['shoots', 'list', 'client', 'ALL', 0, 50]);
        expect(keys).toContainEqual(['maintenance-log', 'mine']);
    });
});
