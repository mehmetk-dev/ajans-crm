import { describe, expect, it } from 'vitest';
import {
    formatInstagramMetric,
    instagramEngagementRate,
    instagramGrowthRate,
} from '../model/instagram.utils';

describe('instagram.utils', () => {
    it('formats compact Instagram metrics', () => {
        expect(formatInstagramMetric(999)).toBe('999');
        expect(formatInstagramMetric(1_500)).toBe('1.5K');
        expect(formatInstagramMetric(2_500_000)).toBe('2.5M');
    });

    it('calculates follower growth rate', () => {
        expect(instagramGrowthRate(1_000, 80, 20)).toBe(6);
        expect(instagramGrowthRate(0, 80, 20)).toBe(0);
    });

    it('calculates engagement rate', () => {
        expect(instagramEngagementRate(2_000, 150, 50)).toBe(10);
        expect(instagramEngagementRate(0, 150, 50)).toBe(0);
    });
});
