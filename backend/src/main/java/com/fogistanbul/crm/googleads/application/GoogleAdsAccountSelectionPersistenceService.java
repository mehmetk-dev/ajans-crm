package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountOption;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAdsAccountSelectionPersistenceService {

    private final GoogleOAuthService oAuthService;
    private final IntegrationSnapshotRepository snapshotRepository;

    @Transactional
    public void persist(UUID companyId, GoogleAdsAccountOption selected) {
        boolean customerChanged = oAuthService.saveAdsAccountSelection(
                companyId,
                selected.customerId(),
                selected.loginCustomerId());
        if (customerChanged) {
            snapshotRepository.deleteByCompanyIdAndIntegrationType(
                    companyId, IntegrationType.GOOGLE_ADS);
        }
    }
}
