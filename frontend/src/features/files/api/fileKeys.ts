export const fileKeys = {
    all: ['files'] as const,
    companyMedia: (companyId: string, filter: string, page: number) =>
        ['files', 'company-media', companyId, filter, page] as const,
    companyMediaCounts: () => ['files', 'company-media-counts'] as const,
    byEntity: (entityType: string, entityId: string) =>
        ['files', 'entity', entityType, entityId] as const,
};
