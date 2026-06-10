import api from '../../../api/client';
import type { ContentPlanResponse } from '../../content-plans/api/contentPlan.types';
import type {
    CreateShootInput,
    PageResponse,
    ShootResponse,
    ShootScope,
    ShootStatus,
} from './shoot.types';

export const shootApi = {
    listStaff: (page = 0, size = 20) =>
        api.get<PageResponse<ShootResponse>>('/staff/shoots', { params: { page, size } })
            .then(response => response.data),

    listStaffByCompany: (companyId: string, page = 0, size = 20) =>
        api.get<PageResponse<ShootResponse>>(`/staff/shoots/company/${companyId}`, { params: { page, size } })
            .then(response => response.data),

    getStaff: (id: string) =>
        api.get<ShootResponse>(`/staff/shoots/${id}`).then(response => response.data),

    create: (input: CreateShootInput) =>
        api.post<ShootResponse>('/staff/shoots', input).then(response => response.data),

    updateStatus: (id: string, status: ShootStatus) =>
        api.put<ShootResponse>(`/staff/shoots/${id}/status`, undefined, { params: { status } })
            .then(response => response.data),

    delete: (id: string) =>
        api.delete(`/staff/shoots/${id}`).then(response => response.data),

    listClient: (page = 0, size = 20) =>
        api.get<PageResponse<ShootResponse>>('/client/shoots', {
            params: { page, size, sort: 'shootDate,desc' },
        }).then(response => response.data),

    getClient: (id: string) =>
        api.get<ShootResponse>(`/client/shoots/${id}`).then(response => response.data),

    listLinkedContent: (scope: ShootScope, shootId: string) =>
        api.get<ContentPlanResponse[]>(`/${scope}/content-plans/shoot/${shootId}`)
            .then(response => response.data),
};
