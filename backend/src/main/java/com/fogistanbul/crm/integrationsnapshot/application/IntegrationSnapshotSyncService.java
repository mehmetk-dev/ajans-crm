package com.fogistanbul.crm.integrationsnapshot.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.googleanalytics.application.GoogleAnalyticsService;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.googleads.application.GoogleAdsService;
import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.instagram.application.InstagramOverviewService;
import com.fogistanbul.crm.instagram.application.InstagramMediaSnapshotService;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.metaads.application.MetaAdsService;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import com.fogistanbul.crm.searchconsole.application.SearchConsoleService;
import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class IntegrationSnapshotSyncService {

    private static final Logger log = LoggerFactory.getLogger(IntegrationSnapshotSyncService.class);
    private static final Duration WEB_INTERVAL = Duration.ofHours(6);
    private static final Duration SOCIAL_INTERVAL = Duration.ofHours(1);

    private final IntegrationSnapshotRepository snapshotRepository;
    private final CompanyRepository companyRepository;
    private final CompanyServiceRepository companyServiceRepository;
    private final GoogleAnalyticsService googleAnalyticsService;
    private final SearchConsoleService searchConsoleService;
    private final GoogleAdsService googleAdsService;
    private final MetaAdsService metaAdsService;
    private final InstagramOverviewService instagramOverviewService;
    private final InstagramMediaSnapshotService instagramMediaSnapshotService;
    private final IntegrationSnapshotPersistenceService persistenceService;
    private final ObjectMapper objectMapper;

    @Scheduled(
            initialDelayString = "${app.integration-snapshots.initial-delay-ms:60000}",
            fixedDelayString = "${app.integration-snapshots.fixed-delay-ms:1800000}")
    public void syncDueOverviewSnapshots() {
        for (Company company : companyRepository.findByKind(CompanyKind.CLIENT)) {
            syncCompanyOverviewSnapshots(company, false);
        }
    }

    public void syncOverviewSnapshotsNow(UUID companyId) {
        companyRepository.findById(companyId)
                .filter(company -> company.getKind() == CompanyKind.CLIENT)
                .ifPresent(company -> syncCompanyOverviewSnapshots(company, true));
    }

    public void syncGoogleAnalyticsSnapshotNow(UUID companyId) {
        companyRepository.findById(companyId)
                .filter(company -> company.getKind() == CompanyKind.CLIENT)
                .filter(company -> hasActiveService(company, ServiceCategory.DIGITAL_MARKETING))
                .ifPresent(company -> syncIfDue(
                        company,
                        IntegrationType.GOOGLE_ANALYTICS,
                        WEB_INTERVAL,
                        true,
                        () -> googleAnalyticsService.getOverview(company.getId(), null, null),
                        GaOverviewResponse::errorMessage));
    }

    public void syncInstagramSnapshotNow(UUID companyId) {
        companyRepository.findById(companyId)
                .filter(company -> company.getKind() == CompanyKind.CLIENT)
                .filter(company -> hasActiveService(company, ServiceCategory.SOCIAL_MEDIA))
                .ifPresent(company -> syncIfDue(
                        company,
                        IntegrationType.INSTAGRAM,
                        SOCIAL_INTERVAL,
                        true,
                        () -> instagramOverviewService.getOverview(company.getId(), null, null),
                        InstagramOverviewResponse::errorMessage));
    }

    public void syncSearchConsoleSnapshotNow(UUID companyId) {
        companyRepository.findById(companyId)
                .filter(company -> company.getKind() == CompanyKind.CLIENT)
                .filter(company -> hasActiveService(company, ServiceCategory.DIGITAL_MARKETING))
                .ifPresent(company -> syncIfDue(
                        company,
                        IntegrationType.SEARCH_CONSOLE,
                        WEB_INTERVAL,
                        true,
                        () -> searchConsoleService.getOverview(company.getId(), null, null),
                        ScOverviewResponse::errorMessage));
    }

    public void syncGoogleAdsSnapshotNow(UUID companyId) {
        companyRepository.findById(companyId)
                .filter(company -> company.getKind() == CompanyKind.CLIENT)
                .filter(company -> hasActiveService(company, ServiceCategory.AD_MANAGEMENT))
                .ifPresent(company -> syncIfDue(
                        company,
                        IntegrationType.GOOGLE_ADS,
                        WEB_INTERVAL,
                        true,
                        () -> googleAdsService.getOverview(company.getId(), null, null),
                        GoogleAdsOverviewResponse::errorMessage));
    }

    public void syncMetaAdsSnapshotNow(UUID companyId) {
        companyRepository.findById(companyId)
                .filter(company -> company.getKind() == CompanyKind.CLIENT)
                .filter(company -> hasActiveService(company, ServiceCategory.AD_MANAGEMENT))
                .ifPresent(company -> syncIfDue(
                        company,
                        IntegrationType.META_ADS,
                        WEB_INTERVAL,
                        true,
                        () -> metaAdsService.getOverview(company.getId(), null, null),
                        MetaAdsOverviewResponse::errorMessage));
    }

    private void syncCompanyOverviewSnapshots(Company company, boolean force) {
        if (hasActiveService(company, ServiceCategory.DIGITAL_MARKETING)) {
            syncIfDue(
                    company,
                    IntegrationType.GOOGLE_ANALYTICS,
                    WEB_INTERVAL,
                    force,
                    () -> googleAnalyticsService.getOverview(company.getId(), null, null),
                    GaOverviewResponse::errorMessage);
            syncIfDue(
                    company,
                    IntegrationType.SEARCH_CONSOLE,
                    WEB_INTERVAL,
                    force,
                    () -> searchConsoleService.getOverview(company.getId(), null, null),
                    ScOverviewResponse::errorMessage);
        }
        if (hasActiveService(company, ServiceCategory.SOCIAL_MEDIA)) {
            syncIfDue(
                    company,
                    IntegrationType.INSTAGRAM,
                    SOCIAL_INTERVAL,
                    force,
                    () -> instagramOverviewService.getOverview(company.getId(), null, null),
                    InstagramOverviewResponse::errorMessage);
            instagramMediaSnapshotService.syncMediaSnapshotsNow(company.getId(), force);
        }
        if (hasActiveService(company, ServiceCategory.AD_MANAGEMENT)) {
            syncIfDue(
                    company,
                    IntegrationType.GOOGLE_ADS,
                    WEB_INTERVAL,
                    force,
                    () -> googleAdsService.getOverview(company.getId(), null, null),
                    GoogleAdsOverviewResponse::errorMessage);
            syncIfDue(
                    company,
                    IntegrationType.META_ADS,
                    WEB_INTERVAL,
                    force,
                    () -> metaAdsService.getOverview(company.getId(), null, null),
                    MetaAdsOverviewResponse::errorMessage);
        }
    }

    private boolean hasActiveService(Company company, ServiceCategory serviceCategory) {
        return companyServiceRepository
                .findByCompanyIdAndServiceCategory(company.getId(), serviceCategory)
                .map(com.fogistanbul.crm.entity.CompanyService::isActive)
                .orElse(false);
    }

    private <T> void syncIfDue(
            Company company,
            IntegrationType integrationType,
            Duration interval,
            boolean force,
            Supplier<T> fetcher,
            Function<T, String> errorMessage) {
        Optional<IntegrationSnapshot> previous = snapshotRepository
                .findByCompanyIdAndIntegrationTypeAndSnapshotType(
                        company.getId(), integrationType, IntegrationSnapshotType.OVERVIEW);
        Instant now = Instant.now();
        if (!force && previous.flatMap(snapshot -> Optional.ofNullable(snapshot.getNextSyncAt()))
                .filter(nextSyncAt -> nextSyncAt.isAfter(now))
                .isPresent()) {
            return;
        }

        try {
            T response = fetcher.get();
            String error = errorMessage.apply(response);
            if (error != null && !error.isBlank()) {
                saveFailed(company, integrationType, interval, error);
                return;
            }
            saveReady(company, integrationType, interval, response);
        } catch (Exception exception) {
            String message = exception.getMessage() != null
                    ? exception.getMessage()
                    : exception.getClass().getSimpleName();
            log.warn("Integration snapshot sync failed, company={}, type={}: {}",
                    company.getId(), integrationType, message);
            saveFailed(company, integrationType, interval, message);
        }
    }

    private void saveReady(
            Company company,
            IntegrationType integrationType,
            Duration interval,
            Object response) {
        LocalDate today = LocalDate.now();
        persistenceService.saveReady(
                company,
                integrationType,
                IntegrationSnapshotType.OVERVIEW,
                objectMapper.convertValue(response, new TypeReference<Map<String, Object>>() {}),
                interval,
                today.minusDays(29),
                today);
    }

    private void saveFailed(
            Company company,
            IntegrationType integrationType,
            Duration interval,
            String errorMessage) {
        LocalDate today = LocalDate.now();
        persistenceService.saveFailed(
                company,
                integrationType,
                IntegrationSnapshotType.OVERVIEW,
                errorMessage,
                interval,
                today.minusDays(29),
                today);
    }
}
