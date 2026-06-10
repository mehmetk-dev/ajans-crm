import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prProjectApi } from '../api/prProjectApi';
import { prProjectKeys } from '../api/prProjectKeys';
import type { CreatePrProjectInput, UpdatePrProjectInput } from '../api/prProject.types';

export function usePrProjects(page = 0, size = 50, companyId?: string) {
    return useQuery({
        queryKey: prProjectKeys.list(page, size, companyId),
        queryFn: () => companyId
            ? prProjectApi.listByCompany(companyId, page, size)
            : prProjectApi.list(page, size),
    });
}

export function useCreatePrProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreatePrProjectInput) => prProjectApi.create(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: prProjectKeys.lists() }),
    });
}

export function useUpdatePrProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdatePrProjectInput }) =>
            prProjectApi.update(id, input),
        onSuccess: project => updateProjectCache(queryClient, project),
    });
}

export function useCompletePrPhase() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, phaseId }: { projectId: string; phaseId: string }) =>
            prProjectApi.completePhase(projectId, phaseId),
        onSuccess: project => updateProjectCache(queryClient, project),
    });
}

export function useAddPrPhaseNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            projectId,
            phaseId,
            content,
        }: {
            projectId: string;
            phaseId: string;
            content: string;
        }) => prProjectApi.addPhaseNote(projectId, phaseId, content),
        onSuccess: project => updateProjectCache(queryClient, project),
    });
}

export function useDeletePrProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: prProjectApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: prProjectKeys.lists() }),
    });
}

function updateProjectCache(
    queryClient: ReturnType<typeof useQueryClient>,
    project: Awaited<ReturnType<typeof prProjectApi.get>>,
) {
    queryClient.setQueryData(prProjectKeys.detail(project.id), project);
    queryClient.invalidateQueries({ queryKey: prProjectKeys.lists() });
}
