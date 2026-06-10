import api from './client';
import type { PageResponse } from './staff';
import type { ConversationResponse, MessageResponse, SendMessageRequest, ContactResponse, GroupConversationResponse, GroupMessageResponse } from './messaging';

// Client panel API — uses /api/client/* endpoints accessible to COMPANY_USER role
export const clientApi = {
    // Messaging
    startConversation: (targetUserId: string) =>
        api.post<ConversationResponse>(`/client/messaging/conversations/start/${targetUserId}`).then(r => r.data),

    getMyConversations: () =>
        api.get<ConversationResponse[]>('/client/messaging/conversations').then(r => r.data),

    getMessages: (conversationId: string, page = 0, size = 50) =>
        api.get<PageResponse<MessageResponse>>(
            `/client/messaging/conversations/${conversationId}/messages?page=${page}&size=${size}`
        ).then(r => r.data),

    sendMessage: (conversationId: string, data: SendMessageRequest) =>
        api.post<MessageResponse>(`/client/messaging/conversations/${conversationId}/messages`, data).then(r => r.data),

    getContacts: () =>
        api.get<ContactResponse[]>('/client/messaging/contacts').then(r => r.data),

    // Mark conversation as read
    markAsRead: (conversationId: string) =>
        api.post(`/client/messaging/conversations/${conversationId}/read`).then(r => r.data),

    // Group chats
    getMyGroups: () =>
        api.get<GroupConversationResponse[]>('/client/messaging/groups').then(r => r.data),

    getGroupMessages: (groupId: string, page = 0, size = 50) =>
        api.get<PageResponse<GroupMessageResponse>>(
            `/client/messaging/groups/${groupId}/messages?page=${page}&size=${size}`
        ).then(r => r.data),

    sendGroupMessage: (groupId: string, data: SendMessageRequest) =>
        api.post<GroupMessageResponse>(`/client/messaging/groups/${groupId}/messages`, data).then(r => r.data),

    markGroupAsRead: (groupId: string) =>
        api.post(`/client/messaging/groups/${groupId}/read`).then(r => r.data),

    // Settings
    updateProfile: (data: { fullName: string }) =>
        api.put<{ fullName: string }>('/client/settings/profile', data).then(r => r.data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put<{ message?: string; error?: string }>('/client/settings/password', data).then(r => r.data),

    // Surveys
    submitSurvey: (data: { score: number; comment?: string }) =>
        api.post<SurveyResponse>('/client/surveys', data).then(r => r.data),

    getMySurveys: () =>
        api.get<SurveyResponse[]>('/client/surveys/my').then(r => r.data),

    // Active Services
    getActiveServices: () =>
        api.get<{ activeServices: string[] }>('/client/active-services').then(r => r.data),
};

export interface SurveyResponse {
    id: string;
    companyId: string;
    companyName: string;
    score: number;
    surveyMonth: string;
    submittedById: string;
    submittedByName: string;
    createdAt: string;
}
