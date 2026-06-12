export interface ScDailyRow {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface ScQueryRow {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface ScPageRow {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

export interface ScNamedMetric {
    name: string;
    clicks: number;
    impressions: number;
}

export interface ScOverviewResponse {
    connected: boolean;
    siteUrl: string | null;
    errorMessage: string | null;
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    dailyTrend: ScDailyRow[];
    topQueries: ScQueryRow[];
    topPages: ScPageRow[];
    devices: ScNamedMetric[];
    countries: ScNamedMetric[];
}

export interface ScStatusResponse {
    connected: boolean;
    siteUrl: string;
    hasScScope: boolean;
    needsReconnect: boolean;
    authUrl: string;
}

export interface ScSite {
    siteUrl: string;
    permissionLevel: string;
}

export interface SearchConsoleDatePreset {
    label: string;
    start: string;
    end: string;
    desc: string;
}

export interface SearchConsolePieEntry {
    name: string;
    value: number;
    color: string;
}

export interface SearchConsoleBarEntry {
    name: string;
    value: number;
    fill: string;
}
