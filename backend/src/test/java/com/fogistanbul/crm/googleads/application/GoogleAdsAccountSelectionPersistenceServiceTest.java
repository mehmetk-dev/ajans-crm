package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountOption;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAdsAccountSelectionPersistenceServiceTest {

    @Mock GoogleOAuthService oAuthService;
    @Mock IntegrationSnapshotRepository snapshotRepository;
    @InjectMocks GoogleAdsAccountSelectionPersistenceService service;

    @Test
    void changedReportingCustomerClearsStaleSnapshot() {
        UUID companyId = UUID.randomUUID();
        GoogleAdsAccountOption option = option();
        when(oAuthService.saveAdsAccountSelection(
                companyId, option.customerId(), option.loginCustomerId()))
                .thenReturn(true);

        service.persist(companyId, option);

        verify(snapshotRepository).deleteByCompanyIdAndIntegrationType(
                companyId, IntegrationType.GOOGLE_ADS);
    }

    @Test
    void unchangedReportingCustomerKeepsExistingSnapshot() {
        UUID companyId = UUID.randomUUID();
        GoogleAdsAccountOption option = option();
        when(oAuthService.saveAdsAccountSelection(
                companyId, option.customerId(), option.loginCustomerId()))
                .thenReturn(false);

        service.persist(companyId, option);

        verify(snapshotRepository, never()).deleteByCompanyIdAndIntegrationType(
                companyId, IntegrationType.GOOGLE_ADS);
    }

    private GoogleAdsAccountOption option() {
        return new GoogleAdsAccountOption(
                "2994497086", "Managed Co", "8437875152",
                "MANAGER", "Agency MCC", "ENABLED");
    }
}
