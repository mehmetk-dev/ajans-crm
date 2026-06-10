import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileApi } from '../api/fileApi';
import { fileKeys } from '../api/fileKeys';

export function useCompanyMedia(companyId: string | undefined, filter: string, page: number) {
    return useQuery({
        queryKey: fileKeys.companyMedia(companyId ?? '', filter, page),
        queryFn: () => fileApi.getCompanyMedia(companyId!, page, 24, filter || undefined),
        enabled: !!companyId,
    });
}

export function useCompanyMediaCounts() {
    return useQuery({
        queryKey: fileKeys.companyMediaCounts(),
        queryFn: fileApi.getCompanyMediaCounts,
    });
}

export function useFilesByEntity(entityType: string, entityId: string | undefined) {
    return useQuery({
        queryKey: fileKeys.byEntity(entityType, entityId ?? ''),
        queryFn: () => fileApi.getByEntity(entityType, entityId!),
        enabled: !!entityId,
    });
}

export function useDeleteFile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => fileApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        },
    });
}
