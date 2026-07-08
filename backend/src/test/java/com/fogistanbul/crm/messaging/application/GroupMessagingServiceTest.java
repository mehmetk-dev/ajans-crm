package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.entity.GroupConversation;
import com.fogistanbul.crm.entity.GroupMember;
import com.fogistanbul.crm.entity.GroupMessage;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.messaging.dto.GroupMessageResponse;
import com.fogistanbul.crm.messaging.dto.SendMessageRequest;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.GroupConversationRepository;
import com.fogistanbul.crm.repository.GroupMemberRepository;
import com.fogistanbul.crm.repository.GroupMessageReadRepository;
import com.fogistanbul.crm.repository.GroupMessageRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupMessagingServiceTest {

    @Mock GroupConversationRepository groupConversationRepository;
    @Mock GroupMemberRepository groupMemberRepository;
    @Mock GroupMessageRepository groupMessageRepository;
    @Mock GroupMessageReadRepository groupMessageReadRepository;
    @Mock CompanyRepository companyRepository;
    @Mock CompanyMembershipRepository companyMembershipRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock SimpMessagingTemplate messagingTemplate;
    @Mock MessageAccessPolicy accessPolicy;
    @Mock MessageMapper mapper;
    @Mock NotificationService notificationService;

    @InjectMocks GroupMessagingService service;

    @Test
    void sendMessageNotifiesEveryGroupMemberExceptSender() {
        UUID groupId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        UUID firstRecipientId = UUID.randomUUID();
        UUID secondRecipientId = UUID.randomUUID();
        GroupConversation group = GroupConversation.builder()
                .id(groupId)
                .name("Müşteri Grubu")
                .updatedAt(Instant.now())
                .build();
        UserProfile sender = user(senderId);
        UserProfile firstRecipient = user(firstRecipientId);
        UserProfile secondRecipient = user(secondRecipientId);
        GroupMessage savedMessage = GroupMessage.builder()
                .id(UUID.randomUUID())
                .group(group)
                .sender(sender)
                .content("Herkese merhaba")
                .createdAt(Instant.now())
                .build();

        when(groupConversationRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(userProfileRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(groupMessageRepository.saveAndFlush(any())).thenReturn(savedMessage);
        when(groupConversationRepository.save(group)).thenReturn(group);
        when(mapper.toGroupMessageResponse(savedMessage)).thenReturn(GroupMessageResponse.builder()
                .id(savedMessage.getId().toString())
                .groupId(groupId.toString())
                .senderId(senderId.toString())
                .content("Herkese merhaba")
                .build());
        when(groupMemberRepository.findByGroupId(groupId)).thenReturn(List.of(
                member(group, sender),
                member(group, firstRecipient),
                member(group, secondRecipient)
        ));

        SendMessageRequest request = new SendMessageRequest();
        request.setContent("Herkese merhaba");

        service.sendMessage(groupId, request, senderId);

        verify(notificationService).send(
                eq(firstRecipientId),
                eq(NotificationType.MESSAGE_RECEIVED),
                eq("Yeni grup mesajı"),
                eq("Herkese merhaba"),
                eq("GROUP_MESSAGE"),
                eq(groupId)
        );
        verify(notificationService).send(
                eq(secondRecipientId),
                eq(NotificationType.MESSAGE_RECEIVED),
                eq("Yeni grup mesajı"),
                eq("Herkese merhaba"),
                eq("GROUP_MESSAGE"),
                eq(groupId)
        );
    }

    private UserProfile user(UUID id) {
        UserProfile user = new UserProfile();
        user.setId(id);
        return user;
    }

    private GroupMember member(GroupConversation group, UserProfile user) {
        return GroupMember.builder()
                .group(group)
                .user(user)
                .build();
    }
}
