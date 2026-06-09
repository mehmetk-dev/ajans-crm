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

export function useAssignableUsers(companyId?: string) {
    return useQuery({
        queryKey: taskKeys.assignableUsers(companyId),
        queryFn: () => taskApi.listAssignableUsers(companyId),
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateTaskInput) => taskApi.create(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.staffLists() }),
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
