package com.fogistanbul.crm.repository;

import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.enums.ShootStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ShootRepository extends JpaRepository<Shoot, UUID> {
    Page<Shoot> findByCompanyId(UUID companyId, Pageable pageable);
    Page<Shoot> findByCompanyIdIn(List<UUID> companyIds, Pageable pageable);
    List<Shoot> findByCompanyIdIn(List<UUID> companyIds);

    @Query("""
            SELECT s
            FROM Shoot s
            JOIN FETCH s.company
            WHERE s.status = :status
              AND s.shootDate >= :startsAt
              AND s.shootDate < :endsBefore
              AND s.reminderSentAt IS NULL
              AND s.createdAt <= :createdBefore
            """)
    List<Shoot> findReminderCandidates(
            @Param("status") ShootStatus status,
            @Param("startsAt") Instant startsAt,
            @Param("endsBefore") Instant endsBefore,
            @Param("createdBefore") Instant createdBefore);
}
