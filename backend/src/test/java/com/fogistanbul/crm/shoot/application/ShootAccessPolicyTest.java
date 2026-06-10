package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShootAccessPolicyTest {

    @Mock
    private CompanyAccessPolicy companyAccessPolicy;
    @Mock
    private CompanyServiceAccessGuard serviceAccessGuard;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Test
    void readUsesCompanyAccessPolicy() {
        ShootAccessPolicy policy = policy();
        UserProfile user = user(GlobalRole.COMPANY_USER);
        UUID companyId = UUID.randomUUID();

        assertDoesNotThrow(() -> policy.requireRead(shoot(companyId, UUID.randomUUID()), user));

        verify(companyAccessPolicy).requireAccess(user, companyId);
    }

    @Test
    void agencyStaffCanManageAccessibleShoot() {
        ShootAccessPolicy policy = policy();
        UserProfile staff = user(GlobalRole.AGENCY_STAFF);

        assertDoesNotThrow(() -> policy.requireManage(
                shoot(UUID.randomUUID(), UUID.randomUUID()), staff));
    }

    @Test
    void companyUserCannotManageShootCreatedByAnotherUser() {
        ShootAccessPolicy policy = policy();
        UserProfile user = user(GlobalRole.COMPANY_USER);

        assertThrows(AccessDeniedException.class, () -> policy.requireManage(
                shoot(UUID.randomUUID(), UUID.randomUUID()), user));
    }

    @Test
    void clientCompaniesAreFilteredByProductionService() {
        ShootAccessPolicy policy = policy();
        UUID userId = UUID.randomUUID();
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(serviceAccessGuard.accessibleClientCompanies(userId, ServiceCategory.PRODUCTION))
                .thenReturn(companyIds);

        assertEquals(companyIds, policy.accessibleClientCompanyIds(userId));
    }

    private ShootAccessPolicy policy() {
        return new ShootAccessPolicy(companyAccessPolicy, serviceAccessGuard, membershipRepository);
    }

    private Shoot shoot(UUID companyId, UUID creatorId) {
        return Shoot.builder()
                .company(Company.builder().id(companyId).build())
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
