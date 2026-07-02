import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { taskKeys } from '../api/taskKeys';
import type { CreateTaskInput, TaskStatus, UpdateTaskInput } from '../api/task.types';

export function useStaffTasks(scope: 'all' | 'mine' = 'all', status?: TaskStatus, size = 100) {
    return useQuery({
        queryKey: taskKeys.staffList(scope, status),
        queryFn: () => scope === 'mine'
            ? taskApi.listMine(0, size)
            : taskApi.listAll(0, size, status),
    });
}

export function useClientTasks(status?: TaskStatus, size = 100) {
    return useQuery({
        queryKey: taskKeys.clientList(status),
        queryFn: () => taskApi.listClient(0, size, status),
    });
}

export function useAssignableUsers(companyId?: string, mode: 'staff' | 'client' = 'staff') {
    return useQuery({
        queryKey: taskKeys.assignableUsers(companyId, mode),
        queryFn: () => taskApi.listAssignableUsers(companyId, mode),
    });
}

export function useNotificationRecipients(companyId?: string, mode: 'staff' | 'client' = 'staff') {
    return useQuery({
        queryKey: taskKeys.notificationRecipients(companyId, mode),
        queryFn: () => taskApi.listNotificationRecipients(companyId, mode),
        enabled: mode === 'staff' || Boolean(companyId),
    });
}

export function useCreateTask(mode: 'staff' | 'client' = 'staff') {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateTaskInput) => taskApi.create(input, mode),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => taskApi.update(id, input),
        onSuccess: task => {
            queryClient.setQueryData(taskKeys.detail(task.id), task);
            queryClient.invalidateQueries({ queryKey: taskKeys.staffLists() });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: taskApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.staffLists() }),
    });
}

export function useTaskNotes(taskId?: string) {
    return useQuery({
        queryKey: taskKeys.notes(taskId ?? ''),
        queryFn: () => taskApi.listNotes(taskId!),
        enabled: Boolean(taskId),
    });
}
