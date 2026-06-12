export const googleAdsKeys = {
    all: ['google-ads'] as const,
    status: (companyId: string) =>
        [...googleAdsKeys.all, 'status', companyId] as const,
    overview: (companyId: string, startDate?: string, endDate?: string) =>
        [...googleAdsKeys.all, 'overview', companyId, startDate, endDate] as const,
};
