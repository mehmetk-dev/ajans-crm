import { describe, expect, it } from 'vitest';
import {
    ACTIVE_SERVICES_REFETCH_ON_WINDOW_FOCUS,
    ACTIVE_SERVICES_STALE_TIME,
} from './useActiveServices';

describe('useActiveServices cache policy', () => {
    it('keeps client service flags fresh enough without refetching on every focus', () => {
        expect(ACTIVE_SERVICES_STALE_TIME).toBe(5 * 60_000);
        expect(ACTIVE_SERVICES_REFETCH_ON_WINDOW_FOCUS).toBe(false);
    });
});
