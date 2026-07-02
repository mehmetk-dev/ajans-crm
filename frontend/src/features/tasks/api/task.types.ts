export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
export type TaskCategory = 'REELS' | 'BLOG' | 'PAYLASIM' | 'SEO' | 'TASARIM' | 'TOPLANTI' | 'OTHER';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskResponse {
    id: string;
    companyId: string | null;
    companyName: string | null;
    assignedToId: string;
    assignedToName: string;
    assignedToAvatarUrl?: string | null;
    createdById: string;
    createdByName: string;
    createdByAvatarUrl?: string | null;
    title: string;
    description: string | null;
    category: TaskCategory;
    priority: TaskPriority | null;
    status: TaskStatus;
    startDate: string | null;
    startTime: string | null;
    endDate: string | null;
    endTime: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskInput {
    companyId?: string;
    assignedToId: string;
    notifyUserIds?: string[];
    title: string;
    description?: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: TaskStatus;
    category?: TaskCategory;
    priority?: TaskPriority;
    assignedToId?: string;
    companyId?: string;
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
}

export interface AssignableUser {
    id: string;
    fullName: string;
    email: string;
    globalRole: 'ADMIN' | 'AGENCY_STAFF' | 'COMPANY_USER';
    avatarUrl: string | null;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface TaskCreatePermissionResponse {
    canCreate: boolean;
}

export interface TaskReviewResponse {
    id: string;
    taskId: string;
    taskTitle: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatarUrl?: string | null;
    score: number;
    comment: string | null;
    createdAt: string;
}

export interface TaskNoteResponse {
    id: string;
    taskId: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl?: string | null;
    content: string;
    createdAt: string;
}
