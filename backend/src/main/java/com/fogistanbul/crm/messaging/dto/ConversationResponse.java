package com.fogistanbul.crm.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private String id;
    private String otherUserId;
    private String otherUserName;
    private String otherUserAvatarUrl;
    private String otherUserRole;
    private String otherUserCompanyName;
    private String otherUserMembershipRole;
    private String otherUserPositionTitle;
    private Instant updatedAt;
    private Instant createdAt;
    private long messageCount;
    private long unreadCount;
    private MessageResponse lastMessage;
}
