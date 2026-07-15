package com.fogistanbul.crm.integrationsnapshot.infrastructure;

import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface IntegrationSnapshotRepository extends JpaRepository<IntegrationSnapshot, UUID> {

    @Query(value = """
            select 1
            from pg_advisory_xact_lock(
                hashtext(cast(:companyId as text)),
                hashtext(:snapshotKey)
            )
            """, nativeQuery = true)
    Integer lockCompanySnapshot(
            @Param("companyId") UUID companyId,
            @Param("snapshotKey") String snapshotKey);

    Optional<IntegrationSnapshot> findByCompanyIdAndIntegrationTypeAndSnapshotType(
            UUID companyId,
            IntegrationType integrationType,
            IntegrationSnapshotType snapshotType);

    void deleteByCompanyIdAndIntegrationType(UUID companyId, IntegrationType integrationType);
}
