export const searchConsoleKeys = {
    all: ['client-sc'] as const,
    status: (companyId: string) =>
        [...searchConsoleKeys.all, 'status', companyId] as const,
    sites: (companyId: string) =>
        [...searchConsoleKeys.all, 'sites', companyId] as const,
    overview: (companyId: string, startDate?: string, endDate?: string) =>
        startDate || endDate
            ? [...searchConsoleKeys.all, companyId, startDate, endDate] as const
            : [...searchConsoleKeys.all, companyId] as const,
};
