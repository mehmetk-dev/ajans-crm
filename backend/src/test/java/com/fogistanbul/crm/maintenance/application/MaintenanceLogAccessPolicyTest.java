package com.fogistanbul.crm.maintenance.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaintenanceLogAccessPolicyTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Test
    void adminCanManageWithoutMembership() {
        MaintenanceLogAccessPolicy policy = policy();
        UserProfile admin = user(GlobalRole.ADMIN);

        assertDoesNotThrow(() -> policy.requireManageAccess(admin, UUID.randomUUID()));
        verifyNoInteractions(membershipRepository);
    }

    @Test
    void staffNeedsCompanyMembership() {
        MaintenanceLogAccessPolicy policy = policy();
        UserProfile staff = user(GlobalRole.AGENCY_STAFF);
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.existsByUserIdAndCompanyId(staff.getId(), companyId)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> policy.requireManageAccess(staff, companyId));
    }

    @Test
    void companyUserCannotManageLog() {
        MaintenanceLogAccessPolicy policy = policy();

        assertThrows(
                AccessDeniedException.class,
                () -> policy.requireManageAccess(user(GlobalRole.COMPANY_USER), UUID.randomUUID())
        );
        verifyNoInteractions(membershipRepository);
    }

    @Test
    void entryMustBelongToCompanyFromRoute() {
        MaintenanceLogAccessPolicy policy = policy();
        MaintenanceLogEntry entry = MaintenanceLogEntry.builder()
                .company(Company.builder().id(UUID.randomUUID()).build())
                .build();

        assertThrows(
                AccessDeniedException.class,
                () -> policy.requireEntryCompany(entry, UUID.randomUUID())
        );
        assertDoesNotThrow(() -> policy.requireEntryCompany(entry, entry.getCompany().getId()));
    }

    private UserProfile user(GlobalRole role) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(role)
                .email("user@example.com")
                .passwordHash("hash")
                .build();
    }

    private MaintenanceLogAccessPolicy policy() {
        return new MaintenanceLogAccessPolicy(new CompanyAccessPolicy(membershipRepository));
    }
}
