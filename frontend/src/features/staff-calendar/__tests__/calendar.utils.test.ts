import { describe, it, expect } from 'vitest';
import {
    formatDateKey,
    getMonthDays,
    dateRange,
    isDateInRange,
    getSelection,
    selectionLabel,
} from '../model/calendar.utils';
import {
    indexTasks,
    collectAgenda,
} from '../model/calendar.index';

describe('formatDateKey', () => {
    it('formats a date to YYYY-MM-DD', () => {
        expect(formatDateKey(new Date(2026, 5, 12))).toBe('2026-06-12');
    });

    it('pads month and day to two digits', () => {
        expect(formatDateKey(new Date(2026, 0, 3))).toBe('2026-01-03');
    });
});

describe('getMonthDays', () => {
    it('returns complete grid for June 2026', () => {
        const days = getMonthDays(2026, 5);
        expect(days.length % 7).toBe(0);
        expect(days.filter(d => d.currentMonth).length).toBe(30);
    });

    it('starts with previous month days before Monday', () => {
        const days = getMonthDays(2026, 1);
        expect(days[0].currentMonth).toBe(false);
    });

    it('fills leading days from previous month for February 2026', () => {
        const days = getMonthDays(2026, 1);
        expect(days[0].currentMonth).toBe(false);
        expect(days.filter(d => d.currentMonth).length).toBe(28);
    });

    it('marks days inside the month as currentMonth', () => {
        const days = getMonthDays(2026, 0);
        const janDays = days.filter(d => d.currentMonth);
        expect(janDays.length).toBe(31);
    });
});

describe('dateRange', () => {
    it('generates keys for each day in range', () => {
        const keys = dateRange('2026-06-10', '2026-06-12');
        expect(keys).toEqual(['2026-06-10', '2026-06-11', '2026-06-12']);
    });
});

describe('isDateInRange', () => {
    it('returns true for key inside range', () => {
        expect(isDateInRange('2026-06-11', '2026-06-10', '2026-06-12')).toBe(true);
    });

    it('returns false for key outside range', () => {
        expect(isDateInRange('2026-06-13', '2026-06-10', '2026-06-12')).toBe(false);
    });
});

describe('getSelection', () => {
    const today = new Date(2026, 5, 12);

    it('returns single day range for selectedDate', () => {
        expect(getSelection('2026-06-10', 'none', today)).toEqual(['2026-06-10', '2026-06-10']);
    });

    it('returns today range for today filter', () => {
        expect(getSelection(null, 'today', today)).toEqual(['2026-06-12', '2026-06-12']);
    });

    it('returns null for none filter', () => {
        expect(getSelection(null, 'none', today)).toBeNull();
    });
});

describe('selectionLabel', () => {
    it('returns today label for today filter', () => {
        expect(selectionLabel(null, 'today')).toBe('Bugün');
    });

    it('returns week label for week filter', () => {
        expect(selectionLabel(null, 'week')).toBe('Bu Hafta');
    });

    it('returns month label for month filter', () => {
        expect(selectionLabel(null, 'month')).toBe('Bu Ay');
    });
});

describe('indexTasks', () => {
    it('indexes tasks by start date', () => {
        const result = indexTasks([
            { id: '1', startDate: '2026-06-10', endDate: '2026-06-10', title: 'Test' } as any,
        ]);
        expect(result['2026-06-10']).toHaveLength(1);
    });

    it('indexes tasks across date range', () => {
        const result = indexTasks([
            { id: '1', startDate: '2026-06-10', endDate: '2026-06-12', title: 'Test' } as any,
        ]);
        expect(result['2026-06-10']).toHaveLength(1);
        expect(result['2026-06-11']).toHaveLength(1);
        expect(result['2026-06-12']).toHaveLength(1);
    });

    it('skips tasks without dates', () => {
        const result = indexTasks([
            { id: '1', startDate: null, endDate: null } as any,
        ]);
        expect(Object.keys(result)).toHaveLength(0);
    });
});

describe('collectAgenda', () => {
    it('returns empty arrays for null range', () => {
        const result = collectAgenda({ tasks: {}, meetings: {}, shoots: {} }, null);
        expect(result).toEqual({ tasks: [], meetings: [], shoots: [] });
    });
});