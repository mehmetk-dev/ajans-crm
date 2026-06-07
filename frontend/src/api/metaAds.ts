import api from './client';

export interface MetaAdsCampaignRow {
    campaignId: string;
    campaignName: string;
    status: string;
    objective: string;
    spend: number;
    impressions: number;
    clicks: number;
    reach: number;
    cpm: number;
    cpc: number;
    ctr: number;
}

export interface MetaAdsDailyRow {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
}

export interface MetaAdsOverviewResponse {
    connected: boolean;
    adAccountId: string | null;
    adAccountName: string | null;
    errorMessage: string | null;
    totalSpend: number;
    impressions: number;
    clicks: number;
    reach: number;
    cpm: number;
    cpc: number;
    ctr: number;
    campaigns: MetaAdsCampaignRow[];
    dailyTrend: MetaAdsDailyRow[];
}

export interface MetaAdsStatusResponse {
    connected: boolean;
    adAccountId: string;
    authUrl: string;
}

export const metaAdsApi = {
    getStatus: (companyId: string) =>
        api.get<MetaAdsStatusResponse>('/client/analytics/meta-ads/status', {
            params: { companyId }
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
