import type { TaskStatus } from './task.types';

export const taskKeys = {
    all: ['tasks'] as const,
    staffLists: () => [...taskKeys.all, 'staff', 'list'] as const,
    staffList: (scope: 'all' | 'mine', status?: TaskStatus) =>
        [...taskKeys.staffLists(), scope, status ?? 'ALL'] as const,
    detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
    notes: (id: string) => [...taskKeys.detail(id), 'notes'] as const,
    assignableUsers: (companyId?: string, mode: 'staff' | 'client' = 'staff') =>
        [...taskKeys.all, 'assignable-users', mode, companyId ?? 'ALL'] as const,
    notificationRecipients: (companyId?: string, mode: 'staff' | 'client' = 'staff') =>
        [...taskKeys.all, 'notification-recipients', mode, companyId ?? 'ALL'] as const,
    clientCreatePermission: (companyId: string) =>
        [...taskKeys.all, 'client', 'can-create', companyId] as const,
    clientList: (status?: TaskStatus) =>
        [...taskKeys.all, 'client', 'list', status ?? 'ALL'] as const,
    reviews: (taskId: string) => [...taskKeys.detail(taskId), 'reviews'] as const,
    reviewsBatch: (taskIds: string[]) =>
        [...taskKeys.all, 'client', 'reviews-batch', taskIds.join(',')] as const,
};
