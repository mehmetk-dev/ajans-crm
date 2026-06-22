export const CONTENT_PLAN_FULL_PAGE_SIZE = 200;

export function getContentPlanPageSize(limit?: number, showAll = false) {
    if (!limit || showAll) return CONTENT_PLAN_FULL_PAGE_SIZE;
    return limit + 1;
}

export function getContentPlanHiddenCount(
    totalElements: number | undefined,
    limit: number | undefined,
    loadedCount: number,
) {
    if (!limit) return 0;
    const total = totalElements ?? loadedCount;
    return Math.max(total - limit, 0);
}
