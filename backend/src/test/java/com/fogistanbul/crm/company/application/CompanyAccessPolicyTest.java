package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyAccessPolicyTest {

    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Test
    void adminCanAccessCompanyWithoutMembership() {
        CompanyAccessPolicy policy = new CompanyAccessPolicy(membershipRepository);
        UserProfile admin = user(GlobalRole.ADMIN);

        assertDoesNotThrow(() -> policy.requireAccess(admin, UUID.randomUUID()));
        verifyNoInteractions(membershipRepository);
    }

    @Test
    void nonAdminMustHaveMembership() {
        CompanyAccessPolicy policy = new CompanyAccessPolicy(membershipRepository);
        UserProfile staff = user(GlobalRole.AGENCY_STAFF);
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.existsByUserIdAndCompanyId(staff.getId(), companyId)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> policy.requireAccess(staff, companyId));
    }

    @Test
    void accessibleCompaniesComeFromClientMemberships() {
        CompanyAccessPolicy policy = new CompanyAccessPolicy(membershipRepository);
        UserProfile user = user(GlobalRole.COMPANY_USER);
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(membershipRepository.findClientCompanyIdsForUser(user.getId())).thenReturn(companyIds);

        assertEquals(companyIds, policy.accessibleClientCompanyIds(user));
        verify(membershipRepository).findClientCompanyIdsForUser(user.getId());
    }

    private UserProfile user(GlobalRole role) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(role)
                .email("user@example.com")
                .passwordHash("hash")
                .build();
    }
}
