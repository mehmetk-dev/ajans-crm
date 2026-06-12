export const instagramKeys = {
    overviewRoot: ['client-ig'] as const,
    statusRoot: ['client-ig-status'] as const,
    reelsRoot: ['client-ig-reels'] as const,
    postsRoot: ['client-ig-posts'] as const,
    overview: (companyId: string) =>
        [...instagramKeys.overviewRoot, companyId] as const,
    overviewRange: (companyId: string, startDate: string, endDate: string) =>
        [...instagramKeys.overviewRoot, companyId, startDate, endDate] as const,
    status: (companyId: string) =>
        [...instagramKeys.statusRoot, companyId] as const,
    reels: (companyId: string) =>
        [...instagramKeys.reelsRoot, companyId] as const,
    posts: (companyId: string) =>
        [...instagramKeys.postsRoot, companyId] as const,
};
