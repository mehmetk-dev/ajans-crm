import { describe, expect, it } from 'vitest';
import {
    averageScore,
    formatCls,
    formatMs,
    metricTone,
    normalizeInputUrl,
    scoreTone,
} from '../webDesign.utils';

describe('normalizeInputUrl', () => {
    it('returns empty string for empty input', () => {
        expect(normalizeInputUrl('')).toBe('');
        expect(normalizeInputUrl('  ')).toBe('');
    });

    it('does not add prefix if https:// already present', () => {
        expect(normalizeInputUrl('https://example.com')).toBe('https://example.com');
    });

    it('does not add prefix if http:// already present', () => {
        expect(normalizeInputUrl('http://example.com')).toBe('http://example.com');
    });

    it('adds https:// prefix for bare domain', () => {
        expect(normalizeInputUrl('example.com')).toBe('https://example.com');
    });
});

describe('scoreTone', () => {
    it('returns unknown for null', () => expect(scoreTone(null)).toBe('unknown'));
    it('returns good for score >= 90', () => expect(scoreTone(90)).toBe('good'));
    it('returns warning for score 50–89', () => expect(scoreTone(75)).toBe('warning'));
    it('returns bad for score < 50', () => expect(scoreTone(30)).toBe('bad'));
});

describe('metricTone - cls', () => {
    it('good for cls <= 0.1', () => expect(metricTone('cls', 0.05)).toBe('good'));
    it('warning for cls <= 0.25', () => expect(metricTone('cls', 0.2)).toBe('warning'));
    it('bad for cls > 0.25', () => expect(metricTone('cls', 0.5)).toBe('bad'));
});

describe('metricTone - lcp', () => {
    it('good for lcp <= 2500ms', () => expect(metricTone('lcp', 2000)).toBe('good'));
    it('warning for lcp <= 4000ms', () => expect(metricTone('lcp', 3000)).toBe('warning'));
    it('bad for lcp > 4000ms', () => expect(metricTone('lcp', 5000)).toBe('bad'));
});

describe('formatMs', () => {
    it('returns - for null', () => expect(formatMs(null)).toBe('-'));
    it('returns ms for < 1000', () => expect(formatMs(500)).toBe('500 ms'));
    it('returns sn for >= 1000', () => expect(formatMs(2500)).toBe('2.50 sn'));
});

describe('formatCls', () => {
    it('returns - for null', () => expect(formatCls(null)).toBe('-'));
    it('formats to 3 decimals', () => expect(formatCls(0.123456)).toBe('0.123'));
});

describe('averageScore', () => {
    it('returns null for undefined', () => expect(averageScore(undefined)).toBeNull());
    it('averages available scores', () => {
        expect(averageScore({ strategy: 'mobile', performance: 80, accessibility: 90, bestPractices: 70, seo: 60 }))
            .toBe(75);
    });
    it('ignores null scores', () => {
        expect(averageScore({ strategy: 'mobile', performance: 80, accessibility: null, bestPractices: null, seo: null }))
            .toBe(80);
    });
});
