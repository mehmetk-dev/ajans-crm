import api from '../../../api/client';
import type {
    GoogleAdsOverviewResponse,
    GoogleAdsStatusResponse,
    GoogleAdsAccountListResponse,
    GoogleAdsAccountOption,
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

    getAccounts: (companyId: string) =>
        api.get<GoogleAdsAccountListResponse>('/client/analytics/google-ads/accounts', {
            params: { companyId },
        }).then(response => response.data),

    selectAccount: (companyId: string, account: Pick<GoogleAdsAccountOption, 'customerId' | 'loginCustomerId'>) =>
        api.post('/client/analytics/google-ads/account-selection', account, {
            params: { companyId },
        }).then(response => response.data),

    disconnect: (companyId: string) =>
        api.delete('/client/analytics/google-ads/disconnect', {
            params: { companyId },
        }).then(response => response.data),
};
