import { describe, expect, it } from 'vitest';
import { getNotificationRoute } from './notificationRoutes';

describe('getNotificationRoute', () => {
    it('routes approval request notifications to the requests screen', () => {
        const notification = {
            referenceType: 'APPROVAL_REQUEST',
            referenceId: 'request-1',
        };

        expect(getNotificationRoute('admin', notification)).toBe('/admin/requests');
        expect(getNotificationRoute('staff', notification)).toBe('/staff/requests');
        expect(getNotificationRoute('client', notification)).toBe('/client/services');
    });
});
