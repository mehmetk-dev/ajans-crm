package com.fogistanbul.crm.files.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Task;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.note.domain.Note;
import com.fogistanbul.crm.note.infrastructure.NoteRepository;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.MessageRepository;
import com.fogistanbul.crm.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileAccessPolicyTest {

    @Mock TaskRepository taskRepository;
    @Mock NoteRepository noteRepository;
    @Mock MessageRepository messageRepository;
    @Mock CompanyRepository companyRepository;
    @Mock CompanyMembershipRepository membershipRepository;

    @InjectMocks FileAccessPolicy policy;

    @Test
    void admin_bypasses_entity_access_check() {
        UserProfile admin = user(GlobalRole.ADMIN);
        assertDoesNotThrow(() -> policy.requireEntityAccess("TASK", UUID.randomUUID(), admin));
        assertDoesNotThrow(() -> policy.requireEntityAccess("COMPANY", UUID.randomUUID(), admin));
    }

    @Test
    void staff_can_access_task_entity_when_company_member() {
        UUID companyId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Company company = new Company();
        company.setId(companyId);
        Task task = new Task();
        task.setCompany(company);

        UserProfile staff = user(GlobalRole.AGENCY_STAFF);
        staff.setId(userId);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(membershipRepository.existsByUserIdAndCompanyId(userId, companyId)).thenReturn(true);

        assertDoesNotThrow(() -> policy.requireEntityAccess("TASK", taskId, staff));
    }

    @Test
    void staff_denied_task_entity_when_not_company_member() {
        UUID companyId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Company company = new Company();
        company.setId(companyId);
        Task task = new Task();
        task.setCompany(company);

        UserProfile staff = user(GlobalRole.AGENCY_STAFF);
        staff.setId(userId);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(membershipRepository.existsByUserIdAndCompanyId(userId, companyId)).thenReturn(false);

        assertThrows(AccessDeniedException.class,
                () -> policy.requireEntityAccess("TASK", taskId, staff));
    }

    @Test
    void owner_can_delete_own_file() {
        UUID userId = UUID.randomUUID();
        UserProfile user = user(GlobalRole.AGENCY_STAFF);
        user.setId(userId);

        assertDoesNotThrow(() -> policy.requireDeleteAccess(user, userId));
    }

    @Test
    void non_owner_cannot_delete_others_file() {
        UserProfile user = user(GlobalRole.AGENCY_STAFF);
        user.setId(UUID.randomUUID());

        assertThrows(AccessDeniedException.class,
                () -> policy.requireDeleteAccess(user, UUID.randomUUID()));
    }

    @Test
    void admin_can_delete_any_file() {
        UserProfile admin = user(GlobalRole.ADMIN);
        assertDoesNotThrow(() -> policy.requireDeleteAccess(admin, UUID.randomUUID()));
    }

    private UserProfile user(GlobalRole role) {
        UserProfile u = new UserProfile();
        u.setId(UUID.randomUUID());
        u.setGlobalRole(role);
        return u;
    }
}
