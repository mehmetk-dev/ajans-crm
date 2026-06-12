import api from '../../../api/client';
import type { GaOverviewResponse, GaStatusResponse } from '../googleAnalytics.types';

export const googleAnalyticsApi = {
    getStatus: (companyId: string) =>
        api.get<GaStatusResponse>('/client/analytics/ga/status', {
            params: { companyId },
        }).then(r => r.data),

    getOverview: (companyId: string, startDate?: string, endDate?: string) =>
        api.get<GaOverviewResponse>('/client/analytics/ga/overview', {
            params: { companyId, startDate, endDate },
        }).then(r => r.data),

    saveProperty: (companyId: string, propertyId: string) =>
        api.post('/client/analytics/ga/property', { propertyId }, {
            params: { companyId },
        }).then(r => r.data),

    disconnect: (companyId: string) =>
        api.delete('/client/analytics/ga/disconnect', {
            params: { companyId },
        }).then(r => r.data),
};
