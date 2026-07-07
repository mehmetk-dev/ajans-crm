package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.entity.Conversation;
import com.fogistanbul.crm.entity.Message;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.messaging.dto.ConversationResponse;
import com.fogistanbul.crm.messaging.dto.MessageResponse;
import com.fogistanbul.crm.messaging.dto.SendMessageRequest;
import com.fogistanbul.crm.repository.*;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessagingServiceTest {

    @Mock MessageRepository messageRepository;
    @Mock ConversationRepository conversationRepository;
    @Mock CompanyMembershipRepository membershipRepository;
    @Mock UserProfileRepository userProfileRepository;
    @Mock SimpMessagingTemplate messagingTemplate;
    @Mock MessageAccessPolicy accessPolicy;
    @Mock MessageMapper mapper;
    @Mock NotificationService notificationService;

    @InjectMocks MessagingService service;

    @Test
    void send_message_delegates_access_check_and_broadcasts() {
        UUID convId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();

        UserProfile u1 = makeUser(senderId, GlobalRole.AGENCY_STAFF);
        UserProfile u2 = makeUser(UUID.randomUUID(), GlobalRole.AGENCY_STAFF);

        Conversation conv = new Conversation();
        conv.setId(convId);
        conv.setUser1(u1);
        conv.setUser2(u2);
        conv.setUpdatedAt(Instant.now());

        Message savedMsg = new Message();
        savedMsg.setId(UUID.randomUUID());
        savedMsg.setConversation(conv);
        savedMsg.setSender(u1);
        savedMsg.setContent("hello");
        savedMsg.setIsRead(false);
        savedMsg.setIsApprovalPending(false);
        savedMsg.setCreatedAt(Instant.now());

        MessageResponse expected = MessageResponse.builder()
                .id(savedMsg.getId().toString())
                .conversationId(convId.toString())
                .senderId(senderId.toString())
                .content("hello")
                .build();

        when(conversationRepository.findById(convId)).thenReturn(Optional.of(conv));
        when(userProfileRepository.findById(senderId)).thenReturn(Optional.of(u1));
        when(messageRepository.saveAndFlush(any())).thenReturn(savedMsg);
        when(conversationRepository.save(any())).thenReturn(conv);
        when(mapper.toMessageResponse(savedMsg)).thenReturn(expected);

        SendMessageRequest req = new SendMessageRequest();
        req.setContent("hello");

        MessageResponse result = service.sendMessage(convId, req, senderId);

        verify(accessPolicy).requireConversationAccess(conv, senderId);
        verify(notificationService).send(
                eq(u2.getId()),
                eq(NotificationType.MESSAGE_RECEIVED),
                eq("Yeni mesaj"),
                eq("hello"),
                eq("MESSAGE"),
                eq(savedMsg.getId())
        );
        assertNotNull(result);
        assertEquals("hello", result.getContent());
    }

    @Test
    void cannot_start_conversation_with_self() {
        UUID userId = UUID.randomUUID();
        assertThrows(RuntimeException.class,
                () -> service.getOrStartConversation(userId, userId));
    }

    @Test
    void missingConversationUsesApiExceptionWhenSendingMessage() {
        UUID convId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        when(conversationRepository.findById(convId)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(
                ApiException.class,
                () -> service.sendMessage(convId, new SendMessageRequest(), senderId)
        );

        assertEquals("CONVERSATION_NOT_FOUND", ex.getCode());
    }

    @Test
    void conversationListLoadsLastMessagesInOneBatch() {
        UUID currentUserId = UUID.randomUUID();
        UserProfile currentUser = makeUser(currentUserId, GlobalRole.AGENCY_STAFF);
        UserProfile firstOtherUser = makeUser(UUID.randomUUID(), GlobalRole.AGENCY_STAFF);
        UserProfile secondOtherUser = makeUser(UUID.randomUUID(), GlobalRole.AGENCY_STAFF);
        Conversation first = conversation(UUID.randomUUID(), currentUser, firstOtherUser);
        Conversation second = conversation(UUID.randomUUID(), currentUser, secondOtherUser);
        Message firstLastMessage = message(first);
        Message secondLastMessage = message(second);
        List<UUID> conversationIds = List.of(first.getId(), second.getId());

        when(conversationRepository.findByUserId(currentUserId)).thenReturn(List.of(first, second));
        when(messageRepository.countByConversationIds(conversationIds)).thenReturn(List.of());
        when(messageRepository.countUnreadByConversationIds(conversationIds, currentUserId)).thenReturn(List.of());
        when(membershipRepository.findByUserIdIn(List.of(firstOtherUser.getId(), secondOtherUser.getId())))
                .thenReturn(List.of());
        when(messageRepository.findLatestByConversationIds(conversationIds))
                .thenReturn(List.of(firstLastMessage, secondLastMessage));
        when(mapper.toConversationResponse(first, currentUserId, 0L, 0L, firstLastMessage, null))
                .thenReturn(ConversationResponse.builder().id(first.getId().toString()).build());
        when(mapper.toConversationResponse(second, currentUserId, 0L, 0L, secondLastMessage, null))
                .thenReturn(ConversationResponse.builder().id(second.getId().toString()).build());

        List<ConversationResponse> result = service.getMyConversations(currentUserId);

        assertEquals(2, result.size());
        verify(messageRepository).findLatestByConversationIds(conversationIds);
        verify(messageRepository, never()).findFirstByConversationIdOrderByCreatedAtDesc(first.getId());
        verify(messageRepository, never()).findFirstByConversationIdOrderByCreatedAtDesc(second.getId());
    }

    private UserProfile makeUser(UUID id, GlobalRole role) {
        UserProfile u = new UserProfile();
        u.setId(id);
        u.setGlobalRole(role);
        return u;
    }

    private Conversation conversation(UUID id, UserProfile user1, UserProfile user2) {
        Conversation conversation = new Conversation();
        conversation.setId(id);
        conversation.setUser1(user1);
        conversation.setUser2(user2);
        return conversation;
    }

    private Message message(Conversation conversation) {
        Message message = new Message();
        message.setId(UUID.randomUUID());
        message.setConversation(conversation);
        message.setCreatedAt(Instant.now());
        return message;
    }
}
