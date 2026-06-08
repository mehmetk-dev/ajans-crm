import api from './client';

export interface PageSpeedScore {
    strategy: 'mobile' | 'desktop';
    testedUrl?: string;
    performance?: number | null;
    accessibility?: number | null;
    bestPractices?: number | null;
    seo?: number | null;
    lcpMs?: number | null;
    fidMs?: number | null;
    clsValue?: number | null;
    tbtMs?: number | null;
    fcpMs?: number | null;
    fetchedAt?: string;
    fetchError?: string | null;
}

export interface PageSpeedReport {
    websiteUrl?: string;
    configured: boolean;
    mobile?: PageSpeedScore;
    desktop?: PageSpeedScore;
    hostingProvider?: string | null;
    domainExpiry?: string | null;
    sslExpiry?: string | null;
    cmsType?: string | null;
    cmsVersion?: string | null;
    themeName?: string | null;
    analyticsConnected?: boolean;
    searchConsoleConnected?: boolean;
    gaPropertyId?: string | null;
    searchConsoleSiteUrl?: string | null;
}

export const webDesignApi = {
    // Client (own company)
    getMyPageSpeed: (refresh = false) =>
        api.get<PageSpeedReport>('/client/pagespeed', { params: { refresh } }).then(r => r.data),
    updateMyWebsite: (websiteUrl: string) =>
        api.put<PageSpeedReport>('/client/pagespeed/website', { websiteUrl }).then(r => r.data),

    // Staff/admin (any company)
    getCompanyPageSpeed: (companyId: string, refresh = false) =>
        api.get<PageSpeedReport>(`/staff/companies/${companyId}/pagespeed`, { params: { refresh } }).then(r => r.data),
};
