package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyServiceAccessGuard {

    private final CompanyServiceRepository companyServiceRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final CompanyAccessPolicy companyAccessPolicy;

    @Transactional(readOnly = true)
    public void requireService(UUID userId, UUID companyId, ServiceCategory category) {
        companyAccessPolicy.requireMembership(userId, companyId);

        boolean active = companyServiceRepository
                .findByCompanyIdAndServiceCategory(companyId, category)
                .map(com.fogistanbul.crm.entity.CompanyService::isActive)
                .orElse(false);

        if (!active) {
            throw new AccessDeniedException("Bu hizmet bu sirket icin aktif degil: " + category.name());
        }
    }

    @Transactional(readOnly = true)
    public UUID requireClientService(UUID userId, ServiceCategory category) {
        UUID companyId = membershipRepository.findClientCompanyIdsForUser(userId).stream()
                .findFirst()
                .orElseThrow(() -> new AccessDeniedException("Bagli musteri sirketi bulunamadi"));
        requireService(userId, companyId, category);
        return companyId;
    }

    @Transactional(readOnly = true)
    public List<UUID> accessibleClientCompanies(UUID userId, ServiceCategory category) {
        return membershipRepository.findClientCompanyIdsForUser(userId).stream()
                .filter(companyId -> companyServiceRepository
                        .findByCompanyIdAndServiceCategory(companyId, category)
                        .map(com.fogistanbul.crm.entity.CompanyService::isActive)
                        .orElse(false))
                .toList();
    }
}
