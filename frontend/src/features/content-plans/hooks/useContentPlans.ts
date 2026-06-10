import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalApi, contentPlanApi } from '../api/contentPlanApi';
import { approvalKeys, contentPlanKeys } from '../api/contentPlanKeys';
import type {
    ContentApprovalDetails,
    ContentPlanScope,
    ContentStatus,
    CreateContentPlanInput,
    ReviewApprovalInput,
    UpdateContentPlanInput,
} from '../api/contentPlan.types';
import { encodeContentApprovalMetadata } from '../model/approvalMetadata';

export function useContentPlans(
    scope: ContentPlanScope,
    companyId: string,
    status?: ContentStatus,
    page = 0,
    size = 50,
) {
    return useQuery({
        queryKey: contentPlanKeys.list(scope, companyId, status, page, size),
        queryFn: () => contentPlanApi.list(scope, companyId, status, page, size),
        enabled: Boolean(companyId),
    });
}

export function useCreateContentPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateContentPlanInput) => contentPlanApi.create(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: contentPlanKeys.lists() }),
    });
}

export function useUpdateContentPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateContentPlanInput }) =>
            contentPlanApi.update(id, input),
        onSuccess: plan => {
            queryClient.setQueryData(contentPlanKeys.detail('staff', plan.id), plan);
            queryClient.invalidateQueries({ queryKey: contentPlanKeys.lists() });
        },
    });
}

export function useDeleteContentPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: contentPlanApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: contentPlanKeys.lists() }),
    });
}

export function useRequestContentRevision() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }: { id: string; note: string }) =>
            contentPlanApi.requestRevision(id, note),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: contentPlanKeys.lists() }),
    });
}

export function useSubmitContentApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            planId,
            companyId,
            planTitle,
            details,
        }: {
            planId: string;
            companyId: string;
            planTitle: string;
            details: ContentApprovalDetails;
        }) => approvalApi.create({
            type: 'CONTENT_APPROVAL',
            referenceId: planId,
            companyId,
            title: `İçerik Onayı: ${planTitle}`,
            description: details.existingShootId
                ? 'Mevcut bir çekime bağlanması talep edildi'
                : 'Yeni çekim oluşturulması talep edildi',
            metadata: encodeContentApprovalMetadata(details),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contentPlanKeys.lists() });
            queryClient.invalidateQueries({ queryKey: approvalKeys.all });
        },
    });
}

export function useApprovalRequests() {
    return useQuery({
        queryKey: approvalKeys.list(),
        queryFn: approvalApi.list,
    });
}

export function usePendingApprovalCount() {
    return useQuery({
        queryKey: approvalKeys.count(),
        queryFn: approvalApi.countPending,
        refetchInterval: 30_000,
    });
}

export function useReviewApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input?: ReviewApprovalInput }) =>
            approvalApi.approve(id, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: approvalKeys.all }),
    });
}

export function useRejectApproval() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, note }: { id: string; note?: string }) =>
            approvalApi.reject(id, note),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: approvalKeys.all }),
    });
}
