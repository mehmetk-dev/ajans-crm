package com.fogistanbul.crm.task.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class TaskAccessPolicyTest {

    @Mock
    private CompanyAccessPolicy companyAccessPolicy;

    @Test
    void companyMemberCanReadCompanyTaskWithoutBeingParticipant() {
        TaskAccessPolicy policy = new TaskAccessPolicy(companyAccessPolicy);
        UserProfile user = user(GlobalRole.COMPANY_USER);
        UUID companyId = UUID.randomUUID();
        Task task = task(companyId, UUID.randomUUID(), UUID.randomUUID());

        assertDoesNotThrow(() -> policy.requireRead(task, user));
        verify(companyAccessPolicy).requireAccess(user, companyId);
    }

    @Test
    void unrelatedUserCannotReadAgencyTask() {
        TaskAccessPolicy policy = new TaskAccessPolicy(companyAccessPolicy);
        UserProfile user = user(GlobalRole.AGENCY_STAFF);
        Task task = task(null, UUID.randomUUID(), UUID.randomUUID());

        assertThrows(AccessDeniedException.class, () -> policy.requireRead(task, user));
        verifyNoInteractions(companyAccessPolicy);
    }

    @Test
    void companyUserCannotAssignAnotherCompanyUser() {
        TaskAccessPolicy policy = new TaskAccessPolicy(companyAccessPolicy);
        UserProfile creator = user(GlobalRole.COMPANY_USER);
        UserProfile assignee = user(GlobalRole.COMPANY_USER);

        assertThrows(
                AccessDeniedException.class,
                () -> policy.requireAssignable(creator, assignee, UUID.randomUUID())
        );
    }

    @Test
    void connectedAgencyStaffCanBeAssignedByCompanyUser() {
        TaskAccessPolicy policy = new TaskAccessPolicy(companyAccessPolicy);
        UserProfile creator = user(GlobalRole.COMPANY_USER);
        UserProfile assignee = user(GlobalRole.AGENCY_STAFF);
        UUID companyId = UUID.randomUUID();

        assertDoesNotThrow(() -> policy.requireAssignable(creator, assignee, companyId));
        verify(companyAccessPolicy).requireAccess(creator, companyId);
        verify(companyAccessPolicy).requireMembership(assignee.getId(), companyId);
    }

    private Task task(UUID companyId, UUID assigneeId, UUID creatorId) {
        return Task.builder()
                .company(companyId == null ? null : Company.builder().id(companyId).build())
                .assignedTo(UserProfile.builder().id(assigneeId).build())
                .createdBy(UserProfile.builder().id(creatorId).build())
                .build();
    }

    private UserProfile user(GlobalRole role) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(role)
                .email("user@example.com")
                .build();
    }
}
