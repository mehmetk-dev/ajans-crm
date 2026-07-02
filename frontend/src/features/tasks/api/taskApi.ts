import api from '../../../api/client';
import type {
    AssignableUser,
    CreateTaskInput,
    PageResponse,
    TaskCreatePermissionResponse,
    TaskNoteResponse,
    TaskResponse,
    TaskReviewResponse,
    TaskStatus,
    UpdateTaskInput,
} from './task.types';

export const taskApi = {
    listMine: (page = 0, size = 20) =>
        api.get<PageResponse<TaskResponse>>(`/staff/tasks/my?page=${page}&size=${size}`).then(response => response.data),

    listAll: (page = 0, size = 20, status?: TaskStatus) =>
        api.get<PageResponse<TaskResponse>>('/staff/tasks', { params: { page, size, status } }).then(response => response.data),

    listByCompany: (companyId: string, page = 0, size = 20) =>
        api.get<PageResponse<TaskResponse>>(`/staff/tasks/company/${companyId}`, { params: { page, size } })
            .then(response => response.data),

    get: (id: string) =>
        api.get<TaskResponse>(`/staff/tasks/${id}`).then(response => response.data),

    create: (input: CreateTaskInput, mode: 'staff' | 'client' = 'staff') =>
        api.post<TaskResponse>(mode === 'client' ? '/client/tasks' : '/staff/tasks', input)
            .then(response => response.data),

    update: (id: string, input: UpdateTaskInput) =>
        api.put<TaskResponse>(`/staff/tasks/${id}`, input).then(response => response.data),

    delete: (id: string) =>
        api.delete(`/staff/tasks/${id}`).then(response => response.data),

    listAssignableUsers: (companyId?: string, mode: 'staff' | 'client' = 'staff') =>
        api.get<AssignableUser[]>(
            mode === 'client' ? '/client/tasks/assignable-users' : '/staff/tasks/assignable-users',
            { params: { companyId } },
        )
            .then(response => response.data),

    listNotificationRecipients: (companyId?: string, mode: 'staff' | 'client' = 'staff') =>
        api.get<AssignableUser[]>(
            mode === 'client' ? '/client/tasks/notification-recipients' : '/staff/tasks/notification-recipients',
            { params: { companyId } },
        )
            .then(response => response.data),

    canCreateClientTask: (companyId: string) =>
        api.get<TaskCreatePermissionResponse>('/client/tasks/can-create', { params: { companyId } })
            .then(response => response.data),

    listNotes: (taskId: string) =>
        api.get<TaskNoteResponse[]>(`/staff/tasks/${taskId}/notes`).then(response => response.data),

    addNote: (taskId: string, content: string) =>
        api.post<TaskNoteResponse>(`/staff/tasks/${taskId}/notes`, { content }).then(response => response.data),

    deleteNote: (noteId: string) =>
        api.delete(`/staff/tasks/notes/${noteId}`).then(response => response.data),

    listClient: (page = 0, size = 50, status?: TaskStatus) =>
        api.get<PageResponse<TaskResponse>>('/client/tasks/my', { params: { page, size, status } })
            .then(response => response.data),

    getClient: (id: string) =>
        api.get<TaskResponse>(`/client/tasks/${id}`).then(response => response.data),

    review: (taskId: string, input: { score: number; comment?: string }) =>
        api.post<TaskReviewResponse>(`/client/tasks/${taskId}/review`, input).then(response => response.data),

    listReviews: (taskId: string) =>
        api.get<TaskReviewResponse[]>(`/client/tasks/${taskId}/reviews`).then(response => response.data),

    listReviewsBatch: (taskIds: string[]) =>
        api.get<Record<string, TaskReviewResponse[]>>('/client/tasks/reviews/batch', {
            params: { taskIds: taskIds.join(',') },
        }).then(response => response.data),
};
