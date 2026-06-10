import api from '../../../api/client';
import type { PageResponse } from '../../../api/staff';
import type {
    ApprovalRequestResponse,
    ContentPlanResponse,
    ContentPlanScope,
    ContentStatus,
    CreateApprovalInput,
    CreateContentPlanInput,
    ReviewApprovalInput,
    UpdateContentPlanInput,
} from './contentPlan.types';

export const contentPlanApi = {
    list: (
        scope: ContentPlanScope,
        companyId: string,
        status?: ContentStatus,
        page = 0,
        size = 50,
    ) => {
        const url = scope === 'staff'
            ? `/staff/content-plans/company/${companyId}`
            : '/client/content-plans';
        return api.get<PageResponse<ContentPlanResponse>>(url, {
            params: { companyId: scope === 'client' ? companyId : undefined, status, page, size },
        }).then(response => response.data);
    },
    listAllStaff: (page = 0, size = 20) =>
        api.get<PageResponse<ContentPlanResponse>>('/staff/content-plans', {
            params: { page, size },
        }).then(response => response.data),
    get: (scope: ContentPlanScope, id: string) =>
        api.get<ContentPlanResponse>(`/${scope}/content-plans/${id}`)
            .then(response => response.data),
    create: (input: CreateContentPlanInput) =>
        api.post<ContentPlanResponse>('/staff/content-plans', input)
            .then(response => response.data),
    update: (id: string, input: UpdateContentPlanInput) =>
        api.put<ContentPlanResponse>(`/staff/content-plans/${id}`, input)
            .then(response => response.data),
    delete: (id: string) => api.delete(`/staff/content-plans/${id}`),
    requestRevision: (id: string, note: string) =>
        api.post<ContentPlanResponse>(`/client/content-plans/${id}/revision`, { note })
            .then(response => response.data),
    listLinkedToShoot: (scope: ContentPlanScope, shootId: string) =>
        api.get<ContentPlanResponse[]>(`/${scope}/content-plans/shoot/${shootId}`)
            .then(response => response.data),
};

export const approvalApi = {
    create: (input: CreateApprovalInput) =>
        api.post<ApprovalRequestResponse>('/client/approval-requests', input)
            .then(response => response.data),
    list: () =>
        api.get<ApprovalRequestResponse[]>('/staff/approval-requests')
            .then(response => response.data),
    listPending: () =>
        api.get<ApprovalRequestResponse[]>('/staff/approval-requests/pending')
            .then(response => response.data),
    countPending: () =>
        api.get<{ count: number }>('/staff/approval-requests/count')
            .then(response => response.data),
    approve: (id: string, input: ReviewApprovalInput = {}) =>
        api.post<ApprovalRequestResponse>(`/staff/approval-requests/${id}/approve`, input)
            .then(response => response.data),
    reject: (id: string, note?: string) =>
        api.post<ApprovalRequestResponse>(`/staff/approval-requests/${id}/reject`, { note })
            .then(response => response.data),
};
