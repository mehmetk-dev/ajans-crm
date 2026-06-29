import api from './client';

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// --- API ---
export const staffApi = {
    // Analytics
    getMyAnalytics: () =>
        api.get<StaffAnalyticsResponse>('/staff/analytics').then(r => r.data),
};

// --- Analytics Types ---
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
