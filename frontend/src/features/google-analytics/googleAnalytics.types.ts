export interface GaDailyRow {
    date: string;
    sessions: number;
    users: number;
}

export interface GaNamedMetric {
    name: string;
    value: number;
}

export interface GaOverviewResponse {
    connected: boolean;
    propertyId: string | null;
    errorMessage: string | null;
    sessions: number;
    totalUsers: number;
    newUsers: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    dailyTrend: GaDailyRow[];
    trafficSources: GaNamedMetric[];
    topPages: GaNamedMetric[];
    topCountries: GaNamedMetric[];
}

export interface GaStatusResponse {
    connected: boolean;
    propertyId: string;
    authUrl: string;
}

export interface DatePreset {
    label: string;
    start: string;
    end: string;
    desc: string;
}

export interface SourcePieEntry {
    name: string;
    value: number;
    color: string;
}

export interface CountryBarEntry {
    name: string;
    value: number;
    fill: string;
}
