import { describe, expect, it } from 'vitest';
import {
    getContentPlanHiddenCount,
    getContentPlanPageSize,
} from './contentPlanPreview';

describe('contentPlanPreview', () => {
    it('requests only one extra record for limited previews', () => {
        expect(getContentPlanPageSize(5)).toBe(6);
        expect(getContentPlanPageSize(1)).toBe(2);
    });

    it('keeps the full panel page size when there is no preview limit', () => {
        expect(getContentPlanPageSize()).toBe(200);
        expect(getContentPlanPageSize(0)).toBe(200);
    });

    it('uses total elements to report hidden preview count', () => {
        expect(getContentPlanHiddenCount(12, 5, 6)).toBe(7);
        expect(getContentPlanHiddenCount(undefined, 5, 6)).toBe(1);
        expect(getContentPlanHiddenCount(4, 5, 4)).toBe(0);
    });
});
