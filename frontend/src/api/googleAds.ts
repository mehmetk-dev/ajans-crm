import api from './client';

export interface GoogleAdsCampaignRow {
    campaignId: string;
    campaignName: string;
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
}

export interface GoogleAdsDailyRow {
    date: string;
    spend: number;
    clicks: number;
    impressions: number;
}

export interface GoogleAdsOverviewResponse {
    connected: boolean;
    hasAdsScope: boolean;
    customerId: string | null;
    errorMessage: string | null;
    totalSpend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    conversionRate: number;
    campaigns: GoogleAdsCampaignRow[];
    dailyTrend: GoogleAdsDailyRow[];
}

export interface GoogleAdsStatusResponse {
    connected: boolean;
    hasAdsScope: boolean;
    customerId: string;
    authUrl: string;
}

export const googleAdsApi = {
    getStatus: (companyId: string) =>
        api.get<GoogleAdsStatusResponse>('/client/analytics/google-ads/status', {
            params: { companyId }
        }).then(r => r.data),

    getOverview: (companyId: string, startDate?: string, endDate?: string) =>
        api.get<GoogleAdsOverviewResponse>('/client/analytics/google-ads/overview', {
            params: { companyId, startDate, endDate }
        }).then(r => r.data),

    saveCustomerId: (companyId: string, customerId: string) =>
        api.post('/client/analytics/google-ads/customer-id', { customerId }, {
            params: { companyId }
        }).then(r => r.data),

    disconnect: (companyId: string) =>
        api.delete('/client/analytics/google-ads/disconnect', {
            params: { companyId }
        }).then(r => r.data),
};
