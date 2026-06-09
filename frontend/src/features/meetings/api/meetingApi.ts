import api from '../../../api/client';
import type { CreateMeetingInput, MeetingResponse, MeetingStatus, PageResponse } from './meeting.types';

export const meetingApi = {
    list: (page = 0, size = 20) =>
        api.get<PageResponse<MeetingResponse>>('/staff/meetings', { params: { page, size } })
            .then(response => response.data),

    listByCompany: (companyId: string, page = 0, size = 20) =>
        api.get<PageResponse<MeetingResponse>>(`/staff/meetings/company/${companyId}`, { params: { page, size } })
            .then(response => response.data),

    get: (id: string) =>
        api.get<MeetingResponse>(`/staff/meetings/${id}`).then(response => response.data),

    create: (input: CreateMeetingInput) =>
        api.post<MeetingResponse>('/staff/meetings', input).then(response => response.data),

    updateStatus: (id: string, status: MeetingStatus) =>
        api.put<MeetingResponse>(`/staff/meetings/${id}/status`, undefined, { params: { status } })
            .then(response => response.data),

    delete: (id: string) =>
        api.delete(`/staff/meetings/${id}`).then(response => response.data),

    complete: (id: string, content: string) =>
        api.put<MeetingResponse>(`/staff/meetings/${id}/complete`, { content }).then(response => response.data),

    addNote: (id: string, content: string) =>
        api.post<MeetingResponse>(`/staff/meetings/${id}/notes`, { content }).then(response => response.data),
};
