import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { timeAgo, formatMessageTime, getRoleLabel } from './messaging.utils';

describe('timeAgo', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns "şimdi" for < 1 minute ago', () => {
        vi.setSystemTime(new Date('2026-01-01T12:00:30Z'));
        expect(timeAgo('2026-01-01T12:00:00Z')).toBe('şimdi');
    });

    it('returns minutes for < 1 hour ago', () => {
        vi.setSystemTime(new Date('2026-01-01T12:45:00Z'));
        expect(timeAgo('2026-01-01T12:00:00Z')).toBe('45dk');
    });

    it('returns hours for < 1 day ago', () => {
        vi.setSystemTime(new Date('2026-01-01T15:00:00Z'));
        expect(timeAgo('2026-01-01T12:00:00Z')).toBe('3sa');
    });

    it('returns days for >= 1 day ago', () => {
        vi.setSystemTime(new Date('2026-01-03T12:00:00Z'));
        expect(timeAgo('2026-01-01T12:00:00Z')).toBe('2g');
    });
});

describe('getRoleLabel', () => {
    it('returns company + role label when companyName is provided', () => {
        expect(getRoleLabel('COMPANY_USER', 'OWNER', 'Acme')).toBe('Acme · Şirket Sahibi');
        expect(getRoleLabel('COMPANY_USER', 'EMPLOYEE', 'Acme')).toBe('Acme · Şirket Çalışanı');
        expect(getRoleLabel('AGENCY_STAFF', 'AGENCY_STAFF', 'Acme')).toBe('Acme · Ajans Çalışanı');
    });

    it('returns role label when no companyName', () => {
        expect(getRoleLabel('ADMIN', null, null)).toBe('Yönetici');
        expect(getRoleLabel('AGENCY_STAFF', null, null)).toBe('Ajans Çalışanı');
        expect(getRoleLabel('COMPANY_USER', null, null)).toBe('');
    });
});

describe('formatMessageTime', () => {
    it('returns HH:MM format', () => {
        // Test that it returns something matching HH:MM pattern
        const result = formatMessageTime('2026-01-01T14:30:00Z');
        expect(result).toMatch(/\d{2}:\d{2}/);
    });
});
