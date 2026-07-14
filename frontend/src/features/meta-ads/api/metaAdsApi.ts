import api from '../../../api/client';
import type {
    MetaAdsOverviewResponse,
    MetaAdsStatusResponse,
} from '../metaAds.types';

export const metaAdsApi = {
    getStatus: (companyId: string, returnPath?: string) =>
        api.get<MetaAdsStatusResponse>('/client/analytics/meta-ads/status', {
            params: { companyId, returnPath }
        }).then(r => r.data),

    getOverview: (companyId: string, startDate?: string, endDate?: string) =>
        api.get<MetaAdsOverviewResponse>('/client/analytics/meta-ads/overview', {
            params: { companyId, startDate, endDate }
        }).then(r => r.data),

    saveAdAccount: (companyId: string, adAccountId: string) =>
        api.post('/client/analytics/meta-ads/ad-account', { adAccountId }, {
            params: { companyId }
        }).then(r => r.data),

    disconnect: (companyId: string) =>
        api.delete('/client/analytics/meta-ads/disconnect', {
            params: { companyId }
        }).then(r => r.data),
};
