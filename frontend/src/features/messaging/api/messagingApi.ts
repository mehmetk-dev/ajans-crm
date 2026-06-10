import api from '../../../api/client';
import type {
    ContactResponse, ConversationResponse, MessageResponse,
    SendMessageRequest, PageResponse, GroupConversationResponse, GroupMessageResponse,
} from './messaging.types';

export const messagingApi = {
    getContacts: () =>
        api.get<ContactResponse[]>('/staff/messaging/contacts').then(r => r.data),

    startConversation: (targetUserId: string) =>
        api.post<ConversationResponse>(`/staff/messaging/conversations/start/${targetUserId}`).then(r => r.data),

    getMyConversations: () =>
        api.get<ConversationResponse[]>('/staff/messaging/conversations').then(r => r.data),

    sendMessage: (conversationId: string, data: SendMessageRequest) =>
        api.post<MessageResponse>(`/staff/messaging/conversations/${conversationId}/messages`, data).then(r => r.data),

    getMessages: (conversationId: string, page = 0, size = 50) =>
        api.get<PageResponse<MessageResponse>>(
            `/staff/messaging/conversations/${conversationId}/messages?page=${page}&size=${size}`
        ).then(r => r.data),

    approveMessage: (messageId: string) =>
        api.post<MessageResponse>(`/staff/messaging/messages/${messageId}/approve`).then(r => r.data),

    markAsRead: (conversationId: string) =>
        api.post(`/staff/messaging/conversations/${conversationId}/read`).then(r => r.data),

    getMyGroups: () =>
        api.get<GroupConversationResponse[]>('/staff/messaging/groups').then(r => r.data),

    getGroupMessages: (groupId: string, page = 0, size = 50) =>
        api.get<PageResponse<GroupMessageResponse>>(
            `/staff/messaging/groups/${groupId}/messages?page=${page}&size=${size}`
        ).then(r => r.data),

    sendGroupMessage: (groupId: string, data: SendMessageRequest) =>
        api.post<GroupMessageResponse>(`/staff/messaging/groups/${groupId}/messages`, data).then(r => r.data),

    markGroupAsRead: (groupId: string) =>
        api.post(`/staff/messaging/groups/${groupId}/read`).then(r => r.data),
};
