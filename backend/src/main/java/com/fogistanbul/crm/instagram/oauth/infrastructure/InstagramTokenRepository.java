package com.fogistanbul.crm.instagram.oauth.infrastructure;

import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InstagramTokenRepository extends JpaRepository<InstagramToken, UUID> {
    Optional<InstagramToken> findByCompanyId(UUID companyId);
    boolean existsByCompanyId(UUID companyId);
    void deleteByCompanyId(UUID companyId);
}
