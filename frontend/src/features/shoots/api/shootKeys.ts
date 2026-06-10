import type { ShootScope } from './shoot.types';

export const shootKeys = {
    all: ['shoots'] as const,
    lists: () => [...shootKeys.all, 'list'] as const,
    list: (scope: ShootScope, page = 0, size = 50, companyId?: string) =>
        [...shootKeys.lists(), scope, companyId ?? 'ALL', page, size] as const,
    detail: (scope: ShootScope, id: string) =>
        [...shootKeys.all, 'detail', scope, id] as const,
    linkedContent: (scope: ShootScope, id: string) =>
        [...shootKeys.detail(scope, id), 'content'] as const,
};
