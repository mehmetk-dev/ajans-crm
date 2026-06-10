package com.fogistanbul.crm.messaging.application;

import com.fogistanbul.crm.entity.Conversation;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.GroupMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageAccessPolicyTest {

    @Mock CompanyMembershipRepository membershipRepository;
    @Mock GroupMemberRepository groupMemberRepository;

    @InjectMocks MessageAccessPolicy policy;

    @Test
    void admin_can_message_anyone() {
        UserProfile admin = user(GlobalRole.ADMIN, UUID.randomUUID());
        UserProfile target = user(GlobalRole.COMPANY_USER, UUID.randomUUID());
        assertDoesNotThrow(() -> policy.requireDirectMessageAccess(admin, target));
    }

    @Test
    void any_user_can_message_admin() {
        UserProfile staff = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        UserProfile admin = user(GlobalRole.ADMIN, UUID.randomUUID());
        assertDoesNotThrow(() -> policy.requireDirectMessageAccess(staff, admin));
    }

    @Test
    void non_admin_blocked_without_shared_company() {
        UserProfile staff = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        UserProfile other = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        when(membershipRepository.existsSharedCompany(staff.getId(), other.getId())).thenReturn(false);
        assertThrows(AccessDeniedException.class, () -> policy.requireDirectMessageAccess(staff, other));
    }

    @Test
    void staff_can_message_when_shared_company() {
        UserProfile staff = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        UserProfile other = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        when(membershipRepository.existsSharedCompany(staff.getId(), other.getId())).thenReturn(true);
        assertDoesNotThrow(() -> policy.requireDirectMessageAccess(staff, other));
    }

    @Test
    void conversation_access_granted_for_participant() {
        UUID userId = UUID.randomUUID();
        UserProfile u1 = user(GlobalRole.AGENCY_STAFF, userId);
        UserProfile u2 = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        Conversation conv = new Conversation();
        conv.setUser1(u1);
        conv.setUser2(u2);
        assertDoesNotThrow(() -> policy.requireConversationAccess(conv, userId));
    }

    @Test
    void conversation_access_denied_for_non_participant() {
        UserProfile u1 = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        UserProfile u2 = user(GlobalRole.AGENCY_STAFF, UUID.randomUUID());
        Conversation conv = new Conversation();
        conv.setUser1(u1);
        conv.setUser2(u2);
        assertThrows(AccessDeniedException.class,
                () -> policy.requireConversationAccess(conv, UUID.randomUUID()));
    }

    @Test
    void group_access_denied_when_not_member() {
        UUID groupId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)).thenReturn(false);
        assertThrows(AccessDeniedException.class, () -> policy.requireGroupAccess(groupId, userId));
    }

    @Test
    void group_access_granted_for_member() {
        UUID groupId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        when(groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)).thenReturn(true);
        assertDoesNotThrow(() -> policy.requireGroupAccess(groupId, userId));
    }

    private UserProfile user(GlobalRole role, UUID id) {
        UserProfile u = new UserProfile();
        u.setId(id);
        u.setGlobalRole(role);
        return u;
    }
}
