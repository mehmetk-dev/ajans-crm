import type { ContentPlanScope, ContentStatus } from './contentPlan.types';

export const contentPlanKeys = {
    all: ['content-plans'] as const,
    lists: () => [...contentPlanKeys.all, 'list'] as const,
    list: (
        scope: ContentPlanScope,
        companyId: string,
        status?: ContentStatus,
        page = 0,
        size = 50,
    ) => [...contentPlanKeys.lists(), scope, companyId, status ?? 'ALL', page, size] as const,
    details: () => [...contentPlanKeys.all, 'detail'] as const,
    detail: (scope: ContentPlanScope, id: string) =>
        [...contentPlanKeys.details(), scope, id] as const,
    linkedToShoot: (scope: ContentPlanScope, shootId: string) =>
        [...contentPlanKeys.all, 'shoot', scope, shootId] as const,
};

export const approvalKeys = {
    all: ['approval-requests'] as const,
    list: () => [...approvalKeys.all, 'list'] as const,
    pending: () => [...approvalKeys.all, 'pending'] as const,
    count: () => [...approvalKeys.all, 'count'] as const,
};
