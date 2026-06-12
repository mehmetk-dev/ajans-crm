package com.fogistanbul.crm.googleanalytics.application;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleAnalyticsAccessPolicyTest {

    @Mock
    CompanyServiceAccessGuard serviceAccessGuard;

    @InjectMocks
    GoogleAnalyticsAccessPolicy policy;

    @Test
    void requireClientAccess_validUser_delegatesToGuard() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        assertThatNoException().isThrownBy(() -> policy.requireClientAccess(userId, companyId));

        verify(serviceAccessGuard).requireService(userId, companyId, ServiceCategory.DIGITAL_MARKETING);
    }

    @Test
    void requireClientAccess_serviceNotActive_propagatesAccessDenied() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        doThrow(new AccessDeniedException("DIGITAL_MARKETING servisi aktif degil"))
                .when(serviceAccessGuard).requireService(userId, companyId, ServiceCategory.DIGITAL_MARKETING);

        assertThatThrownBy(() -> policy.requireClientAccess(userId, companyId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("DIGITAL_MARKETING");
    }

    @Test
    void requireClientAccess_differentCompany_callsGuardWithCorrectArgs() {
        UUID userId = UUID.randomUUID();
        UUID company1 = UUID.randomUUID();
        UUID company2 = UUID.randomUUID();

        policy.requireClientAccess(userId, company1);
        policy.requireClientAccess(userId, company2);

        verify(serviceAccessGuard).requireService(userId, company1, ServiceCategory.DIGITAL_MARKETING);
        verify(serviceAccessGuard).requireService(userId, company2, ServiceCategory.DIGITAL_MARKETING);
    }
}
