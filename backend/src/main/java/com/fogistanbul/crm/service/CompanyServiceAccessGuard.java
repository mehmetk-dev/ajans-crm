package com.fogistanbul.crm.service;

import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyServiceAccessGuard {

    private final CompanyServiceRepository companyServiceRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public void requireService(UUID userId, UUID companyId, ServiceCategory category) {
        var user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new AccessDeniedException("Kullanici bulunamadi"));

        if (user.getGlobalRole() == GlobalRole.ADMIN || user.getGlobalRole() == GlobalRole.AGENCY_STAFF) {
            return;
        }

        if (!membershipRepository.existsByUserIdAndCompanyId(userId, companyId)) {
            throw new AccessDeniedException("Bu sirket verilerine erisim yetkiniz yok");
        }

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
}
