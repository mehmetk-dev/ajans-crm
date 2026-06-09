import api from './client';

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ShootResponse {
    id: string;
    companyId: string;
    companyName: string;
    title: string;
    description: string | null;
    shootDate: string | null;
    shootTime: string | null;
    location: string | null;
    status: string;
    photographerId: string | null;
    photographerName: string | null;
    notes: string | null;
    createdById: string;
    createdByName: string;
    participants: { userId: string; fullName: string; roleInShoot: string | null }[];
    equipment: { id: string; name: string; quantity: number; notes: string | null }[];
    linkedContentCount: number;
    createdAt: string;
}

export interface PrProjectResponse {
    id: string;
    companyId: string | null;
    companyName: string | null;
    name: string;
    purpose: string | null;
    totalPhases: number;
    currentPhase: number;
    progressPercent: number;
    status: string;
    createdById: string;
    createdByName: string;
    responsibleId: string | null;
    responsibleName: string | null;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    phases: PrPhaseInfo[];
    members: { userId: string; fullName: string }[];
    createdAt: string;
}

export interface PrPhaseInfo {
    id: string;
    phaseNumber: number;
    name: string;
    isCompleted: boolean;
    completedAt: string | null;
    assignedToId: string | null;
    assignedToName: string | null;
    startDate: string | null;
    endDate: string | null;
    notes: string | null;
    status: string;
    phaseNotes: PhaseNoteInfo[];
}

export interface PhaseNoteInfo {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
}

export interface CreatePrProjectRequest {
    name: string;
    companyId?: string;
    responsibleId?: string;
    purpose?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
    totalPhases?: number;
    phases?: { name: string; assignedToId?: string; startDate?: string; endDate?: string; notes?: string }[];
    memberIds?: string[];
}

export interface UpdatePrProjectRequest {
    name?: string;
    purpose?: string;
    companyId?: string;
    responsibleId?: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
    status?: string;
    phases?: { id?: string; name?: string; assignedToId?: string; startDate?: string; endDate?: string; notes?: string }[];
}

// --- API ---
export const staffApi = {
    // Shoots
    getShoots: (page = 0, size = 20) =>
        api.get<PageResponse<ShootResponse>>(`/staff/shoots?page=${page}&size=${size}`).then(r => r.data),

    getShootsByCompany: (companyId: string, page = 0, size = 20) =>
        api.get<PageResponse<ShootResponse>>(`/staff/shoots/company/${companyId}?page=${page}&size=${size}`).then(r => r.data),

    getShootById: (id: string) =>
        api.get<ShootResponse>(`/staff/shoots/${id}`).then(r => r.data),

    createShoot: (data: { companyId: string; title: string; description?: string; shootDate?: string; shootTime?: string; location?: string; photographerId?: string; notes?: string; participants?: { userId: string; roleInShoot: string }[]; equipment?: { name: string; quantity?: number; notes?: string }[] }) =>
        api.post<ShootResponse>('/staff/shoots', data).then(r => r.data),

    updateShootStatus: (id: string, status: string) =>
        api.put<ShootResponse>(`/staff/shoots/${id}/status?status=${status}`).then(r => r.data),

    deleteShoot: (id: string) =>
        api.delete(`/staff/shoots/${id}`).then(r => r.data),

    // PR Projects
    getPrProjects: (page = 0, size = 20) =>
        api.get<PageResponse<PrProjectResponse>>(`/staff/pr-projects?page=${page}&size=${size}`).then(r => r.data),

    getPrProject: (id: string) =>
        api.get<PrProjectResponse>(`/staff/pr-projects/${id}`).then(r => r.data),

    getPrProjectsByCompany: (companyId: string, page = 0, size = 20) =>
        api.get<PageResponse<PrProjectResponse>>(`/staff/pr-projects/company/${companyId}?page=${page}&size=${size}`).then(r => r.data),

    createPrProject: (data: CreatePrProjectRequest) =>
        api.post<PrProjectResponse>('/staff/pr-projects', data).then(r => r.data),

    updatePrProject: (id: string, data: UpdatePrProjectRequest) =>
        api.put<PrProjectResponse>(`/staff/pr-projects/${id}`, data).then(r => r.data),

    completePrPhase: (projectId: string, phaseId: string) =>
        api.post<PrProjectResponse>(`/staff/pr-projects/${projectId}/phases/${phaseId}/complete`).then(r => r.data),

    deletePrProject: (id: string) =>
        api.delete(`/staff/pr-projects/${id}`).then(r => r.data),

    addPrPhaseNote: (projectId: string, phaseId: string, content: string) =>
        api.post<PrProjectResponse>(`/staff/pr-projects/${projectId}/phases/${phaseId}/notes`, { content }).then(r => r.data),

    // Analytics
    getMyAnalytics: () =>
        api.get<StaffAnalyticsResponse>('/staff/analytics').then(r => r.data),
    // Approval Requests
    getApprovalRequests: () =>
        api.get<ApprovalRequestResponse[]>('/staff/approval-requests').then(r => r.data),

    getPendingApprovals: () =>
        api.get<ApprovalRequestResponse[]>('/staff/approval-requests/pending').then(r => r.data),

    getPendingCount: () =>
        api.get<{ count: number }>('/staff/approval-requests/count').then(r => r.data),

    approveRequest: (id: string, data?: Record<string, unknown>) =>
        api.post<ApprovalRequestResponse>(`/staff/approval-requests/${id}/approve`, data ?? {}).then(r => r.data),

    rejectRequest: (id: string, note?: string) =>
        api.post<ApprovalRequestResponse>(`/staff/approval-requests/${id}/reject`, { note }).then(r => r.data),
};

// --- Approval Request Types ---
export interface ApprovalRequestResponse {
    id: string;
    type: string;
    referenceId: string | null;
    companyName: string;
    companyId: string;
    requestedByName: string;
    requestedById: string;
    status: string;
    title: string;
    description: string | null;
    metadata: string | null;
    reviewedByName: string | null;
    reviewNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
}

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
    companyTasks: { label: string; value: number; max: number; color: string }[];
}
