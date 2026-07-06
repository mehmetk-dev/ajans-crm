package com.fogistanbul.crm.webdesign;

import com.fogistanbul.crm.webdesign.domain.PageSpeedSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PageSpeedSnapshotRepository extends JpaRepository<PageSpeedSnapshot, UUID> {
    @Query(value = """
            select 1
            from pg_advisory_xact_lock(hashtext(cast(:companyId as text)), hashtext(:strategy))
            """, nativeQuery = true)
    Integer lockCompanyStrategy(@Param("companyId") UUID companyId, @Param("strategy") String strategy);

    Optional<PageSpeedSnapshot> findByCompanyIdAndStrategy(UUID companyId, String strategy);
    List<PageSpeedSnapshot> findByCompanyId(UUID companyId);
}
