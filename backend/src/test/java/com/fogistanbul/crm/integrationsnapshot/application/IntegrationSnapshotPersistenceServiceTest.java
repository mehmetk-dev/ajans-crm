package com.fogistanbul.crm.integrationsnapshot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IntegrationSnapshotPersistenceServiceTest {

    @Mock
    IntegrationSnapshotRepository repository;

    IntegrationSnapshotPersistenceService service;

    @BeforeEach
    void setUp() {
        service = new IntegrationSnapshotPersistenceService(repository);
    }

    @Test
    void saveReady_locksLogicalSnapshotBeforeInsert() {
        Company company = company();
        when(repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.INSTAGRAM, IntegrationSnapshotType.REELS))
                .thenReturn(Optional.empty());

        service.saveReady(
                company,
                IntegrationType.INSTAGRAM,
                IntegrationSnapshotType.REELS,
                Map.of("items", java.util.List.of()),
                Duration.ofHours(1),
                LocalDate.parse("2026-07-01"),
                LocalDate.parse("2026-07-14"));

        InOrder order = inOrder(repository);
        order.verify(repository).lockCompanySnapshot(
                company.getId(), "INSTAGRAM:REELS");
        order.verify(repository).findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.INSTAGRAM, IntegrationSnapshotType.REELS);
        order.verify(repository).save(any(IntegrationSnapshot.class));
    }

    @Test
    void saveFailed_preservesLastSuccessfulPayloadAndTimestamp() {
        Company company = company();
        Instant previousSync = Instant.parse("2026-07-14T09:00:00Z");
        Map<String, Object> previousPayload = Map.of("items", java.util.List.of(Map.of("id", "1")));
        IntegrationSnapshot previous = IntegrationSnapshot.builder()
                .company(company)
                .integrationType(IntegrationType.INSTAGRAM)
                .snapshotType(IntegrationSnapshotType.POSTS)
                .status(IntegrationSnapshotStatus.READY)
                .payload(previousPayload)
                .lastSyncedAt(previousSync)
                .build();
        when(repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.INSTAGRAM, IntegrationSnapshotType.POSTS))
                .thenReturn(Optional.of(previous));

        service.saveFailed(
                company,
                IntegrationType.INSTAGRAM,
                IntegrationSnapshotType.POSTS,
                "Meta unavailable",
                Duration.ofHours(1),
                LocalDate.parse("2026-07-01"),
                LocalDate.parse("2026-07-14"));

        assertThat(previous.getStatus()).isEqualTo(IntegrationSnapshotStatus.FAILED);
        assertThat(previous.getPayload()).isEqualTo(previousPayload);
        assertThat(previous.getLastSyncedAt()).isEqualTo(previousSync);
        assertThat(previous.getErrorMessage()).isEqualTo("Meta unavailable");
        verify(repository).save(previous);
    }

    private Company company() {
        return Company.builder()
                .id(UUID.randomUUID())
                .name("Client")
                .build();
    }
}
