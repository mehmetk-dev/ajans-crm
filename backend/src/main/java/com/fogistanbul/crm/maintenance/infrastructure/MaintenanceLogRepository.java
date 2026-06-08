package com.fogistanbul.crm.maintenance.infrastructure;

import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLogEntry, UUID> {
    List<MaintenanceLogEntry> findByCompanyIdOrderByPerformedAtDesc(UUID companyId);

    List<MaintenanceLogEntry> findByCompanyIdInOrderByPerformedAtDesc(List<UUID> companyIds);
}
