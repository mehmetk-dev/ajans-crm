import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../api/companyApi';
import { companyKeys } from '../api/companyKeys';
import type { AddEmployeeInput, UpdatePermissionInput } from '../api/company.types';

export function useAdminCompanies() {
    return useQuery({
        queryKey: companyKeys.adminList(),
        queryFn: companyApi.listAdmin,
    });
}

export function useAdminCompany(companyId?: string) {
    return useQuery({
        queryKey: companyKeys.detail('admin', companyId ?? ''),
        queryFn: () => companyApi.getAdmin(companyId!),
        enabled: Boolean(companyId),
    });
}

export function useStaffCompanies() {
    return useQuery({
        queryKey: companyKeys.staffList(),
        queryFn: companyApi.listStaffAccessible,
    });
}

export function useStaffCompany(companyId?: string) {
    return useQuery({
        queryKey: companyKeys.detail('staff', companyId ?? ''),
        queryFn: () => companyApi.getStaffAccessible(companyId!),
        enabled: Boolean(companyId),
    });
}

export function useCompanyPermissions(companyId?: string, userId?: string) {
    return useQuery({
        queryKey: companyKeys.permissions(companyId ?? '', userId ?? ''),
        queryFn: () => companyApi.getPermissions(userId!, companyId!),
        enabled: Boolean(companyId && userId),
    });
}

export function useAddEmployee(companyId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: AddEmployeeInput) => companyApi.addEmployee(companyId, input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: companyKeys.detail('admin', companyId),
        }),
    });
}

export function useRemoveEmployee(companyId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => companyApi.removeEmployee(companyId, userId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: companyKeys.detail('admin', companyId),
        }),
    });
}

export function useUpdatePermission(companyId: string, userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: Omit<UpdatePermissionInput, 'companyId' | 'userId'>) =>
            companyApi.updatePermission({ ...input, companyId, userId }),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: companyKeys.permissions(companyId, userId),
        }),
    });
}

export function useMyTeam() {
    return useQuery({
        queryKey: companyKeys.team(),
        queryFn: companyApi.getMyTeam,
    });
}
