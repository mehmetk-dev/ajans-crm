export interface ContactResponse {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    globalRole: string;
    email: string;
    companyName: string | null;
    membershipRole: string | null;
    positionTitle: string | null;
}

export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatarUrl: string | null;
    content: string;
    isRead: boolean;
    approvalPending: boolean;
    createdAt: string;
}

export interface ConversationResponse {
    id: string;
    otherUserId: string;
    otherUserName: string;
    otherUserAvatarUrl: string | null;
    otherUserRole: string;
    otherUserCompanyName: string | null;
    otherUserMembershipRole: string | null;
    otherUserPositionTitle: string | null;
    updatedAt: string;
    createdAt: string;
    messageCount: number;
    unreadCount: number;
    lastMessage: MessageResponse | null;
}

export interface SendMessageRequest {
    content: string;
    requiresApproval?: boolean;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface GroupMemberInfo {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    membershipRole: string | null;
    positionTitle: string | null;
}

export interface GroupMessageResponse {
    id: string;
    groupId: string;
    senderId: string;
    senderName: string;
    senderAvatarUrl: string | null;
    senderGlobalRole: string | null;
    content: string;
    createdAt: string;
}

export interface GroupConversationResponse {
    id: string;
    name: string;
    companyId: string;
    companyName: string;
    avatarUrl: string | null;
    memberCount: number;
    unreadCount: number;
    updatedAt: string;
    createdAt: string;
    lastMessage: GroupMessageResponse | null;
    members: GroupMemberInfo[];
}
