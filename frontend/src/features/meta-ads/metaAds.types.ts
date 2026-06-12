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

export type MetaAdsSortColumn =
    'spend' | 'clicks' | 'impressions' | 'reach';
