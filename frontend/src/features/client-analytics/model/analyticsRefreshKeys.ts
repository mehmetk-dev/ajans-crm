type QueryKey = readonly unknown[];

function uniqueKeys(keys: QueryKey[]) {
    const unique = new Map<string, QueryKey>();
    for (const key of keys) {
        unique.set(JSON.stringify(key), key);
    }
    return Array.from(unique.values());
}

export function clientAnalyticsRefreshKeys(companyId: string) {
    return uniqueKeys([
        ['active-services', companyId],
        ['webDesign'],
        ['webDesign', 'report', 'me'],
        ['webDesign', 'report', companyId],
        ['client-ig-status', companyId],
        ['client-ig', companyId],
        ['client-ig-reels', companyId],
        ['client-ig-posts', companyId],
        ['content-plans', 'list'],
        ['shoots', 'list', 'client', 'ALL', 0, 50],
        ['client-sc'],
        ['google-analytics'],
        ['google-ads', 'overview', companyId, undefined, undefined],
        ['meta-ads', 'overview', companyId, undefined, undefined],
        ['maintenance-log', 'mine'],
    ]);
}
