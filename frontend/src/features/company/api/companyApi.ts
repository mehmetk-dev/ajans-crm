import api from '../../../api/client';
import type {
    AddEmployeeInput,
    CompanyInfrastructureInput,
    CompanyResponse,
    CreateCompanyInput,
    CreateStaffInput,
    PermissionResponse,
    StaffResponse,
    TeamResponse,
    UpdateCompanyInput,
    UpdatePermissionInput,
} from './company.types';

export const companyApi = {
    listAdmin: () => api.get<CompanyResponse[]>('/admin/companies').then(response => response.data),
    getAdmin: (companyId: string) =>
        api.get<CompanyResponse>(`/admin/companies/${companyId}`).then(response => response.data),
    create: (input: CreateCompanyInput) =>
        api.post<CompanyResponse>('/admin/companies', input).then(response => response.data),
    update: (companyId: string, input: UpdateCompanyInput) =>
        api.put<CompanyResponse>(`/admin/companies/${companyId}`, input).then(response => response.data),
    updateInfrastructure: (companyId: string, input: CompanyInfrastructureInput) =>
        api.put<CompanyResponse>(`/admin/companies/${companyId}/infrastructure`, input)
            .then(response => response.data),
    delete: (companyId: string) => api.delete<void>(`/admin/companies/${companyId}`),

    listStaffAccessible: () =>
        api.get<CompanyResponse[]>('/staff/companies').then(response => response.data),
    getStaffAccessible: (companyId: string) =>
        api.get<CompanyResponse>(`/staff/companies/${companyId}`).then(response => response.data),

    addEmployee: (companyId: string, input: AddEmployeeInput) =>
        api.post(`/admin/companies/${companyId}/employees`, input).then(response => response.data),
    removeEmployee: (companyId: string, userId: string) =>
        api.delete<void>(`/admin/companies/${companyId}/employees/${userId}`),

    listStaff: () => api.get<StaffResponse[]>('/admin/staff').then(response => response.data),
    getStaff: (staffId: string) =>
        api.get<StaffResponse>(`/admin/staff/${staffId}`).then(response => response.data),
    createStaff: (input: CreateStaffInput) =>
        api.post<StaffResponse>('/admin/staff', input).then(response => response.data),
    deleteStaff: (staffId: string) => api.delete<void>(`/admin/staff/${staffId}`),
    assignStaff: (staffId: string, companyId: string) =>
        api.post(`/admin/staff/${staffId}/assign/${companyId}`).then(response => response.data),
    unassignStaff: (membershipId: string) =>
        api.delete<void>(`/admin/staff/membership/${membershipId}`),

    getPermissions: (userId: string, companyId: string) =>
        api.get<PermissionResponse[]>('/admin/permissions', { params: { userId, companyId } })
            .then(response => response.data),
    updatePermission: (input: UpdatePermissionInput) =>
        api.put<PermissionResponse>('/admin/permissions', input).then(response => response.data),
    getPermissionKeys: () =>
        api.get<string[]>('/admin/permissions/keys').then(response => response.data),
    setDefaultPermissions: (userId: string, companyId: string, role: string) =>
        api.post('/admin/permissions/defaults', undefined, { params: { userId, companyId, role } })
            .then(response => response.data),

    getMyTeam: () => api.get<TeamResponse>('/client/team').then(response => response.data),
};
