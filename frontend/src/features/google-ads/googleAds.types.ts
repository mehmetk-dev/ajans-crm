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
    currencyCode: string;
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
    needsReconnect: boolean;
    customerId: string;
    authUrl: string;
}

export type GoogleAdsSortColumn =
    'spend' | 'clicks' | 'impressions' | 'conversions';
