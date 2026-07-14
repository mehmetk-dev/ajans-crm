package com.fogistanbul.crm.integrationsnapshot.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.dto.ClientIntegrationSnapshotOverviewResponse;
import com.fogistanbul.crm.integrationsnapshot.dto.IntegrationSnapshotMetaResponse;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class ClientIntegrationSnapshotService {

    private final IntegrationSnapshotRepository repository;
    private final CompanyAccessPolicy accessPolicy;
    private final CompanyServiceRepository companyServiceRepository;
    private final IntegrationSnapshotSyncService syncService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ClientIntegrationSnapshotOverviewResponse getOverview(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);

        boolean digitalMarketingActive = hasActiveService(companyId, ServiceCategory.DIGITAL_MARKETING);
        boolean socialMediaActive = hasActiveService(companyId, ServiceCategory.SOCIAL_MEDIA);
        boolean adManagementActive = hasActiveService(companyId, ServiceCategory.AD_MANAGEMENT);
        Optional<IntegrationSnapshot> ga = digitalMarketingActive
                ? latest(companyId, IntegrationType.GOOGLE_ANALYTICS)
                : Optional.empty();
        Optional<IntegrationSnapshot> sc = digitalMarketingActive
                ? latest(companyId, IntegrationType.SEARCH_CONSOLE)
                : Optional.empty();
        Optional<IntegrationSnapshot> ig = socialMediaActive
                ? latest(companyId, IntegrationType.INSTAGRAM)
                : Optional.empty();
        Optional<IntegrationSnapshot> ads = adManagementActive
                ? latest(companyId, IntegrationType.GOOGLE_ADS)
                : Optional.empty();
        Optional<IntegrationSnapshot> metaAds = adManagementActive
                ? latest(companyId, IntegrationType.META_ADS)
                : Optional.empty();

        return new ClientIntegrationSnapshotOverviewResponse(
                payloadOrDefault(ga, GaOverviewResponse.class, GaOverviewResponse::disabled),
                meta(ga),
                payloadOrDefault(sc, ScOverviewResponse.class, ScOverviewResponse::disabled),
                meta(sc),
                payloadOrDefault(ads, GoogleAdsOverviewResponse.class, GoogleAdsOverviewResponse::disabled),
                meta(ads),
                payloadOrDefault(metaAds, MetaAdsOverviewResponse.class, MetaAdsOverviewResponse::disabled),
                meta(metaAds),
                payloadOrDefault(ig, InstagramOverviewResponse.class, InstagramOverviewResponse::disabled),
                meta(ig));
    }

    public void refreshOverview(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);
        syncService.syncOverviewSnapshotsNow(companyId);
    }

    public void refreshGoogleAnalytics(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);
        syncService.syncGoogleAnalyticsSnapshotNow(companyId);
    }

    public void refreshInstagram(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);
        syncService.syncInstagramSnapshotNow(companyId);
    }

    public void refreshSearchConsole(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);
        syncService.syncSearchConsoleSnapshotNow(companyId);
    }

    public void refreshGoogleAds(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);
        syncService.syncGoogleAdsSnapshotNow(companyId);
    }

    public void refreshMetaAds(UUID userId, UUID companyId) {
        accessPolicy.requireMembership(userId, companyId);
        syncService.syncMetaAdsSnapshotNow(companyId);
    }

    private boolean hasActiveService(UUID companyId, ServiceCategory serviceCategory) {
        return companyServiceRepository
                .findByCompanyIdAndServiceCategory(companyId, serviceCategory)
                .map(com.fogistanbul.crm.entity.CompanyService::isActive)
                .orElse(false);
    }

    private Optional<IntegrationSnapshot> latest(UUID companyId, IntegrationType integrationType) {
        return repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, integrationType, IntegrationSnapshotType.OVERVIEW);
    }

    private <T> T payloadOrDefault(
            Optional<IntegrationSnapshot> snapshot,
            Class<T> responseType,
            Supplier<T> fallback) {
        if (snapshot.isEmpty()) {
            return fallback.get();
        }
        Map<String, Object> payload = snapshot.get().getPayload();
        if (payload == null || payload.isEmpty()) {
            return fallback.get();
        }
        return objectMapper.convertValue(payload, responseType);
    }

    private IntegrationSnapshotMetaResponse meta(Optional<IntegrationSnapshot> snapshot) {
        if (snapshot.isEmpty()) {
            return IntegrationSnapshotMetaResponse.pending();
        }
        IntegrationSnapshot value = snapshot.get();
        Instant now = Instant.now();
        boolean stale = value.getStatus() == IntegrationSnapshotStatus.FAILED
                || (value.getNextSyncAt() != null && value.getNextSyncAt().isBefore(now));
        return new IntegrationSnapshotMetaResponse(
                value.getStatus(),
                value.getLastSyncedAt(),
                value.getNextSyncAt(),
                stale,
                value.getErrorMessage());
    }
}
