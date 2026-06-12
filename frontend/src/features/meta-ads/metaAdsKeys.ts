export const metaAdsKeys = {
    all: ['meta-ads'] as const,
    status: (companyId: string) =>
        [...metaAdsKeys.all, 'status', companyId] as const,
    overview: (
        companyId: string,
        startDate?: string,
        endDate?: string,
    ) => [...metaAdsKeys.all, 'overview', companyId, startDate, endDate] as const,
};
