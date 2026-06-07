package com.fogistanbul.crm.repository;

import com.fogistanbul.crm.entity.CompanyService;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyServiceRepository extends JpaRepository<CompanyService, UUID> {

    List<CompanyService> findByCompanyId(UUID companyId);

    List<CompanyService> findByCompanyIdAndActiveTrue(UUID companyId);

    Optional<CompanyService> findByCompanyIdAndServiceCategory(UUID companyId, ServiceCategory category);

    void deleteByCompanyId(UUID companyId);
}
