package com.fogistanbul.crm.prproject.application;

import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.PrProject;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.PrProjectMemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PrProjectAccessPolicyTest {

    @Mock
    private CompanyAccessPolicy companyAccessPolicy;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private PrProjectMemberRepository memberRepository;

    @Test
    void companyProjectUsesSharedCompanyPolicy() {
        PrProjectAccessPolicy policy = policy();
        UserProfile user = user(GlobalRole.AGENCY_STAFF);
        UUID companyId = UUID.randomUUID();

        policy.requireRead(project(companyId, UUID.randomUUID()), user);

        verify(companyAccessPolicy).requireAccess(user, companyId);
    }

    @Test
    void creatorCanReadCompanylessProject() {
        PrProjectAccessPolicy policy = policy();
        UserProfile creator = user(GlobalRole.AGENCY_STAFF);

        assertDoesNotThrow(() -> policy.requireRead(project(null, creator.getId()), creator));
    }

    @Test
    void unrelatedUserCannotReadCompanylessProject() {
        PrProjectAccessPolicy policy = policy();

        assertThrows(AccessDeniedException.class, () ->
                policy.requireRead(
                        project(null, UUID.randomUUID()),
                        user(GlobalRole.AGENCY_STAFF)));
    }

    private PrProjectAccessPolicy policy() {
        return new PrProjectAccessPolicy(
                companyAccessPolicy, membershipRepository, memberRepository);
    }

    private PrProject project(UUID companyId, UUID creatorId) {
        return PrProject.builder()
                .id(UUID.randomUUID())
                .company(companyId != null ? Company.builder().id(companyId).build() : null)
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
