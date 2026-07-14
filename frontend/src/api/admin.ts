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

export interface UpdateUserInput {
    fullName?: string;
    phone?: string | null;
    position?: string | null;
    department?: string | null;
}

export interface ResetUserPasswordInput {
    adminPassword: string;
    newPassword: string;
}

export interface ResetUserPasswordResponse {
    message: string;
}

export interface MailSettingsResponse {
    enabled: boolean;
    host: string;
    port: number;
    username: string | null;
    fromAddress: string;
    smtpAuth: boolean;
    startTls: boolean;
    passwordConfigured: boolean;
}

export interface UpdateMailSettingsInput {
    enabled: boolean;
    host: string;
    port: number;
    username?: string | null;
    password?: string;
    fromAddress: string;
    smtpAuth: boolean;
    startTls: boolean;
    clearPassword?: boolean;
}

export interface MailTestResponse {
    success: boolean;
    to: string;
    message: string;
}

export const adminApi = {
    getStats: () => api.get<DashboardStats>('/admin/dashboard/stats').then(r => r.data),

    getAnalytics: () => api.get<AdminAnalyticsResponse>('/admin/analytics').then(r => r.data),
    getStaffAnalytics: (userId: string) =>
        api.get<StaffAnalyticsResponse>(`/admin/analytics/staff/${userId}`).then(r => r.data),

    // Users
    getAllUsers: () => api.get<AllUserResponse[]>('/admin/users').then(r => r.data),
    updateUser: (userId: string, input: UpdateUserInput) =>
        api.put<AllUserResponse>(`/admin/users/${userId}`, input).then(r => r.data),
    updateUserRole: (userId: string, globalRole: string) =>
        api.put(`/admin/users/${userId}/role`, { globalRole }).then(r => r.data),
    resetUserPassword: (userId: string, input: ResetUserPasswordInput) =>
        api.put<ResetUserPasswordResponse>(`/admin/users/${userId}/password`, input)
            .then(r => r.data),
    deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

    // Mail Settings
    getMailSettings: () =>
        api.get<MailSettingsResponse>('/admin/mail-settings').then(r => r.data),
    updateMailSettings: (input: UpdateMailSettingsInput) =>
        api.put<MailSettingsResponse>('/admin/mail-settings', input).then(r => r.data),
    testMailSettings: () =>
        api.post<MailTestResponse>('/admin/mail-settings/test').then(r => r.data),

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


// --- Admin Analytics Types ---
export interface AdminAnalyticsResponse {
    totalCompanies: number;
    totalStaff: number;
    monthlyTasks: number;
    monthlyCompleted: number;
    completionRate: number;
    avgCompletionDays: number;
    efficiency: number;
    monthlyTrend: { name: string; görevler: number; tamamlanan: number }[];
    companyPerformance: { name: string; görevler: number; tamamlanan: number }[];
    taskDistribution: { name: string; value: number; color: string }[];
    staffPerformance: { label: string; value: number; max: number; color: string }[];
}

export interface StaffAnalyticsResponse {
    activeTasks: number;
    completedThisWeek: number;
    pendingTasks: number;
    completionRate: number;
    totalMinutesThisMonth: number;
    overdueTasks: number;
    weeklyFlow: { name: string; tamamlanan: number; yeni: number }[];
    monthlyHours: { name: string; saat: number }[];
    companyTasks: { label: string; companyId?: string | null; value: number; max: number; color: string }[];
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
    assignedToAvatarUrl?: string | null;
    category: string;
    isActive: boolean;
    createdById: string;
    createdByName: string;
    createdByAvatarUrl?: string | null;
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
