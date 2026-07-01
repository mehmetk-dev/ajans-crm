package com.fogistanbul.crm.integrationsnapshot.infrastructure;

import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IntegrationSnapshotRepository extends JpaRepository<IntegrationSnapshot, UUID> {

    Optional<IntegrationSnapshot> findByCompanyIdAndIntegrationTypeAndSnapshotType(
            UUID companyId,
            IntegrationType integrationType,
            IntegrationSnapshotType snapshotType);
}
