import type { TaskStatus } from './task.types';

export const taskKeys = {
    all: ['tasks'] as const,
    staffLists: () => [...taskKeys.all, 'staff', 'list'] as const,
    staffList: (scope: 'all' | 'mine', status?: TaskStatus) =>
        [...taskKeys.staffLists(), scope, status ?? 'ALL'] as const,
    detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
    notes: (id: string) => [...taskKeys.detail(id), 'notes'] as const,
    assignableUsers: (companyId?: string) =>
        [...taskKeys.all, 'assignable-users', companyId ?? 'ALL'] as const,
    clientList: (status?: TaskStatus) =>
        [...taskKeys.all, 'client', 'list', status ?? 'ALL'] as const,
    reviews: (taskId: string) => [...taskKeys.detail(taskId), 'reviews'] as const,
};
