export const analyticsKeys = {
    all: ['google-analytics'] as const,
    status: (companyId: string) =>
        [...analyticsKeys.all, 'status', companyId] as const,
    overview: (companyId: string, startDate?: string, endDate?: string) =>
        [...analyticsKeys.all, 'overview', companyId, startDate, endDate] as const,
};
