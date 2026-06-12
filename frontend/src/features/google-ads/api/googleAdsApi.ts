import api from '../../../api/client';
import type {
    GoogleAdsOverviewResponse,
    GoogleAdsStatusResponse,
} from '../googleAds.types';

export const googleAdsApi = {
    getStatus: (companyId: string) =>
        api.get<GoogleAdsStatusResponse>('/client/analytics/google-ads/status', {
            params: { companyId },
        }).then(response => response.data),

    getOverview: (companyId: string, startDate?: string, endDate?: string) =>
        api.get<GoogleAdsOverviewResponse>('/client/analytics/google-ads/overview', {
            params: { companyId, startDate, endDate },
        }).then(response => response.data),

    saveCustomerId: (companyId: string, customerId: string) =>
        api.post('/client/analytics/google-ads/customer-id', { customerId }, {
            params: { companyId },
        }).then(response => response.data),

    disconnect: (companyId: string) =>
        api.delete('/client/analytics/google-ads/disconnect', {
            params: { companyId },
        }).then(response => response.data),
};
