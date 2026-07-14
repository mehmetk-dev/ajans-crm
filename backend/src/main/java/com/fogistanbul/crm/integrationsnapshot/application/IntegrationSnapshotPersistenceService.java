package com.fogistanbul.crm.integrationsnapshot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IntegrationSnapshotPersistenceService {

    private final IntegrationSnapshotRepository repository;

    @Transactional
    public void saveReady(
            Company company,
            IntegrationType integrationType,
            IntegrationSnapshotType snapshotType,
            Map<String, Object> payload,
            Duration interval,
            LocalDate periodStart,
            LocalDate periodEnd) {
        IntegrationSnapshot snapshot = lockedSnapshot(company, integrationType, snapshotType);
        Instant now = Instant.now();
        snapshot.setStatus(IntegrationSnapshotStatus.READY);
        snapshot.setPayload(payload);
        snapshot.setLastSyncedAt(now);
        snapshot.setNextSyncAt(now.plus(interval));
        snapshot.setErrorMessage(null);
        snapshot.setPeriodStart(periodStart);
        snapshot.setPeriodEnd(periodEnd);
        repository.save(snapshot);
    }

    @Transactional
    public void saveFailed(
            Company company,
            IntegrationType integrationType,
            IntegrationSnapshotType snapshotType,
            String errorMessage,
            Duration retryInterval,
            LocalDate periodStart,
            LocalDate periodEnd) {
        IntegrationSnapshot snapshot = lockedSnapshot(company, integrationType, snapshotType);
        Instant now = Instant.now();
        snapshot.setStatus(IntegrationSnapshotStatus.FAILED);
        if (snapshot.getPayload() == null) {
            snapshot.setPayload(Map.of());
        }
        snapshot.setNextSyncAt(now.plus(retryInterval));
        snapshot.setErrorMessage(errorMessage);
        snapshot.setPeriodStart(periodStart);
        snapshot.setPeriodEnd(periodEnd);
        repository.save(snapshot);
    }

    private IntegrationSnapshot lockedSnapshot(
            Company company,
            IntegrationType integrationType,
            IntegrationSnapshotType snapshotType) {
        UUID companyId = company.getId();
        repository.lockCompanySnapshot(
                companyId,
                integrationType.name() + ":" + snapshotType.name());
        return repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                        companyId, integrationType, snapshotType)
                .orElseGet(() -> IntegrationSnapshot.builder()
                        .company(company)
                        .integrationType(integrationType)
                        .snapshotType(snapshotType)
                        .build());
    }
}
