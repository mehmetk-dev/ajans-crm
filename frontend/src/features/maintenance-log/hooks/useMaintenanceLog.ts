import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceLogApi } from '../api/maintenanceLogApi';
import { maintenanceLogKeys } from '../api/maintenanceLogKeys';
import type { MaintenanceLogInput } from '../api/maintenanceLog.types';

export function useMaintenanceLog(companyId?: string) {
    return useQuery({
        queryKey: companyId ? maintenanceLogKeys.company(companyId) : maintenanceLogKeys.mine(),
        queryFn: () => companyId
            ? maintenanceLogApi.listCompany(companyId)
            : maintenanceLogApi.listMine(),
    });
}

export function useCreateMaintenanceLog(companyId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: MaintenanceLogInput) => maintenanceLogApi.create(companyId, input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: maintenanceLogKeys.company(companyId),
        }),
    });
}

export function useUpdateMaintenanceLog(companyId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ entryId, input }: { entryId: string; input: MaintenanceLogInput }) =>
            maintenanceLogApi.update(companyId, entryId, input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: maintenanceLogKeys.company(companyId),
        }),
    });
}

export function useDeleteMaintenanceLog(companyId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (entryId: string) => maintenanceLogApi.delete(companyId, entryId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: maintenanceLogKeys.company(companyId),
        }),
    });
}
