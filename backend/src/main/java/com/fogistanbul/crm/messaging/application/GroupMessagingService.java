package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.messaging.dto.*;
import com.fogistanbul.crm.entity.*;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.repository.*;
import com.fogistanbul.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupMessagingService {

    private final GroupConversationRepository groupConversationRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final GroupMessageReadRepository groupMessageReadRepository;
    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository companyMembershipRepository;
    private final UserProfileRepository userProfileRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageAccessPolicy accessPolicy;
    private final MessageMapper mapper;
    private final NotificationService notificationService;

    @Transactional
    public GroupConversation createCompanyGroup(Company company, UserProfile firstMember) {
        Optional<GroupConversation> existing = groupConversationRepository.findByCompanyId(company.getId());
        if (existing.isPresent()) {
            addMemberIfNotExists(existing.get(), firstMember);
            return existing.get();
        }

        GroupConversation group = GroupConversation.builder()
                .name(company.getName() + " Grubu")
                .company(company)
                .avatarUrl(company.getLogoUrl())
                .build();
        group = groupConversationRepository.save(group);

        GroupMember member = GroupMember.builder().group(group).user(firstMember).build();
        groupMemberRepository.save(member);
        return group;
    }

    @Transactional
    public void addMemberToCompanyGroup(UUID companyId, UUID userId) {
        UserProfile user = userProfileRepository.findById(userId).orElse(null);
        if (user == null) return;

        GroupConversation group = groupConversationRepository.findByCompanyId(companyId).orElse(null);
        if (group == null) {
            Company company = companyRepository.findById(companyId).orElse(null);
            if (company == null) return;
            group = createCompanyGroup(company, user);
        } else {
            addMemberIfNotExists(group, user);
        }
    }

    @Transactional
    public void removeMemberFromCompanyGroup(UUID companyId, UUID userId) {
        groupConversationRepository.findByCompanyId(companyId).ifPresent(group ->
                groupMemberRepository.deleteByGroupIdAndUserId(group.getId(), userId));
    }

    private void addMemberIfNotExists(GroupConversation group, UserProfile user) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), user.getId())) {
            groupMemberRepository.save(GroupMember.builder().group(group).user(user).build());
        }
    }

    @Transactional(readOnly = true)
    public List<GroupConversationResponse> getMyGroups(UUID userId) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        if (memberships.isEmpty()) return List.of();

        List<UUID> groupIds = memberships.stream().map(m -> m.getGroup().getId()).toList();

        Map<UUID, Long> unreadCounts = groupMessageRepository
                .countUnreadByGroupIds(groupIds, userId).stream()
                .collect(Collectors.toMap(row -> (UUID) row[0], row -> (Long) row[1]));

        return memberships.stream().map(m -> {
            GroupConversation group = m.getGroup();
            GroupMessage lastMessage = groupMessageRepository
                    .findFirstByGroupIdOrderByCreatedAtDesc(group.getId()).orElse(null);
            List<GroupMember> members = groupMemberRepository.findByGroupId(group.getId());

            return GroupConversationResponse.builder()
                    .id(group.getId().toString())
                    .name(group.getName())
                    .companyId(group.getCompany().getId().toString())
                    .companyName(group.getCompany().getName())
                    .avatarUrl(group.getAvatarUrl())
                    .memberCount(members.size())
                    .unreadCount(unreadCounts.getOrDefault(group.getId(), 0L))
                    .updatedAt(group.getUpdatedAt())
                    .createdAt(group.getCreatedAt())
                    .lastMessage(lastMessage != null ? mapper.toGroupMessageResponse(lastMessage) : null)
                    .members(members.stream().map(mem -> {
                        UserProfile u = mem.getUser();
                        var cm = companyMembershipRepository.findByUserIdAndCompanyId(u.getId(), group.getCompany().getId()).orElse(null);
                        return GroupConversationResponse.GroupMemberInfo.builder()
                                .userId(u.getId().toString())
                                .fullName(u.getPerson() != null ? u.getPerson().getFullName() : u.getEmail())
                                .avatarUrl(u.getPerson() != null ? u.getPerson().getAvatarUrl() : null)
                                .membershipRole(cm != null ? cm.getMembershipRole().name() : null)
                                .positionTitle(u.getPerson() != null ? u.getPerson().getPositionTitle() : null)
                                .build();
                    }).toList())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public GroupMessageResponse sendMessage(UUID groupId, SendMessageRequest request, UUID senderId) {
        GroupConversation group = groupConversationRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Grup bulunamadı"));

        accessPolicy.requireGroupSendAccess(groupId, senderId);

        UserProfile sender = userProfileRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        GroupMessage message = GroupMessage.builder()
                .group(group).sender(sender).content(request.getContent()).build();
        message = groupMessageRepository.saveAndFlush(message);

        group.setUpdatedAt(Instant.now());
        groupConversationRepository.save(group);

        GroupMessageResponse response = mapper.toGroupMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/group/" + groupId, response);

        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        for (GroupMember member : members) {
            if (!member.getUser().getId().equals(senderId)) {
                messagingTemplate.convertAndSend("/topic/user/" + member.getUser().getId(), response);
                notificationService.send(
                        member.getUser().getId(),
                        NotificationType.MESSAGE_RECEIVED,
                        "Yeni grup mesajı",
                        request.getContent(),
                        "MESSAGE",
                        message.getId()
                );
            }
        }
        return response;
    }

    @Transactional
    public Page<GroupMessageResponse> getMessages(UUID groupId, UUID userId, int page, int size) {
        accessPolicy.requireGroupAccess(groupId, userId);
        groupMessageReadRepository.markAllAsRead(groupId, userId);
        return groupMessageRepository
                .findByGroupIdOrderByCreatedAtAsc(groupId, PageRequest.of(page, size))
                .map(mapper::toGroupMessageResponse);
    }

    @Transactional
    public void markAsRead(UUID groupId, UUID userId) {
        accessPolicy.requireGroupAccess(groupId, userId);
        groupMessageReadRepository.markAllAsRead(groupId, userId);
    }
}
