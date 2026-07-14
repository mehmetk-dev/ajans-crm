package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.CompanyMembership;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.MembershipRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentPlanAccessPolicyTest {

    @Mock
    private CompanyAccessPolicy companyAccessPolicy;
    @Mock
    private CompanyServiceAccessGuard serviceAccessGuard;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    @Test
    void clientReadRequiresContentMarketingService() {
        ContentPlanAccessPolicy policy = policy();
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        policy.requireClientService(userId, companyId);

        verify(serviceAccessGuard).requireService(
                userId, companyId, ServiceCategory.CONTENT_MARKETING);
    }

    @Test
    void agencyStaffCanManageAccessiblePlan() {
        ContentPlanAccessPolicy policy = policy();
        UserProfile staff = UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(GlobalRole.AGENCY_STAFF)
                .build();

        assertDoesNotThrow(() -> policy.requireManage(plan(), staff));
    }

    @Test
    void companyUserCannotManagePlan() {
        ContentPlanAccessPolicy policy = policy();
        UserProfile client = UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(GlobalRole.COMPANY_USER)
                .build();

        assertThrows(AccessDeniedException.class, () -> policy.requireManage(plan(), client));
    }

    @Test
    void ownerCanRequestAdditionalServices() {
        ContentPlanAccessPolicy policy = policy();
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findByUserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.of(CompanyMembership.builder()
                        .membershipRole(MembershipRole.OWNER)
                        .build()));

        assertDoesNotThrow(() -> policy.requireOwner(userId, companyId));
    }

    @Test
    void employeeCannotRequestAdditionalServices() {
        ContentPlanAccessPolicy policy = policy();
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findByUserIdAndCompanyId(userId, companyId))
                .thenReturn(Optional.of(CompanyMembership.builder()
                        .membershipRole(MembershipRole.EMPLOYEE)
                        .build()));

        assertThrows(AccessDeniedException.class, () -> policy.requireOwner(userId, companyId));
    }

    private ContentPlanAccessPolicy policy() {
        return new ContentPlanAccessPolicy(
                companyAccessPolicy, serviceAccessGuard, membershipRepository);
    }

    private ContentPlan plan() {
        return ContentPlan.builder()
                .company(Company.builder().id(UUID.randomUUID()).build())
                .build();
    }
}
