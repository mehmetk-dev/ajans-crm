import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shootApi } from '../api/shootApi';
import { shootKeys } from '../api/shootKeys';
import type { CreateShootInput, ShootScope, ShootStatus } from '../api/shoot.types';

export function useStaffShoots(page = 0, size = 50, companyId?: string, enabled = true) {
    return useQuery({
        queryKey: shootKeys.list('staff', page, size, companyId),
        queryFn: () => companyId
            ? shootApi.listStaffByCompany(companyId, page, size)
            : shootApi.listStaff(page, size),
        enabled,
    });
}

export function useClientShoots(page = 0, size = 50, enabled = true) {
    return useQuery({
        queryKey: shootKeys.list('client', page, size),
        queryFn: () => shootApi.listClient(page, size),
        enabled,
    });
}

export function useShootDetail(scope: ShootScope, shootId?: string) {
    return useQuery({
        queryKey: shootKeys.detail(scope, shootId ?? ''),
        queryFn: () => scope === 'staff'
            ? shootApi.getStaff(shootId!)
            : shootApi.getClient(shootId!),
        enabled: Boolean(shootId),
    });
}

export function useLinkedShootContent(scope: ShootScope, shootId?: string) {
    return useQuery({
        queryKey: shootKeys.linkedContent(scope, shootId ?? ''),
        queryFn: () => shootApi.listLinkedContent(scope, shootId!),
        enabled: Boolean(shootId),
    });
}

export function useCreateShoot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateShootInput) => shootApi.create(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: shootKeys.lists() }),
    });
}

export function useUpdateShootStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: ShootStatus }) =>
            shootApi.updateStatus(id, status),
        onSuccess: shoot => {
            queryClient.setQueryData(shootKeys.detail('staff', shoot.id), shoot);
            queryClient.invalidateQueries({ queryKey: shootKeys.lists() });
        },
    });
}

export function useDeleteShoot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: shootApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: shootKeys.lists() }),
    });
}
