export const prProjectKeys = {
    all: ['pr-projects'] as const,
    lists: () => [...prProjectKeys.all, 'list'] as const,
    list: (page = 0, size = 50, companyId?: string) =>
        [...prProjectKeys.lists(), companyId ?? 'ALL', page, size] as const,
    details: () => [...prProjectKeys.all, 'detail'] as const,
    detail: (id: string) => [...prProjectKeys.details(), id] as const,
};
