package com.fogistanbul.crm.integrationsnapshot.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.googleanalytics.application.GoogleAnalyticsService;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.instagram.application.InstagramOverviewService;
import com.fogistanbul.crm.instagram.application.InstagramMediaSnapshotService;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import com.fogistanbul.crm.searchconsole.application.SearchConsoleService;
import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private static final Duration WEB_INTERVAL = Duration.ofHours(2);
    private static final Duration SOCIAL_INTERVAL = Duration.ofHours(1);

    private final IntegrationSnapshotRepository snapshotRepository;
    private final CompanyRepository companyRepository;
    private final CompanyServiceRepository companyServiceRepository;
    private final GoogleAnalyticsService googleAnalyticsService;
    private final SearchConsoleService searchConsoleService;
    private final InstagramOverviewService instagramOverviewService;
    private final InstagramMediaSnapshotService instagramMediaSnapshotService;
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
                saveFailed(company, integrationType, interval, previous, error);
                return;
            }
            saveReady(company, integrationType, interval, previous, response);
        } catch (Exception exception) {
            String message = exception.getMessage() != null
                    ? exception.getMessage()
                    : exception.getClass().getSimpleName();
            log.warn("Integration snapshot sync failed, company={}, type={}: {}",
                    company.getId(), integrationType, message);
            saveFailed(company, integrationType, interval, previous, message);
        }
    }

    @Transactional
    protected void saveReady(
            Company company,
            IntegrationType integrationType,
            Duration interval,
            Optional<IntegrationSnapshot> previous,
            Object response) {
        Instant now = Instant.now();
        IntegrationSnapshot snapshot = previous.orElseGet(() -> baseSnapshot(company, integrationType).build());
        snapshot.setStatus(IntegrationSnapshotStatus.READY);
        snapshot.setPayload(objectMapper.convertValue(
                response,
                new TypeReference<Map<String, Object>>() {}));
        snapshot.setLastSyncedAt(now);
        snapshot.setNextSyncAt(now.plus(interval));
        snapshot.setErrorMessage(null);
        applyDefaultPeriod(snapshot);
        snapshotRepository.save(snapshot);
    }

    @Transactional
    protected void saveFailed(
            Company company,
            IntegrationType integrationType,
            Duration interval,
            Optional<IntegrationSnapshot> previous,
            String errorMessage) {
        Instant now = Instant.now();
        IntegrationSnapshot snapshot = previous.orElseGet(() -> baseSnapshot(company, integrationType).build());
        snapshot.setStatus(IntegrationSnapshotStatus.FAILED);
        snapshot.setPayload(previous.map(IntegrationSnapshot::getPayload).orElse(Map.of()));
        snapshot.setLastSyncedAt(previous.map(IntegrationSnapshot::getLastSyncedAt).orElse(null));
        snapshot.setNextSyncAt(now.plus(interval));
        snapshot.setErrorMessage(errorMessage);
        applyDefaultPeriod(snapshot);
        snapshotRepository.save(snapshot);
    }

    private IntegrationSnapshot.IntegrationSnapshotBuilder baseSnapshot(
            Company company,
            IntegrationType integrationType) {
        return IntegrationSnapshot.builder()
                .company(company)
                .integrationType(integrationType)
                .snapshotType(IntegrationSnapshotType.OVERVIEW);
    }

    private void applyDefaultPeriod(IntegrationSnapshot snapshot) {
        LocalDate today = LocalDate.now();
        snapshot.setPeriodStart(today.minusDays(30));
        snapshot.setPeriodEnd(today);
    }
}
