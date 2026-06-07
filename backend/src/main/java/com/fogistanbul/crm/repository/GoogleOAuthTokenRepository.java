package com.fogistanbul.crm.repository;

import com.fogistanbul.crm.entity.GoogleOAuthToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoogleOAuthTokenRepository extends JpaRepository<GoogleOAuthToken, UUID> {

    Optional<GoogleOAuthToken> findByCompanyId(UUID companyId);

    boolean existsByCompanyId(UUID companyId);

    void deleteByCompanyId(UUID companyId);

    Optional<GoogleOAuthToken> findByCompanyIdAndServiceType(UUID companyId, String serviceType);

    boolean existsByCompanyIdAndServiceType(UUID companyId, String serviceType);

    void deleteByCompanyIdAndServiceType(UUID companyId, String serviceType);
}
