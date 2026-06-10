import { describe, expect, it } from 'vitest';
import { formatPrProjectDate, toOptional } from './prProject.utils';

describe('PR project helpers', () => {
    it('normalizes blank optional values', () => {
        expect(toOptional('   ')).toBeUndefined();
        expect(toOptional('  Plan  ')).toBe('Plan');
    });

    it('returns null for invalid dates', () => {
        expect(formatPrProjectDate('not-a-date')).toBeNull();
    });
});
