package com.fogistanbul.crm.metaads.application;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MetaAdsAccessPolicyTest {

    @Mock
    CompanyServiceAccessGuard serviceAccessGuard;

    @InjectMocks
    MetaAdsAccessPolicy policy;

    @Test
    void requireClientAccess_delegatesToAdManagementGuard() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        policy.requireClientAccess(userId, companyId);

        verify(serviceAccessGuard)
                .requireService(userId, companyId, ServiceCategory.AD_MANAGEMENT);
    }

    @Test
    void requireClientAccess_propagatesAccessDenied() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        doThrow(new AccessDeniedException("service disabled"))
                .when(serviceAccessGuard)
                .requireService(userId, companyId, ServiceCategory.AD_MANAGEMENT);

        assertThatThrownBy(() -> policy.requireClientAccess(userId, companyId))
                .isInstanceOf(AccessDeniedException.class);
    }
}
