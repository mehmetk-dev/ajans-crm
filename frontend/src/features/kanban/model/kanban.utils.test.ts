import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import type { TaskResponse } from '../../tasks';
import {
    getGreeting,
    STATUS_BADGE,
    MOTIVATIONAL,
    toLocalDateKey,
    dateToKey,
    parseLocalDateKey,
    isToday,
    isFuture,
    isOverdue,
    formatDateShort,
    formatTime,
} from './kanban.utils';

describe('getGreeting', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns moon greeting for late night hours', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 2, 0, 0));

        expect(getGreeting()).toEqual({ text: 'İyi geceler', iconType: 'moon' });
    });

    it('returns sunrise greeting for early morning hours', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 8, 0, 0));

        expect(getGreeting()).toEqual({ text: 'Günaydın', iconType: 'sunrise' });
    });

    it('returns sun greeting for afternoon hours', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 15, 0, 0));

        expect(getGreeting()).toEqual({ text: 'İyi günler', iconType: 'sun' });
    });

    it('returns coffee greeting for evening hours', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 20, 0, 0));

        expect(getGreeting()).toEqual({ text: 'İyi akşamlar', iconType: 'coffee' });
    });
});

describe('STATUS_BADGE', () => {
    it('defines badge styling for known statuses', () => {
        expect(STATUS_BADGE.TODO).toMatchObject({ label: 'Bekliyor' });
        expect(STATUS_BADGE.IN_PROGRESS).toMatchObject({ label: 'Devam Ediyor' });
        expect(STATUS_BADGE.DONE).toMatchObject({ label: 'Tamamlandı' });
    });
});

describe('MOTIVATIONAL', () => {
    it('exposes a non-empty list of strings', () => {
        expect(MOTIVATIONAL.length).toBeGreaterThan(0);
        for (const phrase of MOTIVATIONAL) {
            expect(typeof phrase).toBe('string');
            expect(phrase.length).toBeGreaterThan(0);
        }
    });
});

describe('toLocalDateKey', () => {
    it('formats date as YYYY-MM-DD with leading zeros', () => {
        expect(toLocalDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('handles two-digit month and day', () => {
        expect(toLocalDateKey(new Date(2026, 10, 25))).toBe('2026-11-25');
    });
});

describe('dateToKey', () => {
    it('returns empty string for null input', () => {
        expect(dateToKey(null)).toBe('');
    });

    it('keeps the input when it is already a YYYY-MM-DD string', () => {
        expect(dateToKey('2026-06-13')).toBe('2026-06-13');
    });

    it('converts a full ISO timestamp to local date key', () => {
        const key = dateToKey('2026-06-13T22:00:00Z');
        expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('parseLocalDateKey', () => {
    it('parses a YYYY-MM-DD key back to a local Date', () => {
        const d = parseLocalDateKey('2026-06-13');
        expect(d.getFullYear()).toBe(2026);
        expect(d.getMonth()).toBe(5);
        expect(d.getDate()).toBe(13);
    });
});

describe('isToday', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 14, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns true when the date is today', () => {
        expect(isToday('2026-06-13')).toBe(true);
    });

    it('returns false when the date is not today', () => {
        expect(isToday('2026-06-14')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isToday(null)).toBe(false);
    });
});

describe('isFuture', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 14, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns true for a future ISO timestamp', () => {
        expect(isFuture('2026-06-14T10:00:00Z')).toBe(true);
    });

    it('returns false for a past ISO timestamp', () => {
        expect(isFuture('2026-06-12T10:00:00Z')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isFuture(null)).toBe(false);
    });
});

describe('isOverdue', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 13, 14, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const baseTask: TaskResponse = {
        id: 't-1',
        companyId: 'c-1',
        companyName: 'Co',
        assignedToId: 'u-1',
        assignedToName: 'User',
        createdById: 'u-2',
        createdByName: 'Other',
        title: 'Test',
        description: null,
        category: 'OTHER',
        priority: null,
        status: 'TODO',
        startDate: null,
        startTime: null,
        endDate: '2026-06-10',
        endTime: null,
        completedAt: null,
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
    };

    it('returns true when endDate is before today and status is not DONE', () => {
        expect(isOverdue(baseTask)).toBe(true);
    });

    it('returns false when status is DONE regardless of endDate', () => {
        expect(isOverdue({ ...baseTask, status: 'DONE', endDate: '2026-06-10' })).toBe(false);
    });

    it('returns false when endDate is null', () => {
        expect(isOverdue({ ...baseTask, endDate: null })).toBe(false);
    });

    it('returns false when endDate is today or in the future', () => {
        expect(isOverdue({ ...baseTask, endDate: '2026-06-13' })).toBe(false);
        expect(isOverdue({ ...baseTask, endDate: '2026-06-15' })).toBe(false);
    });
});

describe('formatDateShort', () => {
    it('returns empty string for null', () => {
        expect(formatDateShort(null)).toBe('');
    });

    it('returns localized short date for a valid ISO string', () => {
        expect(formatDateShort('2026-06-13T10:00:00Z')).toBeTruthy();
        expect(formatDateShort('2026-06-13T10:00:00Z')).not.toBe('');
    });
});

describe('formatTime', () => {
    it('returns null for null input', () => {
        expect(formatTime(null)).toBeNull();
    });

    it('truncates seconds from a HH:mm:ss string', () => {
        expect(formatTime('14:30:00')).toBe('14:30');
    });

    it('keeps HH:mm as is', () => {
        expect(formatTime('09:05')).toBe('09:05');
    });
});
