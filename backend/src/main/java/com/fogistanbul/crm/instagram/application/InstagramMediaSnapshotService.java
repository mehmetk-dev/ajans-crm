package com.fogistanbul.crm.instagram.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.PostRow;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.ReelRow;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class InstagramMediaSnapshotService {

    private static final Logger log = LoggerFactory.getLogger(InstagramMediaSnapshotService.class);
    private static final Duration MEDIA_INTERVAL = Duration.ofHours(1);
    private static final int SNAPSHOT_LIMIT = 24;

    private final IntegrationSnapshotRepository snapshotRepository;
    private final CompanyRepository companyRepository;
    private final InstagramMediaService mediaService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<ReelRow> getReels(UUID companyId, int limit) {
        return snapshotItems(
                companyId,
                IntegrationSnapshotType.REELS,
                new TypeReference<List<ReelRow>>() {})
                .map(items -> limitItems(items, limit))
                .orElseGet(() -> mediaService.getReelsPreview(companyId, limit));
    }

    @Transactional(readOnly = true)
    public List<PostRow> getPosts(UUID companyId, int limit) {
        return snapshotItems(
                companyId,
                IntegrationSnapshotType.POSTS,
                new TypeReference<List<PostRow>>() {})
                .map(items -> limitItems(items, limit))
                .orElseGet(() -> mediaService.getPostsPreview(companyId, limit));
    }

    public void syncMediaSnapshotsNow(UUID companyId, boolean force) {
        companyRepository.findById(companyId)
                .ifPresent(company -> {
                    syncSnapshot(
                            company,
                            IntegrationSnapshotType.REELS,
                            force,
                            () -> mediaService.getReels(companyId, SNAPSHOT_LIMIT));
                    syncSnapshot(
                            company,
                            IntegrationSnapshotType.POSTS,
                            force,
                            () -> mediaService.getPosts(companyId, SNAPSHOT_LIMIT));
                });
    }

    private <T> Optional<List<T>> snapshotItems(
            UUID companyId,
            IntegrationSnapshotType snapshotType,
            TypeReference<List<T>> typeReference) {
        return snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                        companyId, IntegrationType.INSTAGRAM, snapshotType)
                .flatMap(snapshot -> {
                    Map<String, Object> payload = snapshot.getPayload();
                    if (payload == null || !payload.containsKey("items")) {
                        return Optional.empty();
                    }
                    return Optional.of(objectMapper.convertValue(payload.get("items"), typeReference));
                });
    }

    private <T> List<T> limitItems(List<T> items, int limit) {
        int safeLimit = Math.max(0, limit);
        if (items.size() <= safeLimit) {
            return items;
        }
        return items.subList(0, safeLimit);
    }

    private <T> void syncSnapshot(
            Company company,
            IntegrationSnapshotType snapshotType,
            boolean force,
            Supplier<List<T>> fetcher) {
        Optional<IntegrationSnapshot> previous = snapshotRepository
                .findByCompanyIdAndIntegrationTypeAndSnapshotType(
                        company.getId(), IntegrationType.INSTAGRAM, snapshotType);
        Instant now = Instant.now();
        if (!force && previous.flatMap(snapshot -> Optional.ofNullable(snapshot.getNextSyncAt()))
                .filter(nextSyncAt -> nextSyncAt.isAfter(now))
                .isPresent()) {
            return;
        }

        try {
            saveReady(company, snapshotType, previous, fetcher.get());
        } catch (Exception exception) {
            String message = exception.getMessage() != null
                    ? exception.getMessage()
                    : exception.getClass().getSimpleName();
            log.warn("Instagram media snapshot sync failed, company={}, type={}: {}",
                    company.getId(), snapshotType, message);
            saveFailed(company, snapshotType, previous, message);
        }
    }

    @Transactional
    protected <T> void saveReady(
            Company company,
            IntegrationSnapshotType snapshotType,
            Optional<IntegrationSnapshot> previous,
            List<T> items) {
        Instant now = Instant.now();
        IntegrationSnapshot snapshot = previous.orElseGet(() -> baseSnapshot(company, snapshotType));
        snapshot.setStatus(IntegrationSnapshotStatus.READY);
        snapshot.setPayload(Map.of("items", objectMapper.convertValue(
                items,
                new TypeReference<List<Map<String, Object>>>() {})));
        snapshot.setLastSyncedAt(now);
        snapshot.setNextSyncAt(now.plus(MEDIA_INTERVAL));
        snapshot.setErrorMessage(null);
        applyDefaultPeriod(snapshot);
        snapshotRepository.save(snapshot);
    }

    @Transactional
    protected void saveFailed(
            Company company,
            IntegrationSnapshotType snapshotType,
            Optional<IntegrationSnapshot> previous,
            String errorMessage) {
        Instant now = Instant.now();
        IntegrationSnapshot snapshot = previous.orElseGet(() -> baseSnapshot(company, snapshotType));
        snapshot.setStatus(IntegrationSnapshotStatus.FAILED);
        snapshot.setPayload(previous.map(IntegrationSnapshot::getPayload).orElse(Map.of()));
        snapshot.setLastSyncedAt(previous.map(IntegrationSnapshot::getLastSyncedAt).orElse(null));
        snapshot.setNextSyncAt(now.plus(MEDIA_INTERVAL));
        snapshot.setErrorMessage(errorMessage);
        applyDefaultPeriod(snapshot);
        snapshotRepository.save(snapshot);
    }

    private IntegrationSnapshot baseSnapshot(Company company, IntegrationSnapshotType snapshotType) {
        return IntegrationSnapshot.builder()
                .company(company)
                .integrationType(IntegrationType.INSTAGRAM)
                .snapshotType(snapshotType)
                .build();
    }

    private void applyDefaultPeriod(IntegrationSnapshot snapshot) {
        LocalDate today = LocalDate.now();
        snapshot.setPeriodStart(today.minusDays(30));
        snapshot.setPeriodEnd(today);
    }
}
