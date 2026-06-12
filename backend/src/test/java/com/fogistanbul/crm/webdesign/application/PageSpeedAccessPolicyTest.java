package com.fogistanbul.crm.webdesign.application;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PageSpeedAccessPolicyTest {

    @Mock
    CompanyMembershipRepository membershipRepository;

    @Mock
    CompanyServiceAccessGuard serviceAccessGuard;

    @InjectMocks
    PageSpeedAccessPolicy policy;

    // --- requireStaffReadAccess ---

    @Test
    void requireStaffReadAccess_adminRole_passes() {
        assertThatNoException().isThrownBy(() -> policy.requireStaffReadAccess("ROLE_ADMIN"));
    }

    @Test
    void requireStaffReadAccess_agencyStaffRole_passes() {
        assertThatNoException().isThrownBy(() -> policy.requireStaffReadAccess("ROLE_AGENCY_STAFF"));
    }

    @Test
    void requireStaffReadAccess_clientRole_throws() {
        assertThatThrownBy(() -> policy.requireStaffReadAccess("ROLE_CLIENT"))
                .isInstanceOf(AccessDeniedException.class);
    }

    // --- resolveClientCompanyWithAccess ---

    @Test
    void resolveClientCompanyWithAccess_noCompany_returnsEmpty() {
        UUID userId = UUID.randomUUID();
        when(membershipRepository.findClientCompanyIdsForUser(userId)).thenReturn(List.of());

        Optional<UUID> result = policy.resolveClientCompanyWithAccess(userId);

        assertThat(result).isEmpty();
        verifyNoInteractions(serviceAccessGuard);
    }

    @Test
    void resolveClientCompanyWithAccess_withCompany_callsGuardAndReturnsId() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findClientCompanyIdsForUser(userId)).thenReturn(List.of(companyId));

        Optional<UUID> result = policy.resolveClientCompanyWithAccess(userId);

        assertThat(result).hasValue(companyId);
        verify(serviceAccessGuard).requireService(userId, companyId, ServiceCategory.WEB_DESIGN);
    }

    @Test
    void resolveClientCompanyWithAccess_serviceNotActive_throwsAccessDenied() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(membershipRepository.findClientCompanyIdsForUser(userId)).thenReturn(List.of(companyId));
        doThrow(new AccessDeniedException("not active"))
                .when(serviceAccessGuard).requireService(userId, companyId, ServiceCategory.WEB_DESIGN);

        assertThatThrownBy(() -> policy.resolveClientCompanyWithAccess(userId))
                .isInstanceOf(AccessDeniedException.class);
    }
}
