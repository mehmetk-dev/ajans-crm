import api from '../../../api/client';
import type {
    CreatePrProjectInput,
    PageResponse,
    PrProjectResponse,
    UpdatePrProjectInput,
} from './prProject.types';

export const prProjectApi = {
    list: (page = 0, size = 20) =>
        api.get<PageResponse<PrProjectResponse>>('/staff/pr-projects', {
            params: { page, size },
        }).then(response => response.data),

    listByCompany: (companyId: string, page = 0, size = 20) =>
        api.get<PageResponse<PrProjectResponse>>(
            `/staff/pr-projects/company/${companyId}`,
            { params: { page, size } },
        ).then(response => response.data),

    get: (id: string) =>
        api.get<PrProjectResponse>(`/staff/pr-projects/${id}`)
            .then(response => response.data),

    create: (input: CreatePrProjectInput) =>
        api.post<PrProjectResponse>('/staff/pr-projects', input)
            .then(response => response.data),

    update: (id: string, input: UpdatePrProjectInput) =>
        api.put<PrProjectResponse>(`/staff/pr-projects/${id}`, input)
            .then(response => response.data),

    completePhase: (projectId: string, phaseId: string) =>
        api.post<PrProjectResponse>(
            `/staff/pr-projects/${projectId}/phases/${phaseId}/complete`,
        ).then(response => response.data),

    addPhaseNote: (projectId: string, phaseId: string, content: string) =>
        api.post<PrProjectResponse>(
            `/staff/pr-projects/${projectId}/phases/${phaseId}/notes`,
            { content },
        ).then(response => response.data),

    delete: (id: string) =>
        api.delete(`/staff/pr-projects/${id}`).then(response => response.data),
};
