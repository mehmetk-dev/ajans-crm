package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.messaging.dto.*;
import com.fogistanbul.crm.entity.*;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final UserProfileRepository userProfileRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageAccessPolicy accessPolicy;
    private final MessageMapper mapper;

    @Transactional
    public ConversationResponse getOrStartConversation(UUID currentUserId, UUID targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SELF_MESSAGING_FORBIDDEN", "Kendinizle konuşamazsınız");
        }

        UserProfile currentUser = userProfileRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));
        UserProfile targetUser = userProfileRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));

        accessPolicy.requireDirectMessageAccess(currentUser, targetUser);

        Conversation conversation = conversationRepository.findByUserIds(currentUserId, targetUserId)
                .orElseGet(() -> {
                    boolean currentFirst = currentUserId.toString().compareTo(targetUserId.toString()) < 0;
                    Conversation newConvo = Conversation.builder()
                            .user1(currentFirst ? currentUser : targetUser)
                            .user2(currentFirst ? targetUser : currentUser)
                            .build();
                    return conversationRepository.save(newConvo);
                });

        long messageCount = messageRepository.countByConversationId(conversation.getId());
        long unreadCount = messageRepository.countByConversationIdAndIsReadFalseAndSenderIdNot(conversation.getId(), currentUserId);
        Message lastMsg = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId()).orElse(null);
        CompanyMembership mb = membershipRepository.findByUserId(targetUserId).stream().findFirst().orElse(null);

        return mapper.toConversationResponse(conversation, currentUserId, messageCount, unreadCount, lastMsg, mb);
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(UUID userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        if (conversations.isEmpty()) return List.of();

        List<UUID> conversationIds = conversations.stream().map(Conversation::getId).collect(Collectors.toList());

        Map<UUID, Long> messageCounts = messageRepository.countByConversationIds(conversationIds)
                .stream().collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        Map<UUID, Long> unreadCounts = messageRepository.countUnreadByConversationIds(conversationIds, userId)
                .stream().collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        List<UUID> otherUserIds = conversations.stream()
                .map(c -> c.getUser1().getId().equals(userId) ? c.getUser2().getId() : c.getUser1().getId())
                .toList();
        Map<UUID, CompanyMembership> convMembershipMap = membershipRepository
                .findByUserIdIn(otherUserIds).stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m, (a, b) -> a));
        Map<UUID, Message> lastMessagesByConversation = messageRepository
                .findLatestByConversationIds(conversationIds).stream()
                .collect(Collectors.toMap(message -> message.getConversation().getId(), message -> message, (a, b) -> a));

        return conversations.stream()
                .map(c -> {
                    UserProfile otherUser = c.getUser1().getId().equals(userId) ? c.getUser2() : c.getUser1();
                    Message lastMessage = lastMessagesByConversation.get(c.getId());
                    CompanyMembership mb = convMembershipMap.get(otherUser.getId());
                    return mapper.toConversationResponse(c, userId,
                            messageCounts.getOrDefault(c.getId(), 0L),
                            unreadCounts.getOrDefault(c.getId(), 0L),
                            lastMessage, mb);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(UUID conversationId, SendMessageRequest request, UUID senderId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(this::conversationNotFound);

        accessPolicy.requireConversationAccess(conversation, senderId);

        UserProfile sender = userProfileRepository.findById(senderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .isApprovalPending(request.isRequiresApproval())
                .isRead(false)
                .build();

        message = messageRepository.save(message);
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        MessageResponse response = mapper.toMessageResponse(message);
        log.info("Message sent in conversation {} by user {}", conversationId, senderId);

        messagingTemplate.convertAndSend("/topic/thread/" + conversationId, response);

        UUID otherUserId = conversation.getUser1().getId().equals(senderId)
                ? conversation.getUser2().getId()
                : conversation.getUser1().getId();
        messagingTemplate.convertAndSend("/topic/user/" + otherUserId, response);

        return response;
    }

    @Transactional
    public Page<MessageResponse> getMessages(UUID conversationId, UUID userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(this::conversationNotFound);

        accessPolicy.requireConversationAccess(conversation, userId);

        int markedCount = messageRepository.markAsReadByConversationAndNotSender(conversationId, userId);
        if (markedCount > 0) {
            messagingTemplate.convertAndSend("/topic/read/" + conversationId,
                    Map.of("conversationId", conversationId.toString(), "readBy", userId.toString()));
        }

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId, PageRequest.of(page, size))
                .map(mapper::toMessageResponse);
    }

    @Transactional
    public void markConversationAsRead(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(this::conversationNotFound);

        accessPolicy.requireConversationAccess(conversation, userId);

        int markedCount = messageRepository.markAsReadByConversationAndNotSender(conversationId, userId);
        if (markedCount > 0) {
            messagingTemplate.convertAndSend("/topic/read/" + conversationId,
                    Map.of("conversationId", conversationId.toString(), "readBy", userId.toString()));
        }
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getContacts(UUID userId) {
        UserProfile currentUser = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Kullanıcı bulunamadı"));

        List<UserProfile> contacts;
        if (currentUser.getGlobalRole() == GlobalRole.ADMIN) {
            contacts = userProfileRepository.findByIdNot(userId);
        } else {
            List<UUID> companyIds = membershipRepository.findCompanyIdsByUserId(userId);
            if (companyIds.isEmpty()) return List.of();

            boolean isEmployee = currentUser.getGlobalRole() == GlobalRole.COMPANY_USER
                    && membershipRepository.findByUserId(userId).stream()
                            .anyMatch(m -> m.getMembershipRole() == MembershipRole.EMPLOYEE);

            List<UUID> allowedUserIds = isEmployee
                    ? membershipRepository.findAgencyStaffUserIdsByCompanyIds(companyIds).stream()
                            .filter(id -> !id.equals(userId)).toList()
                    : membershipRepository.findDistinctUserIdsByCompanyIds(companyIds).stream()
                            .filter(id -> !id.equals(userId)).toList();

            if (allowedUserIds.isEmpty()) return List.of();
            contacts = userProfileRepository.findAllById(allowedUserIds);
        }

        List<UUID> contactUserIds = contacts.stream().map(UserProfile::getId).toList();
        Map<UUID, CompanyMembership> membershipMap = membershipRepository.findByUserIdIn(contactUserIds).stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m, (a, b) -> a));

        return contacts.stream()
                .map(u -> mapper.toContactResponse(u, membershipMap.get(u.getId())))
                .collect(Collectors.toList());
    }

    private ApiException conversationNotFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND", "Konuşma bulunamadı");
    }
}
