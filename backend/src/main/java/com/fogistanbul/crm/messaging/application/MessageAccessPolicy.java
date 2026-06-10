package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.entity.Conversation;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MessageAccessPolicy {

    private final CompanyMembershipRepository membershipRepository;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * Checks whether currentUser is allowed to start/access a DM with targetUser.
     * - ADMIN can message anyone.
     * - Non-admin users must share at least one company OR target must be ADMIN.
     * - EMPLOYEE can only message AGENCY_STAFF of their companies.
     */
    public void requireDirectMessageAccess(UserProfile currentUser, UserProfile targetUser) {
        if (currentUser.getGlobalRole() == GlobalRole.ADMIN) return;
        if (targetUser.getGlobalRole() == GlobalRole.ADMIN) return;

        if (!membershipRepository.existsSharedCompany(currentUser.getId(), targetUser.getId())) {
            throw new AccessDeniedException("Bu kullaniciyla mesajlasma yetkiniz yok");
        }

        if (currentUser.getGlobalRole() == GlobalRole.COMPANY_USER) {
            boolean isEmployee = membershipRepository.findByUserId(currentUser.getId()).stream()
                    .anyMatch(m -> m.getMembershipRole() == MembershipRole.EMPLOYEE);
            if (isEmployee) {
                boolean targetIsAgencyStaff = membershipRepository.findByUserId(targetUser.getId()).stream()
                        .anyMatch(m -> m.getMembershipRole() == MembershipRole.AGENCY_STAFF);
                if (!targetIsAgencyStaff) {
                    throw new AccessDeniedException("Sadece size atanmis ajans calisanlarina mesaj atabilirsiniz");
                }
            }
        }
    }

    /**
     * Checks whether the user is a participant of the given DM conversation.
     */
    public void requireConversationAccess(Conversation conversation, UUID userId) {
        if (!conversation.getUser1().getId().equals(userId)
                && !conversation.getUser2().getId().equals(userId)) {
            throw new AccessDeniedException("Bu konusmaya erisim yetkiniz yok");
        }
    }

    /**
     * Checks whether the user is a member of the given group.
     */
    public void requireGroupAccess(UUID groupId, UUID userId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new AccessDeniedException("Bu gruba erisim yetkiniz yok");
        }
    }

    /**
     * Checks whether the user can send a message to the given group.
     */
    public void requireGroupSendAccess(UUID groupId, UUID userId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new AccessDeniedException("Bu gruba mesaj gonderme yetkiniz yok");
        }
    }
}
