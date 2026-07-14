import { describe, expect, it } from 'vitest';

import {
    filterInstagramMediaByDate,
    getCurrentMonthMediaRange,
} from './instagramMediaDateFilter';

describe('Instagram media date filtering', () => {
    it('builds a local current-month range', () => {
        expect(getCurrentMonthMediaRange(new Date(2026, 6, 14, 16, 30))).toEqual({
            start: '2026-07-01',
            end: '2026-07-14',
        });
    });

    it('includes both range boundaries and keeps item order', () => {
        const items = [
            { id: 'newest', timestamp: '2026-07-14T22:00:00+0000' },
            { id: 'middle', timestamp: '2026-07-08T10:00:00+0000' },
            { id: 'first-day', timestamp: '2026-07-01T00:00:00+0000' },
            { id: 'previous-month', timestamp: '2026-06-30T23:59:59+0000' },
        ];

        expect(filterInstagramMediaByDate(items, '2026-07-01', '2026-07-14'))
            .toEqual(items.slice(0, 3));
    });

    it('excludes malformed timestamps and returns no results for a reversed range', () => {
        const items = [
            { id: 'valid', timestamp: '2026-07-08T10:00:00Z' },
            { id: 'invalid', timestamp: 'not-a-date' },
        ];

        expect(filterInstagramMediaByDate(items, '2026-07-01', '2026-07-14'))
            .toEqual([items[0]]);
        expect(filterInstagramMediaByDate(items, '2026-07-14', '2026-07-01'))
            .toEqual([]);
    });
});
