import api from './client';

export interface DashboardStats {
    totalCompanies: number;
    activeCompanies: number;
    totalStaff: number;
    totalTasks: number;
    todoTasks: number;
    inProgressTasks: number;
    doneTasks: number;
}

export interface UserCompanyInfo {
    companyId: string;
    companyName: string;
    membershipRole: string;
}

export interface AllUserResponse {
    id: string;
    fullName: string;
    email: string;
    globalRole: string;
    membershipRole: string | null;
    avatarUrl: string | null;
    phone: string | null;
    position: string | null;
    department: string | null;
    companies: UserCompanyInfo[];
    createdAt: string;
}

export const adminApi = {
    getStats: () => api.get<DashboardStats>('/admin/dashboard/stats').then(r => r.data),

    // Users
    getAllUsers: () => api.get<AllUserResponse[]>('/admin/users').then(r => r.data),
    updateUserRole: (userId: string, globalRole: string) =>
        api.put(`/admin/users/${userId}/role`, { globalRole }).then(r => r.data),
    deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

    // Routines
    getRoutines: (page = 0, size = 50) =>
        api.get<PageResponse<AdminRoutineResponse>>(`/admin/routines?page=${page}&size=${size}`).then(r => r.data),
    getRoutine: (id: string) =>
        api.get<AdminRoutineResponse>(`/admin/routines/${id}`).then(r => r.data),
    createRoutine: (data: CreateRoutineRequest) =>
        api.post<AdminRoutineResponse>('/admin/routines', data).then(r => r.data),
    updateRoutine: (id: string, data: UpdateRoutineRequest) =>
        api.put<AdminRoutineResponse>(`/admin/routines/${id}`, data).then(r => r.data),
    deleteRoutine: (id: string) =>
        api.delete(`/admin/routines/${id}`).then(r => r.data),

    // Company Services
    getCompanyServices: (companyId: string) =>
        api.get<CompanyServiceItem[]>(`/admin/companies/${companyId}/services`).then(r => r.data),
    toggleCompanyService: (companyId: string, category: string, active: boolean) =>
        api.put<CompanyServiceItem>(`/admin/companies/${companyId}/services/${category}/toggle`, { active }).then(r => r.data),
};

export interface CompanyServiceItem {
    id: string | null;
    category: string;
    active: boolean;
}


// --- Routine Types ---
export interface AdminRoutineResponse {
    id: string;
    title: string;
    description: string | null;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    executionTime: string | null;
    assignedToId: string | null;
    assignedToName: string;
    category: string;
    isActive: boolean;
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoutineRequest {
    title: string;
    description?: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dayOfWeek?: number;
    dayOfMonth?: number;
    executionTime?: string;
    assignedToId?: string;
    category?: string;
}

export interface UpdateRoutineRequest {
    title?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    dayOfWeek?: number;
    dayOfMonth?: number;
    executionTime?: string;
    assignedToId?: string;
    category?: string;
    isActive?: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
