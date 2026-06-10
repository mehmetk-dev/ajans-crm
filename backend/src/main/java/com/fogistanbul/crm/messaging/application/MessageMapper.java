package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.entity.Conversation;
import com.fogistanbul.crm.entity.GroupMessage;
import com.fogistanbul.crm.entity.Message;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.messaging.dto.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MessageMapper {

    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId().toString())
                .conversationId(message.getConversation().getId().toString())
                .senderId(message.getSender().getId().toString())
                .senderName(message.getSender().getPerson() != null
                        ? message.getSender().getPerson().getFullName()
                        : message.getSender().getEmail())
                .senderAvatarUrl(message.getSender().getPerson() != null
                        ? message.getSender().getPerson().getAvatarUrl()
                        : null)
                .content(message.getContent())
                .isRead(message.getIsRead() != null ? message.getIsRead() : false)
                .approvalPending(message.getIsApprovalPending() != null ? message.getIsApprovalPending() : false)
                .createdAt(message.getCreatedAt())
                .build();
    }

    public ConversationResponse toConversationResponse(Conversation conversation, UUID currentUserId,
            long messageCount, long unreadCount, Message lastMessage, CompanyMembership otherUserMembership) {
        UserProfile otherUser = conversation.getUser1().getId().equals(currentUserId)
                ? conversation.getUser2()
                : conversation.getUser1();

        return ConversationResponse.builder()
                .id(conversation.getId().toString())
                .otherUserId(otherUser.getId().toString())
                .otherUserName(otherUser.getPerson() != null ? otherUser.getPerson().getFullName() : otherUser.getEmail())
                .otherUserAvatarUrl(otherUser.getPerson() != null ? otherUser.getPerson().getAvatarUrl() : null)
                .otherUserRole(otherUser.getGlobalRole().name())
                .otherUserCompanyName(otherUserMembership != null ? otherUserMembership.getCompany().getName() : null)
                .otherUserMembershipRole(otherUserMembership != null ? otherUserMembership.getMembershipRole().name() : null)
                .otherUserPositionTitle(otherUser.getPerson() != null ? otherUser.getPerson().getPositionTitle() : null)
                .updatedAt(conversation.getUpdatedAt())
                .createdAt(conversation.getCreatedAt())
                .messageCount(messageCount)
                .unreadCount(unreadCount)
                .lastMessage(lastMessage != null ? toMessageResponse(lastMessage) : null)
                .build();
    }

    public GroupMessageResponse toGroupMessageResponse(GroupMessage message) {
        return GroupMessageResponse.builder()
                .id(message.getId().toString())
                .groupId(message.getGroup().getId().toString())
                .senderId(message.getSender().getId().toString())
                .senderName(message.getSender().getPerson() != null
                        ? message.getSender().getPerson().getFullName()
                        : message.getSender().getEmail())
                .senderAvatarUrl(message.getSender().getPerson() != null
                        ? message.getSender().getPerson().getAvatarUrl()
                        : null)
                .senderGlobalRole(message.getSender().getGlobalRole().name())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public ContactResponse toContactResponse(UserProfile user, CompanyMembership membership) {
        return ContactResponse.builder()
                .id(user.getId().toString())
                .fullName(user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail())
                .email(user.getEmail())
                .globalRole(user.getGlobalRole().name())
                .avatarUrl(user.getPerson() != null ? user.getPerson().getAvatarUrl() : null)
                .companyName(membership != null ? membership.getCompany().getName() : null)
                .membershipRole(membership != null ? membership.getMembershipRole().name() : null)
                .positionTitle(user.getPerson() != null ? user.getPerson().getPositionTitle() : null)
                .build();
    }
}
